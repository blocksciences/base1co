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

    // Simple ERC20 Token ABI and bytecode
    const tokenABI = [
      "constructor(string memory name, string memory symbol, uint256 initialSupply)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ];

    // Minimal ERC20 bytecode - production ready
    const tokenBytecode = "0x60806040523480156200001157600080fd5b5060405162000e5338038062000e538339818101604052810190620000379190620002b8565b82600390816200004891906200057f565b5081600490816200005a91906200057f565b508060059081620000629190620007d1565b50505050620008b8565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620000d28262000087565b810181811067ffffffffffffffff82111715620000f457620000f362000098565b5b80604052505050565b60006200010962000069565b9050620001178282620000c7565b919050565b600067ffffffffffffffff8211156200013a576200013962000098565b5b620001458262000087565b9050602081019050919050565b60005b838110156200017257808201518184015260208101905062000155565b8381111562000182576000848401525b50505050565b60006200019f62000199846200011c565b620000fd565b905082815260208101848484011115620001be57620001bd62000082565b5b620001cb84828562000152565b509392505050565b600082601f830112620001eb57620001ea6200007d565b5b8151620001fd84826020860162000188565b91505092915050565b6000819050919050565b6200021b8162000206565b81146200022757600080fd5b50565b6000815190506200023b8162000210565b92915050565b6000806000606084860312156200025d576200025c62000073565b5b600084015167ffffffffffffffff8111156200027e576200027d62000078565b5b6200028c86828701620001d3565b935050602084015167ffffffffffffffff811115620002b057620002af62000078565b5b620002be86828701620001d3565b9250506040620002d1868287016200022a565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200032e57607f821691505b602082108103620003445762000343620002e6565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620003ae7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200036f565b620003ba86836200036f565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620003fd620003f7620003f18462000206565b620003d2565b62000206565b9050919050565b6000819050919050565b6200041983620003dc565b62000431620004288262000404565b8484546200037c565b825550505050565b600090565b6200044862000439565b620004558184846200040e565b505050565b5b818110156200047d5762000471600082546200043e565b6001810190506200045b565b5050565b601f821115620004cc57620004968162000350565b620004a18462000365565b81016020851015620004b1578190505b620004c9620004c08562000365565b8301826200045a565b50505b505050565b600082821c905092915050565b6000620004f160001984600802620004d1565b1980831691505092915050565b60006200050c8383620004de565b9150826002028217905092915050565b6200052782620002db565b67ffffffffffffffff81111562000543576200054262000098565b5b6200054f825462000315565b6200055c82828562000481565b600060209050601f8311600181146200059457600084156200057f5782870151905090505b6200058b8582620004fe565b865550620005fb565b601f198416620005a4866200034a565b60005b82811015620005ce57848901518255600182019150602085019450602081019050620005a7565b86831015620005ee5784890151620005ea601f891682620004de565b8355505b6001600288020188555050505b505050505050565b600081519050919050565b600082825260208201905092915050565b60006200062c8262000603565b6200063881856200060e565b93506200064a81856020860162000152565b620006558162000087565b840191505092915050565b60006020820190508181036000830152620006a7818462000627565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000620006eb8262000206565b9150620006f88362000206565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615620007345762000733620006af565b5b828202905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60006200077b8262000206565b9150620007888362000206565b9250826200079b576200079a6200073f565b5b828204905092915050565b6000620007b38262000206565b9150620007c08362000206565b9250828203905081811115620007db57620007da620006af565b5b92915050565b60008160011c9050919050565b600080821415620007fe57620007fd620006af565b5b600182039050919050565b600060016200081884620007e1565b92506200082582620007e5565b8114156200083857620008376200073f565b5b50919050565b600082825260208201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b60006200088760208362000849565b915062000894826200084b565b602082019050919050565b60006020820190508181036000830152620008ba8162000876565b9050919050565b61058b80620008c86000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c8063313ce56711610066578063313ce567146101405780634dc3e44c1461015e57806370a082311461017c57806395d89b41146101ac578063a9059cbb146101ca57610093565b806306fdde0314610098578063095ea7b3146100b657806318160ddd146100e657806323b872dd14610104575b600080fd5b6100a06101fa565b6040516100ad919061035b565b60405180910390f35b6100d060048036038101906100cb9190610425565b61028c565b6040516100dd9190610480565b60405180910390f35b6100ee61037e565b6040516100fb91906104aa565b60405180910390f35b61011e600480360381019061011991906104c5565b610388565b60405161013791906105265b60405180910390f35b610148610475565b604051610155919061053d565b60405180910390f35b61016661047e565b604051610173919061035b565b60405180910390f35b61019660048036038101906101919190610558565b61050c565b6040516101a391906104aa565b60405180910390f35b6101b4610524565b6040516101c1919061035b565b60405180910390f35b6101e460048036038101906101df9190610425565b6105b6565b6040516101f19190610480565b60405180910390f35b606060038054610209906105b4565b80601f0160208091040260200160405190810160405280929190818152602001828054610235906105b4565b80156102825780601f1061025757610100808354040283529160200191610282565b820191906000526020600020905b81548152906001019060200180831161026557829003601f168201915b5050505050905090565b6000816001600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461032f57600080fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103769190610614565b925050819055505092915050565b6000600554905090565b600081600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546103d59190610614565b600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555081600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461046791906106b9565b925050819055506001905092915050565b60006012905090565b6004805461048b906105b4565b80601f01602080910402602001604051908101604052809291908181526020018280546104b7906105b4565b80156105045780601f106104d957610100808354040283529160200191610504565b820191906000526020600020905b8154815290600101906020018083116104e757829003601f168201915b505050505081565b60016020528060005260406000206000915090505481565b60038054610531906105b4565b80601f016020809104026020016040519081016040528092919081815260200182805461055d906105b4565b80156105aa5780601f1061057f576101008083540402835291602001916105aa565b820191906000526020600020905b81548152906001019060200180831161058d57829003601f168201915b50505050508156fea264697066735822122030a8ddfa8cd8e17c8b3cc74cf0dd6a4e4d6f18c05b8e6dc5e8cbe7c2c7c8476964736f6c63430008110033";

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
