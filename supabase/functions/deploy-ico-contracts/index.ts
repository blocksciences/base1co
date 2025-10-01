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

// ICOLaunchpad ABI (only the deploySale function we need)
const LAUNCHPAD_ABI = [
  "function deploySale(string memory tokenName, string memory tokenSymbol, uint256 initialSupply, uint8 tokenDecimals, uint256 tokenPrice, uint256 softCap, uint256 hardCap, uint256 minContribution, uint256 maxContribution, uint256 maxPerWallet, uint256 startTime, uint256 endTime) external returns (uint256 saleId)",
  "function sales(uint256 saleId) external view returns (address saleContract, address tokenContract, address kycRegistry, address vestingVault, address liquidityLocker, address creator, uint256 deployedAt, bool active)"
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

    // Get deployment credentials from secrets
    const privateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('BASE_SEPOLIA_RPC_URL');
    const launchpadAddress = Deno.env.get('ICO_LAUNCHPAD_ADDRESS');

    if (!privateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured. Please add it in project settings.');
    }

    if (!rpcUrl) {
      throw new Error('BASE_SEPOLIA_RPC_URL not configured. Please add a valid Base Sepolia RPC URL.');
    }

    if (!launchpadAddress) {
      throw new Error('ICO_LAUNCHPAD_ADDRESS not configured. Please deploy the launchpad factory first using: cd contracts && npx hardhat run scripts/deploy-launchpad.ts --network baseSepolia');
    }

    console.log('Connecting to Base Sepolia...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getNetwork();
    console.log('✅ Connected to Base Sepolia');

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Deployer wallet:', wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

    if (balance === 0n) {
      throw new Error('Deployer wallet has no ETH. Please fund it with Base Sepolia ETH from https://www.alchemy.com/faucets/base-sepolia');
    }

    // Connect to the ICOLaunchpad factory contract
    console.log('Connecting to ICOLaunchpad at:', launchpadAddress);
    const launchpad = new ethers.Contract(launchpadAddress, LAUNCHPAD_ABI, wallet);

    // Convert parameters to proper format
    const startTime = Math.floor(new Date(deploymentData.startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(deploymentData.endDate).getTime() / 1000);
    
    console.log('Deploying ICO via launchpad...');
    console.log('Parameters:', {
      tokenName: deploymentData.projectName,
      tokenSymbol: deploymentData.tokenSymbol,
      supply: deploymentData.totalSupply,
      decimals: deploymentData.tokenDecimals,
      price: deploymentData.tokenPrice,
      softCap: deploymentData.softCap,
      hardCap: deploymentData.hardCap,
      startTime,
      endTime
    });

    // Deploy ICO through the launchpad factory
    const tx = await launchpad.deploySale(
      deploymentData.projectName,
      deploymentData.tokenSymbol,
      ethers.parseUnits(deploymentData.totalSupply, deploymentData.tokenDecimals),
      deploymentData.tokenDecimals,
      ethers.parseEther(deploymentData.tokenPrice),
      ethers.parseEther(deploymentData.softCap),
      ethers.parseEther(deploymentData.hardCap),
      ethers.parseEther(deploymentData.minContribution),
      ethers.parseEther(deploymentData.maxContribution),
      ethers.parseEther(deploymentData.maxContribution), // maxPerWallet same as maxContribution
      startTime,
      endTime
    );

    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');

    // Get the saleId from the event
    const saleDeployedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = launchpad.interface.parseLog(log);
        return parsed?.name === 'SaleDeployed';
      } catch {
        return false;
      }
    });

    if (!saleDeployedEvent) {
      throw new Error('Could not find SaleDeployed event in transaction');
    }

    const parsedEvent = launchpad.interface.parseLog(saleDeployedEvent);
    const saleId = parsedEvent?.args?.saleId;

    // Get the deployed contract addresses
    const saleInfo = await launchpad.sales(saleId);
    
    const tokenAddress = saleInfo.tokenContract;
    const saleAddress = saleInfo.saleContract;
    const kycRegistryAddress = saleInfo.kycRegistry;
    const vestingVaultAddress = saleInfo.vestingVault;
    const liquidityLockerAddress = saleInfo.liquidityLocker;

    console.log('✅ ICO Deployed!');
    console.log('Sale ID:', saleId.toString());
    console.log('Token:', tokenAddress);
    console.log('Sale:', saleAddress);
    console.log('KYC Registry:', kycRegistryAddress);
    console.log('Vesting Vault:', vestingVaultAddress);
    console.log('Liquidity Locker:', liquidityLockerAddress);
    
    // Create deployment record in database
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
        kyc_registry_address: kycRegistryAddress,
        vesting_vault_address: vestingVaultAddress,
        liquidity_locker_address: liquidityLockerAddress,
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
          sale_id: saleId.toString(),
          token_address: tokenAddress,
          sale_address: saleAddress,
          kyc_registry: kycRegistryAddress,
          vesting_vault: vestingVaultAddress,
          liquidity_locker: liquidityLockerAddress,
          tx_hash: tx.hash,
        },
      });

    // Return deployment results
    const response = {
      success: true,
      projectId: project.id,
      message: 'ICO contracts deployed successfully!',
      saleId: saleId.toString(),
      deployedAddresses: {
        token: tokenAddress,
        sale: saleAddress,
        kycRegistry: kycRegistryAddress,
        vestingVault: vestingVaultAddress,
        liquidityLocker: liquidityLockerAddress,
      },
      explorerUrls: {
        token: `https://sepolia.basescan.org/address/${tokenAddress}`,
        sale: `https://sepolia.basescan.org/address/${saleAddress}`,
      },
      transactionHash: tx.hash,
      explorerTx: `https://sepolia.basescan.org/tx/${tx.hash}`,
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
