import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeploymentRequest {
  projectName: string;
  tokenSymbol: string;
  totalSupply: string;
  tokenDecimals: number;
  tokenPrice: string;
  softCap: string;
  hardCap: string;
  minContribution: string;
  maxContribution: string;
  startDate: string;
  endDate: string;
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

    const deploymentData: DeploymentRequest = await req.json();
    
    // Check if the deployer address is an admin wallet
    const { data: isAdmin } = await supabaseClient
      .rpc('is_wallet_admin', { check_wallet_address: deploymentData.deployerAddress });

    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin wallets can deploy contracts');
    }
    
    console.log('Deployment request:', deploymentData);

    // This edge function now ONLY creates the database record
    // No contract deployment happens here - that's done via hardhat separately
    console.log('Creating ICO project record in database...');
    
    // Generate placeholder addresses for the project
    const placeholderTokenAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    const placeholderSaleAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    
    console.log('Placeholder token address:', placeholderTokenAddress);
    console.log('Placeholder sale address:', placeholderSaleAddress);
    
    // Create deployment record in database with contract addresses
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        name: deploymentData.projectName,
        symbol: deploymentData.tokenSymbol,
        description: `ICO for ${deploymentData.projectName}`,
        goal_amount: parseFloat(deploymentData.hardCap),
        start_date: deploymentData.startDate,
        end_date: deploymentData.endDate,
        status: 'active',
        created_by: deploymentData.deployerAddress,
        contract_address: placeholderSaleAddress,
      })
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Log successful project creation
    await supabaseClient
      .from('platform_activities')
      .insert({
        activity_type: 'contract_deployment',
        action_text: `Created ICO project for ${deploymentData.projectName}`,
        status: 'completed',
        user_address: deploymentData.deployerAddress,
        metadata: {
          project_id: project.id,
          token_address: placeholderTokenAddress,
          sale_address: placeholderSaleAddress,
          token_symbol: deploymentData.tokenSymbol,
          hard_cap: deploymentData.hardCap,
        },
      });

    // Return deployment results
    const response = {
      success: true,
      projectId: project.id,
      message: 'ICO project created successfully! Ready for contract deployment.',
      notice: 'Contract addresses are currently placeholders. Deploy real contracts using hardhat - see /contracts/DEPLOYMENT_GUIDE.md',
      deploymentSteps: [
        '1. ICO project created in database ✅',
        '2. Next: Deploy contracts using hardhat (cd contracts && npx hardhat run scripts/deploy-ico.ts --network baseSepolia)',
        '3. After deployment: Update contract addresses via API or database',
      ],
      placeholderAddresses: {
        token: placeholderTokenAddress,
        sale: placeholderSaleAddress,
      },
      projectDetails: {
        name: deploymentData.projectName,
        symbol: deploymentData.tokenSymbol,
        totalSupply: deploymentData.totalSupply,
        hardCap: deploymentData.hardCap,
        softCap: deploymentData.softCap,
      },
      deployer: deploymentData.deployerAddress,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
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
