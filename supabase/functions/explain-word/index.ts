// Edge function: explain-word
// Recebe { word, context? } e retorna { meaning, synonyms[], example }
// usando Lovable AI Gateway (Gemini). Pública (sem JWT) — anti-abuso por word length.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, context } = await req.json();

    if (!word || typeof word !== "string") {
      return new Response(JSON.stringify({ error: "word é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanWord = word.trim().slice(0, 80);
    if (cleanWord.length < 2) {
      return new Response(JSON.stringify({ error: "palavra muito curta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um auxiliar de leitura para estudantes do ensino fundamental e médio brasileiros. Explique palavras difíceis de forma SIMPLES, em português brasileiro, com no máximo 1 frase. Seja claro, sem jargão.`;

    const userPrompt = context
      ? `Explique a palavra "${cleanWord}" como apareceria neste contexto literário: "${String(context).slice(0, 300)}".`
      : `Explique a palavra "${cleanWord}".`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explicar_palavra",
              description: "Retorna explicação simples, sinônimos e um exemplo de frase.",
              parameters: {
                type: "object",
                properties: {
                  meaning: { type: "string", description: "Explicação simples em 1 frase." },
                  synonyms: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 2 a 4 sinônimos comuns.",
                  },
                  example: { type: "string", description: "Uma frase curta usando a palavra." },
                },
                required: ["meaning", "synonyms", "example"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "explicar_palavra" } },
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Avise o administrador." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI gateway error", aiResponse.status, t);
      return new Response(JSON.stringify({ error: "Falha ao consultar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Resposta inválida da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ word: cleanWord, ...parsed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explain-word error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
