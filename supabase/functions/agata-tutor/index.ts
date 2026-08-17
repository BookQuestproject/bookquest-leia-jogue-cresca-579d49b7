const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "IA não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, workTitle, workAuthor, progressLabel, contextSummary } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `Você é Ágata, tutora literária do BookQuest Nacional, feita para alunos do Ensino Médio do Colégio Nacional.

OBRA: "${workTitle}", de ${workAuthor}.
PROGRESSO DO ALUNO: ele leu até "${progressLabel}".
CONTEÚDO JÁ LIBERADO PARA ELE:
${contextSummary}

REGRAS:
1. NUNCA revele acontecimentos além do progresso do aluno. Se perguntarem sobre o que vem depois, diga com simpatia que isso está adiante e o convide a continuar a leitura.
2. Nunca invente fatos, personagens ou falas que não existem na obra. Se não tiver certeza, diga que não tem certeza.
3. Responda em português do Brasil, tom direto, jovem e respeitoso — como um bom professor, não como um robô.
4. Seja curta: no máximo 5 frases, salvo se pedirem explicação detalhada. Sem listas gigantes.
5. Se o aluno pedir a resposta pronta de uma pergunta de prova, conduza o raciocínio em vez de entregar tudo mastigado.
6. Foque na obra. Se a pergunta fugir totalmente do tema, redirecione gentilmente.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        messages: [
          { role: "system", content: system },
          ...messages.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: String(m.content).slice(0, 2000),
          })),
        ],
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: "Muitas perguntas ao mesmo tempo. Tente em instantes." }), {
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
      return new Response(JSON.stringify({ error: "Falha ao consultar a Ágata" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResponse.json();
    const reply = data.choices?.[0]?.message?.content ?? "Não consegui responder agora.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("agata-tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
