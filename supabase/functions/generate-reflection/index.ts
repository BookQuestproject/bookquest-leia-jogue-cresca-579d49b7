import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookTitle, chapterTitle, chapterId, totalChapters, chapterContext } = await req.json();
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
            content: `Você é um especialista em literatura e educação. Gere perguntas de reflexão pós-leitura para capítulos de livros.
            
REGRAS:
- Gere exatamente 5 perguntas variadas sobre o capítulo específico.
- Use nomes de personagens, eventos e temas reais do livro.
- Linguagem clara, envolvente e jovem (não infantil).
- Misture os formatos a cada chamada.

FORMATOS DISPONÍVEIS (use pelo menos 3 formatos diferentes):

1. "open" - Pergunta reflexiva aberta
   { "type": "open", "question": "...", "keywords": ["palavra1", "palavra2", "palavra3"] }
   keywords = palavras-chave esperadas para avaliar qualidade da resposta

2. "multiple_choice" - Múltipla escolha interpretativa
   { "type": "multiple_choice", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "partialAnswers": [1], "explanation": "..." }
   correctAnswer = índice da melhor resposta (0-3)
   partialAnswers = índices de respostas parcialmente corretas

3. "perception" - Escala de percepção
   { "type": "perception", "question": "...", "options": ["Emocionante", "Tenso", "Reflexivo", "Surpreendente"] }

4. "prediction" - Previsão sobre o próximo capítulo
   { "type": "prediction", "question": "...", "keywords": ["palavra1", "palavra2"] }

5. "character" - Análise de personagem
   { "type": "character", "question": "...", "options": ["Sim", "Não", "Não tenho certeza"], "justifyLabel": "Por quê?" }

6. "theme" - Identificação de tema
   { "type": "theme", "question": "...", "options": ["Amizade", "Traição", "Superação", "Conflito interno"], "allowOther": true }

Retorne APENAS um array JSON válido com 5 objetos de pergunta.`
          },
          {
            role: "user",
            content: `Livro: "${bookTitle}"
Capítulo ${chapterId} de ${totalChapters}: "${chapterTitle}"${chapterContext ? `\nContexto fornecido pelo professor: ${String(chapterContext).slice(0, 10000)}` : ""}

Gere 5 perguntas de reflexão variadas sobre este capítulo específico. Quando houver contexto fornecido, use-o como fonte principal e não invente acontecimentos ausentes.`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch {
      // Try to find array in the content
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        questions = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error("Failed to parse questions from AI response");
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-reflection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
