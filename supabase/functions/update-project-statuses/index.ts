import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          status: string;
          end_date: string;
          raised_amount: number;
          soft_cap: number;
          contract_address: string | null;
        };
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching projects that need status updates...');

    // Get all live or upcoming projects where end_date has passed
    const now = new Date().toISOString();
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, status, end_date, raised_amount, soft_cap, contract_address')
      .in('status', ['live', 'upcoming'])
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
      throw fetchError;
    }

    if (!projects || projects.length === 0) {
      console.log('No projects need status updates');
      return new Response(
        JSON.stringify({ message: 'No projects to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${projects.length} projects to check`);

    const updates = [];
    
    for (const project of projects) {
      const raisedAmount = Number(project.raised_amount) || 0;
      const softCap = Number(project.soft_cap) || 0;
      
      // Determine new status based on whether soft cap was met
      const newStatus = raisedAmount >= softCap ? 'success' : 'failed';
      
      console.log(`Project ${project.name}: raised=${raisedAmount}, softCap=${softCap}, newStatus=${newStatus}`);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (updateError) {
        console.error(`Error updating project ${project.id}:`, updateError);
      } else {
        updates.push({ id: project.id, name: project.name, status: newStatus });
        console.log(`✅ Updated ${project.name} to ${newStatus}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Project statuses updated successfully', 
        updated: updates.length,
        updates 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-project-statuses:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
