import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "https://esm.sh/ethers@6.7.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KYC_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'setKYCStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }
];

serve(async (req) => {
  console.log('🚀 approve-kyc-onchain function called');
  console.log('Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📥 Request body:', JSON.stringify(body));
    
    const { walletAddress, kycRegistryAddress } = body;

    console.log('👤 Approving KYC on-chain for:', walletAddress);
    console.log('📋 KYC Registry:', kycRegistryAddress);

    if (!walletAddress || !kycRegistryAddress) {
      console.error('❌ Missing required parameters');
      throw new Error('Missing required parameters');
    }

    // Validate addresses
    if (!ethers.isAddress(walletAddress)) {
      console.error('❌ Invalid wallet address format:', walletAddress);
      throw new Error('Invalid wallet address format');
    }

    if (!ethers.isAddress(kycRegistryAddress)) {
      console.error('❌ Invalid KYC Registry address format:', kycRegistryAddress);
      throw new Error('Invalid KYC Registry address format');
    }

    const deployerPrivateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('BASE_SEPOLIA_RPC_URL');

    if (!deployerPrivateKey) {
      console.error('❌ DEPLOYER_PRIVATE_KEY not configured');
      throw new Error('DEPLOYER_PRIVATE_KEY not configured');
    }

    if (!rpcUrl) {
      console.error('❌ BASE_SEPOLIA_RPC_URL not configured');
      throw new Error('BASE_SEPOLIA_RPC_URL not configured');
    }

    console.log('🔑 Creating wallet and provider...');
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    console.log('👛 Deployer address:', wallet.address);

    // Create contract instance
    console.log('📝 Creating contract instance...');
    const contract = new ethers.Contract(kycRegistryAddress, KYC_REGISTRY_ABI, wallet);

    // Check gas price
    const feeData = await provider.getFeeData();
    console.log('⛽ Current gas price:', feeData.gasPrice?.toString());

    // Send transaction
    console.log('📤 Sending setKYCStatus transaction...');
    const tx = await contract.setKYCStatus(walletAddress, true);
    
    console.log('✅ Transaction sent! Hash:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('🎉 Transaction confirmed in block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed?.toString());

    const response = { 
      success: true, 
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      message: 'KYC approved on-chain successfully'
    };
    
    console.log('📤 Sending success response:', JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('💥 ERROR in approve-kyc-onchain:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    const errorResponse = { 
      success: false, 
      error: error.message || 'Failed to approve KYC on-chain',
      details: error.toString(),
      errorName: error.name
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse));
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
