// Edge function: validate-chapter-contribution
// Recebe uma contribuição de capítulos, valida via IA, e auto-aprova se confiança alta.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChapterInput {
  number: number;
  title: string;
}

interface RequestBody {
  book_id: string;
  book_title: string;
  book_author?: string;
  chapters: ChapterInput[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth: extrair user_id do JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body: RequestBody = await req.json();
    const { book_id, book_title, book_author, chapters } = body;

    if (!book_id || !book_title || !Array.isArray(chapters) || chapters.length === 0) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (chapters.length > 100) {
      return new Response(JSON.stringify({ error: "Muitos capítulos (máx 100)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Bloqueio: já tem contribuição pendente para este livro/usuário?
    const { data: existing } = await adminClient
      .from("chapter_contributions")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", book_id)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Você já tem uma contribuição pendente para este livro." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validação por IA
    const prompt = `Você está validando uma lista de títulos de capítulos enviada por um leitor para o livro:
Título: "${book_title}"
${book_author ? `Autor: ${book_author}` : ""}

Capítulos enviados (${chapters.length}):
${chapters.map(c => `${c.number}. ${c.title}`).join("\n")}

Avalie:
1. Os títulos parecem reais e coerentes com o livro? (não são spam, gírias aleatórias, ofensas, ou texto sem sentido)
2. A sequência faz sentido editorialmente?
3. Você reconhece pelo menos alguns desses títulos como pertencentes a este livro real?

Responda SOMENTE em JSON válido com este formato:
{"confidence": 0.0-1.0, "is_spam": boolean, "reason": "explicação curta", "looks_authentic": boolean}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um validador de metadados literários. Responda apenas com JSON puro." },
          { role: "user", content: prompt },
        ],
      }),
    });

    let confidence = 0;
    let isSpam = false;
    let aiReason = "";
    let looksAuthentic = false;

    if (aiResp.ok) {
      const aiData = await aiResp.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json|```/g, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        confidence = Number(parsed.confidence) || 0;
        isSpam = !!parsed.is_spam;
        aiReason = String(parsed.reason || "");
        looksAuthentic = !!parsed.looks_authentic;
      } catch {
        aiReason = "Falha ao interpretar resposta da IA";
      }
    }

    // Decisão: auto-aprovar se confiança >= 0.75, não-spam, e parece autêntico
    const autoApprove = !isSpam && looksAuthentic && confidence >= 0.75;
    const status = autoApprove ? "approved" : "pending";

    // Inserir contribuição
    const { data: contribution, error: insErr } = await adminClient
      .from("chapter_contributions")
      .insert({
        user_id: userId,
        book_id,
        book_title,
        book_author: book_author || null,
        chapters,
        status,
        ai_verified: true,
        ai_confidence: confidence,
        ai_notes: aiReason,
        reviewed_at: autoApprove ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Se aprovado, aplicar ao book_trail_enrichments + recompensar usuário
    if (autoApprove) {
      const enrichedChapters = chapters.map((c, idx) => ({
        id: c.number ?? idx + 1,
        title: c.title,
        icon: "📖",
      }));

      // Upsert no enrichments
      const { data: existingEnrich } = await adminClient
        .from("book_trail_enrichments")
        .select("id")
        .eq("book_id", book_id)
        .maybeSingle();

      if (existingEnrich) {
        await adminClient
          .from("book_trail_enrichments")
          .update({
            chapters: enrichedChapters,
            source: "community",
            updated_at: new Date().toISOString(),
          })
          .eq("book_id", book_id);
      } else {
        await adminClient.from("book_trail_enrichments").insert({
          book_id,
          title: book_title,
          author: book_author || "Desconhecido",
          chapters: enrichedChapters,
          source: "community",
        });
      }

      await rewardContributor(adminClient, userId, book_title);
    }

    return new Response(
      JSON.stringify({
        success: true,
        auto_approved: autoApprove,
        confidence,
        contribution_id: contribution.id,
        message: autoApprove
          ? "Capítulos aprovados automaticamente! +50 ✦ e badge Curador concedidos."
          : "Contribuição enviada para análise. Você será notificado em breve.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("validate-chapter-contribution error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// deno-lint-ignore no-explicit-any
async function rewardContributor(admin: any, userId: string, bookTitle: string) {
  // +50 ✦ Essência
  const { data: xpRow } = await admin
    .from("user_xp")
    .select("xp, week_xp")
    .eq("user_id", userId)
    .maybeSingle();

  if (xpRow) {
    const currentXp = Number(xpRow.xp) || 0;
    const currentWeek = Number(xpRow.week_xp) || 0;
    await admin
      .from("user_xp")
      .update({ xp: currentXp + 50, week_xp: currentWeek + 50 })
      .eq("user_id", userId);
  } else {
    await admin.from("user_xp").insert({ user_id: userId, xp: 50, week_xp: 50 });
  }

  // Badge Curador (idempotente)
  await admin.rpc("award_badge", {
    _user_id: userId,
    _badge_type: "curator",
    _badge_label: "Curador",
    _metadata: { book_title: bookTitle },
  });
}
