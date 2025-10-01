import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@6.7.0";
// @deno-types="./contract-artifacts.json"
import contractArtifacts from "./contract-artifacts.json" with { type: "json" };

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

const LAUNCHPAD_ABI = [
  "function registerSale(address saleContract, address tokenContract, address kycRegistry, address vestingVault, address liquidityLocker, address creator) external returns (uint256 saleId)",
  "event SaleDeployed(uint256 indexed saleId, address indexed creator, address saleContract, address tokenContract, address kycRegistry, uint256 timestamp)"
];

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

    // Get deployment credentials
    const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('BASE_SEPOLIA_RPC_URL');
    const launchpadAddress = Deno.env.get('ICO_LAUNCHPAD_ADDRESS');

    if (!privateKey || !rpcUrl || !launchpadAddress) {
      throw new Error('Missing required environment variables. Please configure DEPLOYER_PRIVATE_KEY, BASE_SEPOLIA_RPC_URL, and ICO_LAUNCHPAD_ADDRESS');
    }

    console.log('Connecting to Base Sepolia...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Deployer:', wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
      throw new Error('Insufficient ETH balance. Please fund the deployer wallet.');
    }

    // Convert parameters
    const startTime = Math.floor(new Date(deploymentData.startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(deploymentData.endDate).getTime() / 1000);
    const totalSupplyWithDecimals = ethers.parseUnits(deploymentData.totalSupply, deploymentData.tokenDecimals);

    console.log('\n📦 Deploying contracts...\n');

    // 1. Deploy KYC Registry
    console.log('1/5 Deploying KYC Registry...');
    const KYCFactory = new ethers.ContractFactory(
      contractArtifacts.KYCRegistry.abi,
      contractArtifacts.KYCRegistry.bytecode,
      wallet
    );
    const kycRegistry = await KYCFactory.deploy();
    await kycRegistry.waitForDeployment();
    const kycAddress = await kycRegistry.getAddress();
    console.log('✅ KYC Registry:', kycAddress);

    // 2. Deploy Token
    console.log('\n2/5 Deploying Token...');
    const TokenFactory = new ethers.ContractFactory(
      contractArtifacts.ICOToken.abi,
      contractArtifacts.ICOToken.bytecode,
      wallet
    );
    const token = await TokenFactory.deploy(
      deploymentData.projectName,
      deploymentData.tokenSymbol,
      deploymentData.totalSupply,
      deploymentData.tokenDecimals
    );
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log('✅ Token:', tokenAddress);

    // 3. Deploy Sale Contract
    console.log('\n3/5 Deploying Sale Contract...');
    const SaleFactory = new ethers.ContractFactory(
      contractArtifacts.ICOSale.abi,
      contractArtifacts.ICOSale.bytecode,
      wallet
    );
    const sale = await SaleFactory.deploy(
      tokenAddress,
      kycAddress,
      ethers.parseEther(deploymentData.tokenPrice),
      ethers.parseEther(deploymentData.softCap),
      ethers.parseEther(deploymentData.hardCap),
      ethers.parseEther(deploymentData.minContribution),
      ethers.parseEther(deploymentData.maxContribution),
      ethers.parseEther(deploymentData.maxContribution), // maxPerWallet
      startTime,
      endTime
    );
    await sale.waitForDeployment();
    const saleAddress = await sale.getAddress();
    console.log('✅ Sale Contract:', saleAddress);

    // 4. Deploy Vesting Vault
    console.log('\n4/5 Deploying Vesting Vault...');
    const VestingFactory = new ethers.ContractFactory(
      contractArtifacts.VestingVault.abi,
      contractArtifacts.VestingVault.bytecode,
      wallet
    );
    const vestingVault = await VestingFactory.deploy(tokenAddress);
    await vestingVault.waitForDeployment();
    const vestingAddress = await vestingVault.getAddress();
    console.log('✅ Vesting Vault:', vestingAddress);

    // 5. Deploy Liquidity Locker
    console.log('\n5/5 Deploying Liquidity Locker...');
    const LockerFactory = new ethers.ContractFactory(
      contractArtifacts.LiquidityLocker.abi,
      contractArtifacts.LiquidityLocker.bytecode,
      wallet
    );
    const liquidityLocker = await LockerFactory.deploy();
    await liquidityLocker.waitForDeployment();
    const lockerAddress = await liquidityLocker.getAddress();
    console.log('✅ Liquidity Locker:', lockerAddress);

    // 6. Transfer 40% of tokens to sale contract
    console.log('\n6. Allocating tokens to sale...');
    const saleAllocation = (totalSupplyWithDecimals * BigInt(40)) / BigInt(100);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function transfer(address to, uint256 amount) external returns (bool)"],
      wallet
    );
    const transferTx = await tokenContract.transfer(saleAddress, saleAllocation);
    await transferTx.wait();
    console.log('✅ Transferred', ethers.formatUnits(saleAllocation, deploymentData.tokenDecimals), 'tokens to sale');

    // 7. Register with launchpad
    console.log('\n7. Registering with launchpad...');
    const launchpad = new ethers.Contract(launchpadAddress, LAUNCHPAD_ABI, wallet);
    const registerTx = await launchpad.registerSale(
      saleAddress,
      tokenAddress,
      kycAddress,
      vestingAddress,
      lockerAddress,
      wallet.address
    );
    const receipt = await registerTx.wait();
    
    // Extract saleId from event
    let saleId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = launchpad.interface.parseLog(log);
        if (parsed?.name === 'SaleDeployed') {
          saleId = parsed.args.saleId.toString();
          break;
        }
      } catch {}
    }
    console.log('✅ Registered with Sale ID:', saleId);

    // 8. Save to database
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
        kyc_registry_address: kycAddress,
        vesting_vault_address: vestingAddress,
        liquidity_locker_address: lockerAddress,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Log activity
    await supabaseClient.from('platform_activities').insert({
      activity_type: 'contract_deployment',
      action_text: `Deployed ICO for ${deploymentData.projectName}`,
      status: 'completed',
      user_address: deploymentData.deployerAddress,
      metadata: {
        project_id: project.id,
        sale_id: saleId,
        contracts: {
          token: tokenAddress,
          sale: saleAddress,
          kyc: kycAddress,
          vesting: vestingAddress,
          locker: lockerAddress
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      projectId: project.id,
      saleId,
      message: 'ICO deployed successfully!',
      deployedAddresses: {
        token: tokenAddress,
        sale: saleAddress,
        kycRegistry: kycAddress,
        vestingVault: vestingAddress,
        liquidityLocker: lockerAddress,
      },
      explorerUrls: {
        token: `https://sepolia.basescan.org/address/${tokenAddress}`,
        sale: `https://sepolia.basescan.org/address/${saleAddress}`,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Deployment error:', error);
    return new Response(JSON.stringify({
      error: error?.message || 'Deployment failed',
      success: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
