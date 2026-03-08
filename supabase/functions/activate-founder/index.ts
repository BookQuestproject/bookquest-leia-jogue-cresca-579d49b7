import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[ACTIVATE-FOUNDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if already founder
    const { data: existing } = await supabaseAdmin
      .from("founder_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check limit
    const { count } = await supabaseAdmin
      .from("founder_subscriptions")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) >= 200) throw new Error("Founder plan sold out");

    // Insert founder subscription
    const { error: insertError } = await supabaseAdmin
      .from("founder_subscriptions")
      .insert({ user_id: user.id });

    if (insertError) throw insertError;

    // Set premium permanently (far future date)
    await supabaseAdmin
      .from("profiles")
      .update({ is_premium: true, premium_expires_at: "2099-12-31T23:59:59Z" })
      .eq("id", user.id);

    // Award founder badge
    await supabaseAdmin
      .from("user_badges")
      .upsert({ user_id: user.id, badge_type: "founder", badge_label: "Fundador" }, { onConflict: "user_id,badge_type" });

    // Award founder title
    await supabaseAdmin
      .from("user_titles")
      .upsert({ user_id: user.id, title: "Leitor Fundador", is_active: true }, { onConflict: "user_id,title" });

    logStep("Founder activated successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
