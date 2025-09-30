import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-provider-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get('x-provider-signature');
    const body = await req.json();
    
    console.log('KYC webhook received:', { 
      provider: body.provider,
      wallet: body.wallet_address,
      status: body.status 
    });

    // Verify webhook signature (example for generic provider)
    // In production, implement specific verification for each provider:
    // - Persona: HMAC verification
    // - Veriff: Session signature verification
    // - Sumsub: Webhook secret verification
    const isValidSignature = await verifySignature(body, signature, body.provider);
    
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { wallet_address, status, provider, full_name, email, country, document_type } = body;

    if (!wallet_address || !status || !provider) {
      throw new Error('Missing required fields: wallet_address, status, provider');
    }

    // Update KYC submission in database
    const { data: existingKYC } = await supabase
      .from('kyc_submissions')
      .select('id')
      .eq('wallet_address', wallet_address.toLowerCase())
      .maybeSingle();

    let kycData;
    if (existingKYC) {
      // Update existing submission
      const { data, error } = await supabase
        .from('kyc_submissions')
        .update({
          status: status === 'approved' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: `${provider}_webhook`,
        })
        .eq('wallet_address', wallet_address.toLowerCase())
        .select()
        .single();

      if (error) throw error;
      kycData = data;
    } else {
      // Create new submission
      const { data, error } = await supabase
        .from('kyc_submissions')
        .insert({
          wallet_address: wallet_address.toLowerCase(),
          full_name: full_name || 'Unknown',
          email: email || 'unknown@example.com',
          country: country || 'Unknown',
          document_type: document_type || 'unknown',
          status: status === 'approved' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: `${provider}_webhook`,
        })
        .select()
        .single();

      if (error) throw error;
      kycData = data;
    }

    // Store webhook event for audit trail
    await supabase
      .from('webhook_events')
      .insert({
        provider,
        event_type: 'kyc_status_update',
        payload: body,
        signature,
        status: 'processed',
        processed_at: new Date().toISOString(),
      });

    // Update eligibility check
    await supabase
      .from('eligibility_checks')
      .upsert({
        wallet_address: wallet_address.toLowerCase(),
        kyc_approved: status === 'approved',
        last_checked_at: new Date().toISOString(),
        country_code: country,
      });

    console.log('KYC webhook processed successfully:', {
      wallet: wallet_address,
      status: kycData.status,
    });

    // In production, you would also:
    // 1. Call smart contract to update on-chain KYC status
    // 2. Send notification to user
    // 3. Update any caching layers

    return new Response(
      JSON.stringify({ 
        success: true, 
        kyc_id: kycData.id,
        status: kycData.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error processing KYC webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Verify webhook signature based on provider
 */
async function verifySignature(
  payload: any,
  signature: string | null,
  provider: string
): Promise<boolean> {
  // In production, implement actual signature verification per provider:
  
  // Example for HMAC-based verification (Persona, etc.)
  // const secret = Deno.env.get(`${provider.toUpperCase()}_WEBHOOK_SECRET`);
  // if (!secret || !signature) return false;
  
  // const encoder = new TextEncoder();
  // const key = await crypto.subtle.importKey(
  //   'raw',
  //   encoder.encode(secret),
  //   { name: 'HMAC', hash: 'SHA-256' },
  //   false,
  //   ['sign']
  // );
  
  // const signatureBuffer = await crypto.subtle.sign(
  //   'HMAC',
  //   key,
  //   encoder.encode(JSON.stringify(payload))
  // );
  
  // const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
  //   .map(b => b.toString(16).padStart(2, '0'))
  //   .join('');
  
  // return signature === expectedSignature;

  // For development/testing, accept all webhooks
  // In production, ALWAYS verify signatures
  console.log('⚠️ Development mode: Signature verification bypassed');
  return true;
}