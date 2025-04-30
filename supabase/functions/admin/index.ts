// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Log request details for debugging
    console.log("Admin function called with method:", req.method);
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the authenticated user - with JWT verification disabled this is optional
    // but we'll keep it for future use
    let user = null;
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (!userError && userData?.user) {
        user = userData.user;
        console.log("Authenticated as:", user.email);
      } else {
        console.log("User not authenticated or error:", userError?.message);
      }
    } catch (authError) {
      console.log("Auth error:", authError.message);
    }

    // Get the request body
    const requestData = await req.json();
    const { action, clientData } = requestData;
    
    console.log("Action requested:", action);

    // For now we'll allow operations without authentication since verify_jwt is false
    // In production, you would implement proper role checks here

    if (action === 'createClient') {
      console.log("Creating client with data:", JSON.stringify(clientData));
      // Create a client and its associated user in one transaction
      const { name, username, password, webhook_url } = clientData;
      
      // First insert the client
      const { data: clientData, error: clientError } = await supabaseClient
        .from('clients')
        .insert({
          name,
          username,
          webhook_url,
        })
        .select()
        .single();
        
      if (clientError) {
        console.error("Error creating client:", clientError);
        return new Response(JSON.stringify({ error: clientError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Then create the auth user
      const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
        email: `${username}@example.com`,
        password,
        email_confirm: true,
        user_metadata: {
          username,
        },
      });
      
      if (userError) {
        console.error("Error creating user:", userError);
        // If user creation fails, we should delete the client
        await supabaseClient
          .from('clients')
          .delete()
          .eq('id', clientData.id);
          
        return new Response(JSON.stringify({ error: userError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log("Client created successfully");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Client created successfully",
        client: clientData,
        user: userData.user
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'updateClient') {
      console.log("Updating client:", clientData.id);
      const { id, name, webhook_url } = clientData;
      
      const { data, error } = await supabaseClient
        .from('clients')
        .update({ name, webhook_url })
        .eq('id', id)
        .select();
        
      if (error) {
        console.error("Error updating client:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log("Client updated successfully");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Client updated successfully",
        client: data
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'deleteClient') {
      console.log("Deleting client:", clientData.id);
      const { id, username } = clientData;
      
      // First delete the client
      const { error: clientError } = await supabaseClient
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (clientError) {
        console.error("Error deleting client:", clientError);
        return new Response(JSON.stringify({ error: clientError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Then delete the auth user
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(`${username}@example.com`);
      
      if (userData?.user) {
        await supabaseClient.auth.admin.deleteUser(userData.user.id);
      }
      
      console.log("Client deleted successfully");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Client deleted successfully"
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'listClients') {
      console.log("Listing all clients");
      const { data, error } = await supabaseClient
        .from('clients')
        .select('*');
        
      if (error) {
        console.error("Error listing clients:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`Found ${data?.length || 0} clients`);
      return new Response(JSON.stringify({ 
        success: true,
        clients: data
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Invalid action requested:", action);
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Unexpected error in admin function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
