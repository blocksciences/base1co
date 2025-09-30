import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wallet-address',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client for privileged operations (with service role key)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to authenticate with JWT first (traditional auth)
    let isAuthenticated = false;
    let userId = null;

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const authClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const { data: { user }, error: userError } = await authClient.auth.getUser();
      
      if (!userError && user) {
        // Check if user is admin via user_roles
        const { data: isAdminData } = await supabaseClient
          .rpc('is_admin', { check_user_id: user.id });
        
        if (isAdminData) {
          isAuthenticated = true;
          userId = user.id;
        }
      }
    }

    // If JWT auth failed, try wallet-based authentication
    if (!isAuthenticated) {
      const walletAddress = req.headers.get('x-wallet-address');
      if (walletAddress) {
        const { data: walletAdmin } = await supabaseClient
          .from('admin_wallets')
          .select('wallet_address')
          .eq('wallet_address', walletAddress)
          .single();

        if (walletAdmin) {
          isAuthenticated = true;
          console.log('Authenticated via wallet:', walletAddress);
        }
      }
    }

    if (!isAuthenticated) {
      console.error('Authentication failed - no valid JWT or wallet address');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const { operation, targetUserId, targetEmail, targetWallet, role } = await req.json();

    let result;
    let auditAction;
    let auditDetails: any = {};

    switch (operation) {
      case 'add_admin':
        if (targetEmail) {
          // Add admin by email (traditional user-based)
          const { data: targetUser, error: findError } = await supabaseClient.auth.admin.listUsers();

          if (findError) {
            console.error('Error listing users:', findError);
            return new Response(
              JSON.stringify({ error: 'Failed to query users' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
              }
            );
          }

          const matchedUser = targetUser?.users?.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());

          if (!matchedUser) {
            return new Response(
              JSON.stringify({ error: 'User not found with that email' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
              }
            );
          }

          // Add admin role
          const { error: insertError } = await supabaseClient
            .from('user_roles')
            .insert({
              user_id: matchedUser.id,
              role: 'admin',
              created_by: userId,
            });

          if (insertError) {
            console.error('Error adding admin:', insertError);
            return new Response(
              JSON.stringify({ error: insertError.message || 'Failed to add admin role' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
              }
            );
          }

          auditAction = 'add_admin';
          auditDetails = { email: targetEmail, user_id: matchedUser.id };
          result = { success: true, message: 'Admin role added successfully' };
        } else if (targetWallet) {
          // Add admin by wallet address
          const { error: insertError } = await supabaseClient
            .from('admin_wallets')
            .insert({
              wallet_address: targetWallet,
              created_by: req.headers.get('x-wallet-address') || 'system',
            });

          if (insertError) {
            console.error('Error adding wallet admin:', insertError);
            return new Response(
              JSON.stringify({ error: insertError.message || 'Failed to add admin wallet' }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
              }
            );
          }

          auditAction = 'add_admin_wallet';
          auditDetails = { wallet_address: targetWallet };
          result = { success: true, message: 'Admin wallet added successfully' };
        } else {
          return new Response(
            JSON.stringify({ error: 'Either email or wallet address is required' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
        break;

      case 'remove_admin':
        // Delete admin role
        const { error: deleteError } = await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId)
          .eq('role', 'admin');

        if (deleteError) {
          console.error('Error removing admin:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to remove admin role' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        auditAction = 'remove_admin';
        auditDetails = { user_id: targetUserId };
        result = { success: true, message: 'Admin role removed successfully' };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
    }

    // Log audit trail
    await supabaseClient
      .from('admin_audit_log')
      .insert({
        admin_user_id: userId,
        action: auditAction,
        target_user_id: targetUserId,
        details: auditDetails,
      });

    console.log(`Admin operation completed: ${auditAction}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-operations:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
