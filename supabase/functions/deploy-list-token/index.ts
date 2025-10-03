import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.9.0";
import contractArtifacts from "./contract-artifacts.json" assert { type: "json" };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { network = 'baseSepolia' } = await req.json();

    console.log('🚀 Deploying LIST Platform Suite...');
    console.log('Network:', network);

    // Get RPC URL and private key
    const rpcUrl = network === 'base' 
      ? Deno.env.get('BASE_MAINNET_RPC_URL')
      : Deno.env.get('BASE_SEPOLIA_RPC_URL');
    
    const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      throw new Error('Missing RPC URL or private key configuration');
    }

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const deployerAddress = wallet.address;

    console.log('Deployer:', deployerAddress);

    const balance = await provider.getBalance(deployerAddress);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');

    if (balance < ethers.parseEther('0.01')) {
      throw new Error('Insufficient balance for deployment');
    }

    const addresses: any = {};

    // 1. Deploy LISTToken
    console.log('1. Deploying LISTToken...');
    const listTokenFactory = new ethers.ContractFactory(
      contractArtifacts.LISTToken.abi,
      contractArtifacts.LISTToken.bytecode,
      wallet
    );
    const listToken = await listTokenFactory.deploy(deployerAddress);
    await listToken.waitForDeployment();
    addresses.listToken = await listToken.getAddress();
    console.log('✅ LISTToken:', addresses.listToken);

    // 2. Deploy TierManager
    console.log('2. Deploying TierManager...');
    const tierManagerFactory = new ethers.ContractFactory(
      contractArtifacts.TierManager.abi,
      contractArtifacts.TierManager.bytecode,
      wallet
    );
    const tierManager = await tierManagerFactory.deploy(deployerAddress);
    await tierManager.waitForDeployment();
    addresses.tierManager = await tierManager.getAddress();
    console.log('✅ TierManager:', addresses.tierManager);

    // 3. Deploy StakingVault
    console.log('3. Deploying StakingVault...');
    const stakingVaultFactory = new ethers.ContractFactory(
      contractArtifacts.StakingVault.abi,
      contractArtifacts.StakingVault.bytecode,
      wallet
    );
    const stakingVault = await stakingVaultFactory.deploy(
      addresses.listToken,
      addresses.tierManager,
      deployerAddress
    );
    await stakingVault.waitForDeployment();
    addresses.stakingVault = await stakingVault.getAddress();
    console.log('✅ StakingVault:', addresses.stakingVault);

    // 4. Deploy FeeDistributor
    console.log('4. Deploying FeeDistributor...');
    const feeDistributorFactory = new ethers.ContractFactory(
      contractArtifacts.FeeDistributor.abi,
      contractArtifacts.FeeDistributor.bytecode,
      wallet
    );
    const feeDistributor = await feeDistributorFactory.deploy(
      addresses.listToken,
      addresses.stakingVault,
      deployerAddress
    );
    await feeDistributor.waitForDeployment();
    addresses.feeDistributor = await feeDistributor.getAddress();
    console.log('✅ FeeDistributor:', addresses.feeDistributor);

    // 5. Deploy GovernanceVault
    console.log('5. Deploying GovernanceVault...');
    const governanceVaultFactory = new ethers.ContractFactory(
      contractArtifacts.GovernanceVault.abi,
      contractArtifacts.GovernanceVault.bytecode,
      wallet
    );
    const governanceVault = await governanceVaultFactory.deploy(
      addresses.listToken,
      addresses.tierManager,
      addresses.stakingVault,
      deployerAddress
    );
    await governanceVault.waitForDeployment();
    addresses.governanceVault = await governanceVault.getAddress();
    console.log('✅ GovernanceVault:', addresses.governanceVault);

    // 6. Configure contracts
    console.log('6. Configuring contracts...');
    
    await (await listToken.setAuthorizedContract(addresses.stakingVault, true)).wait();
    console.log('  Authorized StakingVault in LISTToken');
    
    await (await listToken.setAuthorizedContract(addresses.feeDistributor, true)).wait();
    console.log('  Authorized FeeDistributor in LISTToken');
    
    await (await tierManager.setAuthorizedUpdater(addresses.stakingVault, true)).wait();
    console.log('  Authorized StakingVault in TierManager');
    
    await (await stakingVault.setTierManager(addresses.tierManager)).wait();
    console.log('  Set TierManager in StakingVault');
    
    await (await stakingVault.setFeeDistributor(addresses.feeDistributor)).wait();
    console.log('  Set FeeDistributor in StakingVault');
    
    await (await feeDistributor.setAuthorizedFeeSource(addresses.feeDistributor, true)).wait();
    console.log('  Authorized FeeDistributor');

    // 7. Fund reward pool
    console.log('7. Funding reward pool...');
    const rewardAmount = ethers.parseEther('3000000000');
    await (await listToken.approve(addresses.stakingVault, rewardAmount)).wait();
    await (await stakingVault.fundRewardPool(rewardAmount)).wait();
    console.log('✅ Funded with 3B LIST tokens');

    // Update database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/platform_token_config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        token_address: addresses.listToken,
        staking_vault_address: addresses.stakingVault,
        updated_at: new Date().toISOString()
      })
    });

    console.log('✅ Database updated');

    return new Response(
      JSON.stringify({
        success: true,
        addresses,
        network,
        deployer: deployerAddress,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Deployment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
