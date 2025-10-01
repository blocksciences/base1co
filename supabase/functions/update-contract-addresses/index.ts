import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateRequest {
  projectId: string;
  tokenAddress: string;
  saleAddress: string;
  kycRegistryAddress?: string;
  vestingVaultAddress?: string;
  liquidityLockerAddress?: string;
  deployerAddress: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const updateData: UpdateRequest = await req.json();
    
    console.log('Updating contract addresses for project:', updateData.projectId);

    // Verify the deployer is an admin
    const { data: isAdmin } = await supabaseClient
      .rpc('is_wallet_admin', { check_wallet_address: updateData.deployerAddress });

    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin wallets can update contract addresses');
    }

    // Update the project with real contract addresses
    const { data: project, error: updateError } = await supabaseClient
      .from('projects')
      .update({
        contract_address: updateData.saleAddress,
        kyc_registry_address: updateData.kycRegistryAddress,
        vesting_vault_address: updateData.vestingVaultAddress,
        liquidity_locker_address: updateData.liquidityLockerAddress,
      })
      .eq('id', updateData.projectId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the update
    await supabaseClient
      .from('platform_activities')
      .insert({
        activity_type: 'contract_update',
        action_text: `Updated contract addresses for ${project.name}`,
        status: 'completed',
        user_address: updateData.deployerAddress,
        metadata: {
          project_id: project.id,
          token_address: updateData.tokenAddress,
          sale_address: updateData.saleAddress,
          kyc_registry_address: updateData.kycRegistryAddress,
          vesting_vault_address: updateData.vestingVaultAddress,
          liquidity_locker_address: updateData.liquidityLockerAddress,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contract addresses updated successfully',
        project: project,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Update error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'An unknown error occurred',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
