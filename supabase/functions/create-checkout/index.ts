import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICES = {
  monthly: "price_1SnTiJBQCpjHVzO3qltIdAjk",
  annual: "price_1T8oWBBQCpjHVzO3bbPhCywZ",
  founder: "price_1T8oYZBQCpjHVzO3wM9fwAA3",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const body = await req.json().catch(() => ({}));
    const planType = body.planType || "monthly";
    logStep("Plan type", { planType });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // For founder plan, check vacancy limit
    if (planType === "founder") {
      const { count, error: countError } = await supabaseAdmin
        .from("founder_subscriptions")
        .select("*", { count: "exact", head: true });
      
      if (countError) throw new Error("Failed to check founder slots");
      if ((count ?? 0) >= 200) throw new Error("Founder plan is sold out");

      // Check if user already has founder
      const { data: existing } = await supabaseAdmin
        .from("founder_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existing) throw new Error("User already has founder plan");
      logStep("Founder slot available", { currentCount: count });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const ALLOWED_ORIGINS = [
      'https://bookquest-leia-jogue-cresca.lovable.app',
      'https://id-preview--ffe3bb13-e7a9-43fe-bcb5-c768a8710786.lovable.app',
      'http://localhost:8080',
      'http://localhost:3000',
    ];
    const requestOrigin = req.headers.get("origin") || '';
    const validOrigin = ALLOWED_ORIGINS.includes(requestOrigin) 
      ? requestOrigin 
      : ALLOWED_ORIGINS[0];

    const priceId = PRICES[planType as keyof typeof PRICES] || PRICES.monthly;
    const isFounder = planType === "founder";
    const mode = isFounder ? "payment" : "subscription";

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${validOrigin}/premium?success=true&plan=${planType}`,
      cancel_url: `${validOrigin}/premium?canceled=true`,
      metadata: { user_id: user.id, plan_type: planType },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, mode, planType });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
