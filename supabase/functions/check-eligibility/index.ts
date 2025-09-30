import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { walletAddress, ipAddress } = await req.json();

    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    console.log('Checking eligibility for:', walletAddress);

    // Check KYC status
    const { data: kycData } = await supabase
      .from('kyc_submissions')
      .select('status, country')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('status', 'approved')
      .maybeSingle();

    const kycApproved = !!kycData;

    // Check for geo-blocking (example: block certain countries)
    const blockedCountries = ['US', 'CN', 'IR', 'KP', 'SY']; // Example blocked list
    const geoBlocked = kycData?.country && blockedCountries.includes(kycData.country);

    // Perform basic sanctions screening (in production, integrate with actual screening API)
    const sanctionsCheck = !geoBlocked; // Simplified for now

    // Store eligibility check
    const { data: eligibilityData, error: eligibilityError } = await supabase
      .from('eligibility_checks')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        kyc_approved: kycApproved,
        geo_blocked: geoBlocked || false,
        sanctions_check: sanctionsCheck,
        ip_address: ipAddress,
        country_code: kycData?.country || null,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (eligibilityError) {
      console.error('Error storing eligibility check:', eligibilityError);
    }

    const eligible = kycApproved && !geoBlocked && sanctionsCheck;

    console.log('Eligibility result:', { eligible, kycApproved, geoBlocked, sanctionsCheck });

    return new Response(
      JSON.stringify({
        eligible,
        kyc_approved: kycApproved,
        geo_blocked: geoBlocked || false,
        sanctions_check: sanctionsCheck,
        country: kycData?.country || null,
        message: eligible 
          ? 'Eligible to participate' 
          : !kycApproved 
          ? 'KYC not approved' 
          : geoBlocked 
          ? 'Region is blocked' 
          : 'Failed sanctions screening'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error checking eligibility:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});