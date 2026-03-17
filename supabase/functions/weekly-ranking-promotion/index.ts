import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const tierOrder = [
  "bronze", "silver", "gold", "sapphire", "emerald",
  "amethyst", "ruby", "quartz", "diamond", "legendary",
];

const promotionSlots: Record<string, number> = {
  bronze: 10,
  silver: 8,
  gold: 7,
  sapphire: 6,
  emerald: 5,
  amethyst: 5,
  ruby: 4,
  quartz: 3,
  diamond: 2,
  legendary: 1,
};

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get all users with their xp and assigned tier
  const { data: users, error } = await supabase
    .from("user_xp")
    .select("id, user_id, xp, streak, assigned_tier, week_xp");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const promotions: string[] = [];
  const demotions: string[] = [];

  // Group users by assigned_tier
  const tierGroups: Record<string, typeof users> = {};
  for (const user of users || []) {
    const tier = user.assigned_tier || "bronze";
    if (!tierGroups[tier]) tierGroups[tier] = [];
    tierGroups[tier].push(user);
  }

  // Process each tier
  for (const tier of tierOrder) {
    const group = tierGroups[tier];
    if (!group || group.length === 0) continue;

    const tierIdx = tierOrder.indexOf(tier);
    const slots = promotionSlots[tier] || 5;

    // Sort by week_xp descending
    group.sort((a: any, b: any) => (b.week_xp || 0) - (a.week_xp || 0));

    // Promote top N (if not already legendary)
    if (tierIdx < tierOrder.length - 1) {
      const nextTier = tierOrder[tierIdx + 1];
      const toPromote = group.slice(0, Math.min(slots, group.length));
      for (const user of toPromote) {
        if ((user.week_xp || 0) > 0) {
          await supabase
            .from("user_xp")
            .update({ assigned_tier: nextTier, week_xp: 0, last_week_reset: new Date().toISOString() })
            .eq("id", user.id);
          promotions.push(user.user_id);
        }
      }
    }

    // Demote bottom 3 (if not bronze and they have 0 week_xp)
    if (tierIdx > 0) {
      const prevTier = tierOrder[tierIdx - 1];
      const zeroXpUsers = group.filter((u: any) => (u.week_xp || 0) === 0);
      const toDemote = zeroXpUsers.slice(-3);
      for (const user of toDemote) {
        await supabase
          .from("user_xp")
          .update({ assigned_tier: prevTier, week_xp: 0, last_week_reset: new Date().toISOString() })
          .eq("id", user.id);
        demotions.push(user.user_id);
      }
    }
  }

  // Reset week_xp for remaining users
  await supabase
    .from("user_xp")
    .update({ week_xp: 0, last_week_reset: new Date().toISOString() })
    .gt("week_xp", 0);

  // Create notifications for promoted/demoted users
  for (const userId of promotions) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "success",
      title: "🎉 Promoção no Ranking!",
      message: "Parabéns! Você foi promovido para o próximo patamar no ranking semanal!",
      metadata: { type: "ranking_promotion" },
    });
  }

  for (const userId of demotions) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "warning",
      title: "📉 Rebaixamento no Ranking",
      message: "Você foi rebaixado no ranking semanal. Continue lendo para recuperar sua posição!",
      metadata: { type: "ranking_demotion" },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      promotions: promotions.length,
      demotions: demotions.length,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
