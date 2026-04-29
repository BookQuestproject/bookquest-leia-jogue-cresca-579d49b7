// Edge Function: Explica uma palavra usando Lovable AI
// Retorna definição simples, sinônimos e exemplo de frase
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { word, context } = await req.json();
    if (!word || typeof word !== "string" || word.trim().length === 0 || word.length > 60) {
      return new Response(JSON.stringify({ error: "Palavra inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const systemPrompt = `Você é um dicionário amigável para jovens leitores brasileiros.
Sempre responda em português do Brasil.
Use linguagem simples, direta e jovem.
Retorne SEMPRE através da função explain_word.`;

    const userPrompt = `Explique a palavra "${word.trim()}"${context ? ` no contexto do livro "${context}"` : ""}.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              name: "explain_word",
              description: "Explica uma palavra de forma simples para jovens.",
              parameters: {
                type: "object",
                properties: {
                  definition: { type: "string", description: "Definição curta e simples (1-2 frases)" },
                  synonyms: { type: "array", items: { type: "string" }, description: "2 a 3 sinônimos comuns" },
                  example: { type: "string", description: "Frase exemplo simples usando a palavra" },
                },
                required: ["definition", "synonyms", "example"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "explain_word" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Avise o administrador." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Erro ao consultar IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Resposta inválida da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        word: word.trim(),
        definition: parsed.definition,
        synonyms: parsed.synonyms || [],
        example: parsed.example || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("explain-vocabulary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
