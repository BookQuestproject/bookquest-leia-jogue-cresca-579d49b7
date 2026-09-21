import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const toEmail = Deno.env.get("FEEDBACK_TO_EMAIL");
    const fromEmail = Deno.env.get("FEEDBACK_FROM_EMAIL");

    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server configuration missing");
    if (!resendKey || !toEmail || !fromEmail) {
      return new Response(JSON.stringify({ skipped: true, reason: "Email secrets not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await admin.auth.getUser(authHeader?.replace(/^Bearer\s+/i, "") || "");
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const audience = String(body?.audience || "aluno");
    const type = String(body?.type || "feedback");
    const context = String(body?.context || "");
    const rating = Number(body?.rating || 0);
    const comment = String(body?.comment || "");
    const pagePath = String(body?.page_path || "");

    const subject = type === "bug"
      ? `BookQuest EDU · problema reportado · ${audience}`
      : audience === "aluno"
        ? `BookQuest EDU · feedback do aluno · ${rating}/5`
        : `BookQuest EDU · feedback do professor · ${rating}/5`;

    const html = `
      <h2>Feedback BookQuest EDU</h2>
      <p><strong>Público:</strong> ${audience}</p>
      <p><strong>Tipo:</strong> ${type}</p><p><strong>Nota:</strong> ${rating}/5</p>
      <p><strong>Contexto:</strong> ${context}</p>
      <p><strong>Página:</strong> ${pagePath}</p>
      <p><strong>Usuário:</strong> ${user.id}</p>
      <hr />
      <p>${comment ? comment.replace(/\n/g, "<br />") : "Sem comentário."}</p>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error", response.status, text);
      return new Response(JSON.stringify({ error: "Could not send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-feedback-email error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
