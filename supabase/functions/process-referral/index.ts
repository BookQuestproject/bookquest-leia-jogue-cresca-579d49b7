// Process a referral code submitted by a newly-registered user.
// Validates the code, creates a `referrals` row, and awards Essência (XP) to
// both the referrer (+50) and the referred (+20). Idempotent per user.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const REFERRER_REWARD = 50;
const REFERRED_REWARD = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const referredId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const rawCode = (body?.code ?? "").toString().trim().toUpperCase();
    if (!rawCode || rawCode.length < 4 || rawCode.length > 12) {
      return new Response(JSON.stringify({ error: "Código inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Already processed?
    const { data: existing } = await admin
      .from("referrals")
      .select("id")
      .eq("referred_id", referredId)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Find referrer
    const { data: referrer } = await admin
      .from("profiles")
      .select("id, referral_code")
      .eq("referral_code", rawCode)
      .maybeSingle();

    if (!referrer) {
      return new Response(JSON.stringify({ error: "Código não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (referrer.id === referredId) {
      return new Response(JSON.stringify({ error: "Você não pode usar o próprio código" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Insert referral row
    const { error: insErr } = await admin.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: referredId,
      referral_code: rawCode,
      status: "completed",
      referrer_reward_claimed: true,
      referred_reward_claimed: true,
      completed_at: new Date().toISOString(),
    });
    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Award XP to both users
    for (const [uid, amount] of [
      [referrer.id, REFERRER_REWARD],
      [referredId, REFERRED_REWARD],
    ] as const) {
      await admin.from("user_xp").upsert(
        { user_id: uid },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
      const { data: row } = await admin
        .from("user_xp")
        .select("xp, week_xp")
        .eq("user_id", uid)
        .maybeSingle();
      const current = row?.xp ?? 0;
      const week = (row as any)?.week_xp ?? 0;
      await admin
        .from("user_xp")
        .update({ xp: current + amount, week_xp: week + amount, updated_at: new Date().toISOString() })
        .eq("user_id", uid);
    }

    return new Response(JSON.stringify({ ok: true, awarded: REFERRED_REWARD }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
