import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { projectId, batchSize = 50 } = await req.json();

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log('Building batch distribution for project:', projectId);

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Get all pending distributions (investments that haven't been distributed)
    const { data: pendingDistributions } = await supabase
      .from('user_investments')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .limit(batchSize);

    if (!pendingDistributions || pendingDistributions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending distributions',
          batches: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Group into batches for gas efficiency
    const batches = [];
    const BATCH_SIZE = 50; // Process 50 transfers per transaction

    for (let i = 0; i < pendingDistributions.length; i += BATCH_SIZE) {
      const batch = pendingDistributions.slice(i, i + BATCH_SIZE);
      
      batches.push({
        batch_number: Math.floor(i / BATCH_SIZE) + 1,
        recipients: batch.map(inv => ({
          address: inv.wallet_address,
          amount: inv.tokens_received,
          investment_id: inv.id,
        })),
        total_recipients: batch.length,
        total_tokens: batch.reduce((sum, inv) => sum + Number(inv.tokens_received), 0),
      });
    }

    // Create distribution job
    const { data: distributionJob, error: jobError } = await supabase
      .from('distribution_jobs')
      .insert({
        project_id: projectId,
        total_batches: batches.length,
        total_recipients: pendingDistributions.length,
        total_tokens: pendingDistributions.reduce((sum, inv) => sum + Number(inv.tokens_received), 0),
        status: 'pending',
        batches: batches,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    console.log('Distribution job created:', { 
      jobId: distributionJob.id, 
      batches: batches.length,
      recipients: pendingDistributions.length
    });

    // Log admin action
    await supabase
      .from('admin_audit_log')
      .insert({
        action: 'create_distribution_job',
        details: {
          project_id: projectId,
          job_id: distributionJob.id,
          batches: batches.length,
          recipients: pendingDistributions.length,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        job_id: distributionJob.id,
        batches,
        summary: {
          total_batches: batches.length,
          total_recipients: pendingDistributions.length,
          total_tokens: distributionJob.total_tokens,
          estimated_gas_cost: batches.length * 0.01, // Rough estimate
        },
        instructions: {
          next_steps: [
            'Review the batch details carefully',
            'Ensure contract has sufficient token balance',
            'Execute batches sequentially on-chain',
            'Mark job as completed when all batches processed',
          ],
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error building batch distribution:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});