const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, author, suggestion_id } = await req.json();

    if (!title || !author) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title and author are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying book: "${title}" by ${author}`);

    const prompt = `You are a book verification assistant. Verify if the following book exists as a real, published book.

Book title: "${title}"
Author: "${author}"

If this is a real published book, respond with a JSON object with these fields:
- "exists": true
- "correct_title": the correct/official title of the book
- "correct_author": the correct full name of the author
- "description": a short description (1-2 sentences) in Portuguese (BR)
- "detailed_description": a detailed synopsis (150-250 words) in Portuguese (BR), similar to a back-cover summary
- "genre": the genre in Portuguese (e.g. "Fantasia", "Romance", "Mistério", "Clássico", "Ficção Científica", "Aventura", "Não-Ficção", "Terror", "Drama")
- "pages": approximate page count (number)
- "rating": a typical rating from 1-5 (number with one decimal)
- "cover_url": a working Amazon cover image URL if you know one, otherwise null
- "book_summary": a brief editorial summary in Portuguese (2-3 sentences)
- "narrative_context": the historical/literary context of the book in Portuguese (2-3 sentences)

If the book does NOT exist or you cannot verify it, respond with:
- "exists": false
- "reason": explanation in Portuguese of why it couldn't be verified

Respond ONLY with valid JSON, no markdown or extra text.`;

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify book with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle possible markdown wrapping)
    let bookInfo;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      bookInfo = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse verification result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If book exists and we have a suggestion_id, update the suggestion in DB
    if (bookInfo.exists && suggestion_id) {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const updateData: Record<string, unknown> = {
        status: 'approved',
        book_summary: bookInfo.book_summary || bookInfo.description,
        narrative_context: bookInfo.narrative_context || null,
        approved_at: new Date().toISOString(),
        admin_notes: `Verificado automaticamente por IA. Gênero: ${bookInfo.genre || 'N/A'}. Páginas: ${bookInfo.pages || 'N/A'}.`,
      };

      // Store extra info in chapters_list as JSON metadata
      updateData.chapters_list = JSON.stringify({
        verified: true,
        correct_title: bookInfo.correct_title,
        correct_author: bookInfo.correct_author,
        genre: bookInfo.genre,
        pages: bookInfo.pages,
        rating: bookInfo.rating,
        cover_url: bookInfo.cover_url,
        description: bookInfo.description,
        detailed_description: bookInfo.detailed_description,
      });

      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/book_suggestions?id=eq.${suggestion_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateRes.ok) {
        console.error('Failed to update suggestion:', await updateRes.text());
      } else {
        console.log('Suggestion auto-approved with AI verification');
      }
    }

    return new Response(
      JSON.stringify({ success: true, book: bookInfo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying book:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
