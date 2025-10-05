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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress, kycRegistryAddress } = await req.json();

    console.log('Approving KYC on-chain for:', walletAddress);
    console.log('KYC Registry:', kycRegistryAddress);

    if (!walletAddress || !kycRegistryAddress) {
      throw new Error('Missing required parameters');
    }

    // Validate addresses
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!ethers.isAddress(kycRegistryAddress)) {
      throw new Error('Invalid KYC Registry address format');
    }

    const deployerPrivateKey = Deno.env.get('DEPLOYER_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('BASE_SEPOLIA_RPC_URL');

    if (!deployerPrivateKey) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured');
    }

    if (!rpcUrl) {
      throw new Error('BASE_SEPOLIA_RPC_URL not configured');
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);

    console.log('Deployer address:', wallet.address);

    // Create contract instance
    const contract = new ethers.Contract(kycRegistryAddress, KYC_REGISTRY_ABI, wallet);

    // Send transaction
    console.log('Sending transaction...');
    const tx = await contract.setKYCStatus(walletAddress, true);
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return new Response(
      JSON.stringify({ 
        success: true, 
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        message: 'KYC approved on-chain successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error approving KYC on-chain:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to approve KYC on-chain',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
