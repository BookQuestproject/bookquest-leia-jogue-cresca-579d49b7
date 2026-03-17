import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { books } = await req.json();

    if (!books || !Array.isArray(books) || books.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Array of books is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const results: { book_id: string; status: string; chapters_count?: number }[] = [];

    // Process books in batches of 3 to avoid rate limits
    for (let i = 0; i < books.length; i += 3) {
      const batch = books.slice(i, i + 3);
      
      const batchPromises = batch.map(async (book: { id: string; title: string; author: string; totalChapters: number; genre: string }) => {
        try {
          console.log(`Enriching: "${book.title}" by ${book.author}`);

          const prompt = `You are a literary expert. For the following book, provide the COMPLETE list of ALL chapter titles.

Book: "${book.title}"
Author: "${book.author}"
Expected chapters: approximately ${book.totalChapters}

RESPOND with a JSON object:
{
  "chapters": [
    {"id": 1, "title": "Real chapter title in Portuguese if originally Portuguese, or translated to Portuguese", "icon": "relevant emoji"},
    {"id": 2, "title": "...", "icon": "..."},
    ...
  ],
  "total_pages": approximate_total_page_count
}

IMPORTANT RULES:
- List ALL chapters from the book, not just the first few
- Use the REAL chapter titles from the book
- If the book is in English, translate chapter titles to Portuguese BR
- If the book doesn't have named chapters (just numbered), use descriptive titles based on content (e.g. "A chegada ao castelo" instead of "Capítulo 1")
- Choose an emoji icon that represents each chapter's content
- For non-fiction books, use the actual section/chapter titles
- Respond ONLY with valid JSON, no markdown`;

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2,
            }),
          });

          if (!response.ok) {
            console.error(`AI error for "${book.title}":`, response.status);
            return { book_id: book.id, status: 'error' };
          }

          const aiData = await response.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          let parsed;
          try {
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(jsonStr);
          } catch {
            console.error(`Failed to parse AI response for "${book.title}"`);
            return { book_id: book.id, status: 'parse_error' };
          }

          const chapters = parsed.chapters || [];

          // Upsert into book_trail_enrichments
          const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/book_trail_enrichments`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              book_id: book.id,
              title: book.title,
              author: book.author,
              chapters: JSON.stringify(chapters),
              genre: book.genre,
              total_pages: parsed.total_pages || null,
              source: 'ai',
              updated_at: new Date().toISOString(),
            }),
          });

          if (!upsertRes.ok) {
            console.error(`DB upsert error for "${book.title}":`, await upsertRes.text());
            return { book_id: book.id, status: 'db_error' };
          }

          console.log(`✅ Enriched "${book.title}" with ${chapters.length} chapters`);
          return { book_id: book.id, status: 'success', chapters_count: chapters.length };
        } catch (e) {
          console.error(`Error enriching "${book.title}":`, e);
          return { book_id: book.id, status: 'error' };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limits
      if (i + 3 < books.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('enrich-book-chapters error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
