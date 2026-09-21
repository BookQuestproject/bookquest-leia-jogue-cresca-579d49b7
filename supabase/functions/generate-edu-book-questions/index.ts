import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookTitle, author, chapterNumber, chapterTitle, context } = await req.json();
    if (!bookTitle || !chapterNumber || !chapterTitle) {
      return new Response(JSON.stringify({ error: "Dados do capítulo incompletos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em literatura e educação brasileira. Ajude um professor a montar perguntas de leitura para uma turma.

REGRAS:
- Gere exatamente 4 sugestões.
- As perguntas devem ser adequadas ao capítulo específico, ao livro e à faixa etária escolar de forma ampla.
- Prefira perguntas que verifiquem compreensão, interpretação e conexão com o texto.
- Nunca apresente como fato algo que você não consegue sustentar pelo contexto fornecido.
- Quando o contexto do capítulo for insuficiente para uma pergunta factual segura, prefira uma pergunta interpretativa.
- Retorne APENAS um array JSON válido.

Formato de cada item:
{
  "question_type": "multiple_choice" ou "open",
  "question_text": "pergunta",
  "options": ["A","B","C","D"] (usar [] para open),
  "correct_answer": 0 (índice, usar null para open),
  "explanation": "feedback curto para o professor"
}`,
          },
          {
            role: "user",
            content: `Livro: "${bookTitle}"${author ? ` — ${author}` : ""}
Capítulo ${chapterNumber}: "${chapterTitle}"
Contexto adicional do professor: ${context || "não informado"}

Crie 4 sugestões úteis para este capítulo específico.`,
          },
        ],
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de IA atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Erro ao consultar a IA." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || "[]";
    const fenced = contentText.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/);
    const jsonText = fenced ? fenced[1].trim() : contentText.trim();
    let questions: any[] = [];

    try {
      questions = JSON.parse(jsonText);
    } catch {
      const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
      if (arrayMatch) questions = JSON.parse(arrayMatch[0]);
    }

    if (!Array.isArray(questions)) questions = [];

    return new Response(JSON.stringify({
      questions: questions.slice(0, 4).map((item) => ({
        question_type: item.question_type === "open" ? "open" : "multiple_choice",
        question_text: String(item.question_text || ""),
        options: Array.isArray(item.options) ? item.options.map(String).slice(0, 4) : [],
        correct_answer: item.question_type === "open" ? null : (Number.isFinite(Number(item.correct_answer)) ? Number(item.correct_answer) : null),
        explanation: item.explanation ? String(item.explanation) : "",
      })).filter((item) => item.question_text.trim()),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-edu-book-questions error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Erro ao gerar perguntas.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
