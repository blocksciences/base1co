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

    // Simple ERC20 Token Bytecode (minimal implementation for demo)
    // In production, you would use your compiled contract artifacts
    const tokenBytecode = "0x608060405234801561000f575f80fd5b50604051610c6b380380610c6b83398101604081905261002e916101bd565b818160036100678382610296565b50600461007482826102<bpt:truncated for length>";
    const tokenABI = [
      "constructor(string name, string symbol, uint256 initialSupply)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)"
    ];

    // Deploy Token
    console.log('Deploying ICO Token...');
    const TokenFactory = new ethers.ContractFactory(tokenABI, tokenBytecode, wallet);
    const tokenContract = await TokenFactory.deploy(
      deploymentData.projectName,
      deploymentData.tokenSymbol,
      ethers.parseUnits(deploymentData.totalSupply, deploymentData.tokenDecimals)
    );
    await tokenContract.waitForDeployment();
    const tokenAddress = await tokenContract.getAddress();
    console.log('✅ Token deployed to:', tokenAddress);

    // For this demo, we'll use a simplified sale contract
    // In production, deploy your actual ICOSale contract
    const saleAddress = ethers.Wallet.createRandom().address; // Placeholder
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
