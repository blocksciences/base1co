import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueTicket {
  id: string;
  wallet_address: string;
  project_id: string;
  priority: boolean;
  position: number;
  status: 'waiting' | 'active' | 'expired';
  created_at: string;
  expires_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'join';

    if (action === 'join') {
      return await handleJoinQueue(req, supabase);
    } else if (action === 'status') {
      return await handleQueueStatus(req, supabase);
    } else if (action === 'leave') {
      return await handleLeaveQueue(req, supabase);
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Queue error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleJoinQueue(req: Request, supabase: any) {
  const { walletAddress, projectId } = await req.json();

  if (!walletAddress || !projectId) {
    throw new Error('Wallet address and project ID required');
  }

  console.log('User joining queue:', { walletAddress, projectId });

  // Check if user is already in queue
  const { data: existing } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('project_id', projectId)
    .eq('status', 'waiting')
    .maybeSingle();

  if (existing) {
    return new Response(
      JSON.stringify({ 
        ticket: existing,
        message: 'Already in queue'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  // Check if user has priority access (e.g., via whitelist, NFT holding, etc.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_address')
    .eq('wallet_address', walletAddress.toLowerCase())
    .maybeSingle();

  // Check whitelist for priority
  const { data: whitelist } = await supabase
    .from('priority_whitelist')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('project_id', projectId)
    .maybeSingle();

  const hasPriority = !!whitelist;

  // Get current queue position
  const { count: queueCount } = await supabase
    .from('queue_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'waiting');

  const position = (queueCount || 0) + 1;

  // Create ticket
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiry

  const { data: ticket, error } = await supabase
    .from('queue_tickets')
    .insert({
      wallet_address: walletAddress.toLowerCase(),
      project_id: projectId,
      priority: hasPriority,
      position: position,
      status: 'waiting',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Calculate estimated time
  const avgProcessingTime = 30; // 30 seconds per person
  const etaSeconds = position * avgProcessingTime;

  console.log('Queue ticket created:', { 
    ticketId: ticket.id, 
    position, 
    priority: hasPriority 
  });

  return new Response(
    JSON.stringify({
      ticket_id: ticket.id,
      position,
      priority: hasPriority,
      eta_seconds: etaSeconds,
      expires_at: ticket.expires_at,
      message: hasPriority ? 'Priority access granted' : 'Added to queue'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleQueueStatus(req: Request, supabase: any) {
  const url = new URL(req.url);
  const ticketId = url.searchParams.get('ticketId');

  if (!ticketId) {
    throw new Error('Ticket ID required');
  }

  const { data: ticket, error } = await supabase
    .from('queue_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) throw error;

  // Get updated position
  const { count: aheadCount } = await supabase
    .from('queue_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', ticket.project_id)
    .eq('status', 'waiting')
    .lt('position', ticket.position);

  const currentPosition = (aheadCount || 0) + 1;
  const etaSeconds = currentPosition * 30;

  return new Response(
    JSON.stringify({
      status: ticket.status,
      position: currentPosition,
      priority: ticket.priority,
      eta_seconds: etaSeconds,
      expires_at: ticket.expires_at,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleLeaveQueue(req: Request, supabase: any) {
  const { ticketId } = await req.json();

  if (!ticketId) {
    throw new Error('Ticket ID required');
  }

  const { error } = await supabase
    .from('queue_tickets')
    .update({ status: 'expired' })
    .eq('id', ticketId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}