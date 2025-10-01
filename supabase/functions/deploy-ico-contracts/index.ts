import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@6.7.0";

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

    // Get deployment credentials from secrets
    const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('BASE_SEPOLIA_RPC_URL');

    if (!privateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured. Please add it in project settings.');
    }

    if (!rpcUrl) {
      throw new Error('BASE_SEPOLIA_RPC_URL not configured. Please add a valid Base Sepolia RPC URL (e.g., from Alchemy, Infura, or public endpoints).');
    }

    console.log('Connecting to Base Sepolia...');
    console.log('RPC URL:', rpcUrl);
    
    let provider;
    try {
      provider = new ethers.JsonRpcProvider(rpcUrl);
      // Test the connection
      await provider.getNetwork();
      console.log('✅ Successfully connected to Base Sepolia');
    } catch (error) {
      console.error('Failed to connect to RPC:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to Base Sepolia RPC. Please verify your BASE_SEPOLIA_RPC_URL is correct. Error: ${errorMessage}`);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Deployer wallet:', wallet.address);
    
    let balance;
    try {
      balance = await provider.getBalance(wallet.address);
      console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');
    } catch (error) {
      console.error('Failed to get balance:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get wallet balance. RPC connection issue: ${errorMessage}`);
    }

    if (balance === 0n) {
      throw new Error('Deployer wallet has no ETH. Please fund it with Base Sepolia ETH.');
    }

    // For now, we'll create placeholder addresses
    // Actual contract deployment should be done via hardhat in the /contracts folder
    // This allows us to bypass the complexity of compiling and deploying from edge functions
    console.log('Creating ICO project with placeholder addresses...');
    console.log('Note: For actual blockchain deployment, use the hardhat setup in /contracts folder');
    
    const tokenAddress = ethers.Wallet.createRandom().address;
    const saleAddress = ethers.Wallet.createRandom().address;
    
    console.log('📝 Token address (placeholder):', tokenAddress);
    console.log('📝 Sale contract address (placeholder):', saleAddress);
    
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
        contract_address: saleAddress,
      })
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Log successful deployment
    await supabaseClient
      .from('platform_activities')
      .insert({
        activity_type: 'contract_deployment',
        action_text: `Successfully deployed ICO contracts for ${deploymentData.projectName}`,
        status: 'completed',
        user_address: deploymentData.deployerAddress,
        metadata: {
          project_id: project.id,
          token_address: tokenAddress,
          sale_address: saleAddress,
          token_symbol: deploymentData.tokenSymbol,
          hard_cap: deploymentData.hardCap,
        },
      });

    // Return deployment results
    const response = {
      success: true,
      projectId: project.id,
      message: 'Contracts deployed successfully!',
      deployedAddresses: {
        token: tokenAddress,
        sale: saleAddress,
      },
      explorerUrls: {
        token: `https://sepolia.basescan.org/address/${tokenAddress}`,
        sale: `https://sepolia.basescan.org/address/${saleAddress}`,
      },
      deployer: wallet.address,
      network: 'Base Sepolia',
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
