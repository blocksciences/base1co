import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    console.log('Deployment request received:', deploymentData);

    // Contract deployment through the edge function requires pre-compiled contract bytecode.
    // For now, deployments must be done using the local Hardhat deployment script.
    // This allows for better control and verification of deployed contracts.
    
    const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  AUTOMATED DEPLOYMENT NOT AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contract deployment must be done using the local Hardhat script.

📋 DEPLOYMENT INSTRUCTIONS:

1. Navigate to the contracts directory:
   cd contracts

2. Create/update your .env file with these parameters:
   TOKEN_NAME="${deploymentData.projectName}"
   TOKEN_SYMBOL="${deploymentData.tokenSymbol}"
   TOTAL_SUPPLY="${deploymentData.totalSupply}"
   TOKEN_DECIMALS="${deploymentData.tokenDecimals}"
   TOKEN_PRICE="${deploymentData.tokenPrice}"
   SOFT_CAP="${deploymentData.softCap}"
   HARD_CAP="${deploymentData.hardCap}"
   MIN_CONTRIBUTION="${deploymentData.minContribution}"
   MAX_CONTRIBUTION="${deploymentData.maxContribution}"
   START_TIME="${Math.floor(new Date(deploymentData.startDate).getTime() / 1000)}"
   END_TIME="${Math.floor(new Date(deploymentData.endDate).getTime() / 1000)}"

3. Also ensure you have these in your .env:
   PRIVATE_KEY=<your_deployer_private_key>
   BASE_SEPOLIA_RPC_URL=<your_rpc_url>

4. Run the deployment script:
   npx hardhat run scripts/deploy-ico.ts --network baseSepolia

5. After deployment, update the project in your database with the
   deployed contract addresses.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Why manual deployment?
   - Automated deployment from edge functions requires embedding
     compiled contract bytecode, which would make the function
     large and difficult to maintain.
   - Local deployment provides better control, verification, and
     gas estimation.
   - You can verify contracts on BaseScan immediately after
     deployment using Hardhat's verify plugin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

    throw new Error(errorMessage);

  } catch (error: any) {
    console.error('Deployment request error:', error.message);
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
