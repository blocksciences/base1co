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

    // Validate network
    const network = await provider.getNetwork();
    const expectedChainId = 84532n; // Base Sepolia
    if (network.chainId !== expectedChainId) {
      throw new Error(`Wrong network. Expected Base Sepolia (${expectedChainId}), got ${network.chainId}`);
    }

    // Check balance with retry to handle RPC caching issues
    let balance = BigInt(0);
    const maxBalanceRetries = 3;
    for (let attempt = 1; attempt <= maxBalanceRetries; attempt++) {
      try {
        // Force latest block to avoid stale RPC cache
        const latestBlock = await provider.getBlockNumber();
        console.log(`Checking balance at block ${latestBlock} (attempt ${attempt}/${maxBalanceRetries})...`);
        balance = await provider.getBalance(wallet.address, 'latest');
        console.log('Balance:', ethers.formatEther(balance), 'ETH');
        
        const minRequired = ethers.parseEther('0.05');
        if (balance >= minRequired) {
          break; // Sufficient balance found
        }
        
        if (attempt < maxBalanceRetries) {
          console.log('Balance below minimum, retrying in 3 seconds in case of RPC cache lag...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          throw new Error(`Insufficient ETH balance. Have: ${ethers.formatEther(balance)} ETH, Need at least 0.05 ETH for deployment. If you recently funded this wallet, please wait a few minutes for the blockchain to sync.`);
        }
      } catch (error: any) {
        if (attempt === maxBalanceRetries) {
          throw error;
        }
        console.log(`Balance check failed, retrying... (${error.message})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Validate tokenomics
    const softCap = parseFloat(deploymentData.softCap);
    const hardCap = parseFloat(deploymentData.hardCap);
    const minContribution = parseFloat(deploymentData.minContribution);
    const maxContribution = parseFloat(deploymentData.maxContribution);
    const tokenPrice = parseFloat(deploymentData.tokenPrice);
    const totalSupply = parseFloat(deploymentData.totalSupply);

    // Soft cap must be less than hard cap
    if (softCap >= hardCap) {
      throw new Error('Soft cap must be less than hard cap');
    }

    // Min must be less than max contribution
    if (minContribution > maxContribution) {
      throw new Error('Min contribution cannot exceed max contribution');
    }

    // Warn if max contribution is too restrictive
    const minInvestorsNeeded = Math.ceil(hardCap / maxContribution);
    if (minInvestorsNeeded > 100) {
      console.warn(`⚠️ Will require at least ${minInvestorsNeeded} investors to reach hard cap`);
    }

    // Check if tokenomics make sense
    const tokensForSale = totalSupply * 0.4; // 40% allocated to sale
    const impliedMaxRaise = tokensForSale * tokenPrice;
    if (impliedMaxRaise < hardCap) {
      throw new Error(`Token price too low for hard cap target. At current price, max raise would be ${impliedMaxRaise.toFixed(4)} ETH, but hard cap is ${hardCap} ETH`);
    }

    // Convert and validate dates
    const startTime = Math.floor(new Date(deploymentData.startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(deploymentData.endDate).getTime() / 1000);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Start time must be at least 5 minutes in the future
    const minStartTime = currentTime + 300;
    if (startTime < minStartTime) {
      throw new Error(`Start time must be at least 5 minutes in the future. Current time: ${new Date(currentTime * 1000).toISOString()}, Your start time: ${new Date(startTime * 1000).toISOString()}`);
    }

    // End must be after start
    if (endTime <= startTime) {
      throw new Error('End date must be after start date');
    }

    // Minimum ICO duration: 24 hours
    const minDuration = 24 * 60 * 60; // 24 hours in seconds
    if (endTime - startTime < minDuration) {
      throw new Error('ICO must run for at least 24 hours');
    }

    console.log('\n📦 Deploying contracts...\n');

    // Helper function to deploy with retry logic
    async function deployWithRetry(deployFunction: () => Promise<any>, contractName: string, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await deployFunction();
        } catch (error: any) {
          const isRateLimited = error.code === 'RATE_LIMITED' || 
                               error.code === 429 || 
                               error.message?.includes('rate limit') ||
                               error.message?.includes('too many requests');
          
          if (isRateLimited && attempt < maxRetries) {
            const waitTime = attempt * 2;
            console.log(`⚠️ Rate limited deploying ${contractName}, retrying in ${waitTime} seconds... (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            continue;
          }
          throw error;
        }
      }
    }

    // 1. Deploy KYC Registry
    console.log('1/5 Deploying KYC Registry...');
    const kycRegistry = await deployWithRetry(async () => {
      const KYCFactory = new ethers.ContractFactory(
        contractArtifacts.KYCRegistry.abi,
        contractArtifacts.KYCRegistry.bytecode,
        wallet
      );
      const contract = await KYCFactory.deploy();
      await contract.waitForDeployment();
      return contract;
    }, 'KYC Registry');
    const kycAddress = await kycRegistry.getAddress();
    console.log('✅ KYC Registry:', kycAddress);

    // 2. Deploy Token
    console.log('\n2/5 Deploying Token...');
    const token = await deployWithRetry(async () => {
      const TokenFactory = new ethers.ContractFactory(
        contractArtifacts.ICOToken.abi,
        contractArtifacts.ICOToken.bytecode,
        wallet
      );
      const contract = await TokenFactory.deploy(
        deploymentData.projectName,
        deploymentData.tokenSymbol,
        BigInt(deploymentData.totalSupply),
        deploymentData.tokenDecimals
      );
      await contract.waitForDeployment();
      return contract;
    }, 'Token');
    const tokenAddress = await token.getAddress();
    console.log('✅ Token:', tokenAddress);

    // 3. Deploy Sale Contract
    console.log('\n3/5 Deploying Sale Contract...');
    const sale = await deployWithRetry(async () => {
      const SaleFactory = new ethers.ContractFactory(
        contractArtifacts.ICOSale.abi,
        contractArtifacts.ICOSale.bytecode,
        wallet
      );
      const contract = await SaleFactory.deploy(
        tokenAddress,
        kycAddress,
        ethers.parseEther(deploymentData.tokenPrice),
        ethers.parseEther(deploymentData.softCap),
        ethers.parseEther(deploymentData.hardCap),
        ethers.parseEther(deploymentData.minContribution),
        ethers.parseEther(deploymentData.maxContribution),
        ethers.parseEther(deploymentData.maxContribution),
        startTime,
        endTime
      );
      await contract.waitForDeployment();
      return contract;
    }, 'Sale Contract');
    const saleAddress = await sale.getAddress();
    console.log('✅ Sale Contract:', saleAddress);

    // 4. Deploy Vesting Vault
    console.log('\n4/5 Deploying Vesting Vault...');
    const vestingVault = await deployWithRetry(async () => {
      const VestingFactory = new ethers.ContractFactory(
        contractArtifacts.VestingVault.abi,
        contractArtifacts.VestingVault.bytecode,
        wallet
      );
      const contract = await VestingFactory.deploy(tokenAddress);
      await contract.waitForDeployment();
      return contract;
    }, 'Vesting Vault');
    const vestingAddress = await vestingVault.getAddress();
    console.log('✅ Vesting Vault:', vestingAddress);

    // 5. Deploy Liquidity Locker
    console.log('\n5/5 Deploying Liquidity Locker...');
    const liquidityLocker = await deployWithRetry(async () => {
      const LockerFactory = new ethers.ContractFactory(
        contractArtifacts.LiquidityLocker.abi,
        contractArtifacts.LiquidityLocker.bytecode,
        wallet
      );
      const contract = await LockerFactory.deploy();
      await contract.waitForDeployment();
      return contract;
    }, 'Liquidity Locker');
    const lockerAddress = await liquidityLocker.getAddress();
    console.log('✅ Liquidity Locker:', lockerAddress);

    // 6. Transfer 40% of tokens to sale contract
    console.log('\n6. Allocating tokens to sale...');
    // Calculate 40% of total supply WITH decimals (since tokens are already minted with decimals by the contract)
    const totalSupplyWithDecimals = ethers.parseUnits(deploymentData.totalSupply, deploymentData.tokenDecimals);
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
