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

    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log('Generating sale report for project:', projectId);

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    // Get all transactions for this project
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    // Get all investments
    const { data: investments } = await supabase
      .from('user_investments')
      .select('*')
      .eq('project_id', projectId);

    // Get vesting schedules
    const { data: vestingSchedules } = await supabase
      .from('vesting_schedules')
      .select('*')
      .eq('project_id', projectId);

    // Get liquidity locks
    const { data: liquidityLocks } = await supabase
      .from('liquidity_locks')
      .select('*')
      .eq('project_id', projectId);

    // Generate CSV
    let csv = 'Sale Report\n';
    csv += `Project: ${project.name} (${project.symbol})\n`;
    csv += `Status: ${project.status}\n`;
    csv += `Raised: ${project.raised_amount} / ${project.goal_amount}\n`;
    csv += `Participants: ${project.participants_count}\n`;
    csv += `\n`;

    // Transactions section
    csv += 'Transaction History\n';
    csv += 'Timestamp,Type,From Address,Amount Crypto,Amount USD,Status,TX Hash\n';
    
    transactions?.forEach(tx => {
      csv += `${tx.created_at},${tx.transaction_type},${tx.from_address},${tx.amount_crypto},${tx.amount_usd || 'N/A'},${tx.status},${tx.tx_hash}\n`;
    });

    csv += '\n';

    // Investments section
    csv += 'Investor Summary\n';
    csv += 'Wallet Address,Amount ETH,Amount USD,Tokens Received,Status,Date\n';
    
    investments?.forEach(inv => {
      csv += `${inv.wallet_address},${inv.amount_eth},${inv.amount_usd || 'N/A'},${inv.tokens_received},${inv.status},${inv.created_at}\n`;
    });

    csv += '\n';

    // Vesting section
    csv += 'Vesting Schedules\n';
    csv += 'Beneficiary,Type,Total Amount,Released,Start Time,Cliff (days),Duration (days),Revocable,Contract\n';
    
    vestingSchedules?.forEach(vest => {
      const cliffDays = Math.floor(vest.cliff_duration / 86400);
      const durationDays = Math.floor(vest.vesting_duration / 86400);
      csv += `${vest.beneficiary_address},${vest.schedule_type},${vest.total_amount},${vest.released_amount},${vest.start_time},${cliffDays},${durationDays},${vest.revocable},${vest.contract_address}\n`;
    });

    csv += '\n';

    // Liquidity locks section
    csv += 'Liquidity Locks\n';
    csv += 'Token,Beneficiary,Amount,Unlock Time,Withdrawn,Description,Contract\n';
    
    liquidityLocks?.forEach(lock => {
      csv += `${lock.token_address},${lock.beneficiary_address},${lock.amount},${lock.unlock_time},${lock.withdrawn},${lock.description || 'N/A'},${lock.contract_address}\n`;
    });

    console.log('Sale report generated successfully');

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${project.symbol}_sale_report_${Date.now()}.csv"`,
      },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error generating sale report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});