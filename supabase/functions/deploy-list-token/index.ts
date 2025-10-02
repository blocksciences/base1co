import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeploymentRequest {
  stakingRewardsAddress?: string;
  teamAddress?: string;
  liquidityAddress?: string;
  ecosystemAddress?: string;
  network?: 'baseSepolia' | 'base';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      stakingRewardsAddress,
      teamAddress,
      liquidityAddress,
      ecosystemAddress,
      network = 'baseSepolia'
    }: DeploymentRequest = await req.json();

    console.log('🚀 Starting LIST Token deployment...');

    // Get RPC URL and private key from environment
    const rpcUrl = network === 'base' 
      ? Deno.env.get('BASE_RPC_URL') || 'https://mainnet.base.org'
      : Deno.env.get('BASE_SEPOLIA_RPC_URL') || 'https://sepolia.base.org';
    
    const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured');
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const deployerAddress = wallet.address;

    console.log('Deployer address:', deployerAddress);
    const balance = await provider.getBalance(deployerAddress);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');

    // Use deployer as fallback for allocation addresses
    const stakingAddr = stakingRewardsAddress || deployerAddress;
    const teamAddr = teamAddress || deployerAddress;
    const liquidityAddr = liquidityAddress || deployerAddress;
    const ecosystemAddr = ecosystemAddress || deployerAddress;

    // Load contract artifacts
    const artifactsPath = './contract-artifacts.json';
    const artifactsData = await Deno.readTextFile(artifactsPath);
    const artifacts = JSON.parse(artifactsData);

    if (!artifacts.LISTToken || !artifacts.PlatformStakingVault) {
      throw new Error('Contract artifacts not found. Please compile contracts first.');
    }

    // Deploy LIST Token
    console.log('Deploying LIST Token...');
    const LISTTokenFactory = new ethers.ContractFactory(
      artifacts.LISTToken.abi,
      artifacts.LISTToken.bytecode,
      wallet
    );

    const listTokenDeployment = await LISTTokenFactory.deploy(
      stakingAddr,
      teamAddr,
      liquidityAddr,
      ecosystemAddr
    );
    await listTokenDeployment.waitForDeployment();
    const listTokenAddress = await listTokenDeployment.getAddress();
    console.log('✅ LIST Token deployed:', listTokenAddress);

    // Create contract instance for interaction
    const listToken = new ethers.Contract(listTokenAddress, artifacts.LISTToken.abi, wallet);

    // Get token details
    const [totalSupply, symbol, decimals] = await Promise.all([
      listToken.totalSupply(),
      listToken.symbol(),
      listToken.decimals()
    ]);

    console.log('Token:', symbol, '| Supply:', ethers.formatUnits(totalSupply, decimals));

    // Deploy Staking Vault
    console.log('Deploying Platform Staking Vault...');
    const StakingVaultFactory = new ethers.ContractFactory(
      artifacts.PlatformStakingVault.abi,
      artifacts.PlatformStakingVault.bytecode,
      wallet
    );

    const stakingVaultDeployment = await StakingVaultFactory.deploy(listTokenAddress);
    await stakingVaultDeployment.waitForDeployment();
    const stakingVaultAddress = await stakingVaultDeployment.getAddress();
    console.log('✅ Staking Vault deployed:', stakingVaultAddress);

    // Create contract instance for interaction
    const stakingVault = new ethers.Contract(stakingVaultAddress, artifacts.PlatformStakingVault.abi, wallet);

    // Fund reward pool if deployer controls staking address
    let rewardPoolFunded = false;
    if (stakingAddr === deployerAddress) {
      console.log('Funding reward pool...');
      const stakingBalance = await listToken.balanceOf(deployerAddress);
      
      // Approve vault
      const approveTx = await listToken.approve(stakingVaultAddress, stakingBalance);
      await approveTx.wait();
      
      // Fund pool
      const fundTx = await stakingVault.fundRewardPool(stakingBalance);
      await fundTx.wait();
      
      rewardPoolFunded = true;
      console.log('✅ Reward pool funded:', ethers.formatUnits(stakingBalance, decimals), symbol);
    }

    const rewardPool = await stakingVault.rewardPool();

    // Update database with contract addresses
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/platform_token_config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        token_address: listTokenAddress,
        staking_vault_address: stakingVaultAddress,
        updated_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      console.error('Failed to update database:', await updateResponse.text());
    } else {
      console.log('✅ Database updated');
    }

    return new Response(
      JSON.stringify({
        success: true,
        contracts: {
          listToken: {
            address: listTokenAddress,
            symbol,
            decimals: Number(decimals),
            totalSupply: ethers.formatUnits(totalSupply, decimals),
          },
          stakingVault: {
            address: stakingVaultAddress,
            rewardPool: ethers.formatUnits(rewardPool, decimals),
            funded: rewardPoolFunded,
          }
        },
        network,
        deployer: deployerAddress,
        allocations: {
          stakingRewards: stakingAddr,
          team: teamAddr,
          liquidity: liquidityAddr,
          ecosystem: ecosystemAddr,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Deployment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
