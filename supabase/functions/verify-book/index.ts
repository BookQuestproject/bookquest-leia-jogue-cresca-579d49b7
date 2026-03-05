const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, author, external_link, suggestion_id } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title is required' }),
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

    console.log(`Verifying book: "${title}" by ${author || 'unknown'}`);

    // Spam/content detection prompt
    const prompt = `You are an expert book verification and cataloging assistant. Analyze the following book suggestion and provide a comprehensive verification.

Book title: "${title}"
${author ? `Author: "${author}"` : 'Author: not provided'}
${external_link ? `Reference link: "${external_link}"` : ''}

TASKS:
1. SPAM CHECK: Determine if this is a legitimate book suggestion or spam/inappropriate content.
2. EXISTENCE CHECK: Verify if this is a real, published book.
3. DATA EXTRACTION: If the book exists, extract comprehensive metadata.

RESPOND WITH A JSON OBJECT:

If SPAM or inappropriate content:
{
  "exists": false,
  "is_spam": true,
  "reason": "explanation in Portuguese"
}

If the book does NOT exist:
{
  "exists": false,
  "is_spam": false,
  "reason": "explanation in Portuguese of why it couldn't be verified"
}

If the book EXISTS, respond with:
{
  "exists": true,
  "is_spam": false,
  "correct_title": "official full title",
  "correct_author": "correct full author name",
  "description": "concise description (2-3 sentences) in Portuguese BR",
  "detailed_description": "detailed synopsis (150-250 words) in Portuguese BR, back-cover quality",
  "genre": "genre in Portuguese (Fantasia, Romance, Mistério, Clássico, Ficção Científica, Aventura, Não-Ficção, Terror, Drama, Poesia, Biografia, Autoajuda, Infantil, Jovem Adulto, HQ/Mangá, Outros)",
  "pages": approximate_page_count_number,
  "rating": typical_rating_1_to_5_with_one_decimal,
  "publication_year": year_number,
  "cover_url": "a real Amazon or Open Library cover image URL, or null if unknown",
  "book_summary": "brief editorial summary in Portuguese (2-3 sentences)",
  "narrative_context": "historical/literary context in Portuguese (2-3 sentences)",
  "content_warnings": ["list of content warnings if any, in Portuguese"],
  "is_appropriate": true or false (false if contains extremely inappropriate content for a literary platform)
}

IMPORTANT:
- For cover_url, try to use real Amazon cover URLs in format: https://m.media-amazon.com/images/I/... or Open Library covers: https://covers.openlibrary.org/b/isbn/ISBN-L.jpg
- If you cannot find a reliable cover URL, set it to null
- Correct any typos in the title and author name
- The genre MUST be one from the provided list
- Be strict about existence verification - only confirm books that are definitely real published works

Respond ONLY with valid JSON, no markdown or extra text.`;

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
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Muitas verificações em andamento. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Serviço de verificação temporariamente indisponível.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify book with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

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

    // If spam detected, reject immediately
    if (bookInfo.is_spam) {
      if (suggestion_id) {
        await updateSuggestion(suggestion_id, {
          status: 'rejected',
          admin_notes: 'Rejeitado automaticamente: conteúdo detectado como spam ou impróprio.',
          ai_verified: true,
          ai_verification_data: JSON.stringify(bookInfo),
        });
      }
      return new Response(
        JSON.stringify({ success: true, book: bookInfo }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If book exists and is appropriate, update suggestion with AI data (but keep as pending for moderation)
    if (bookInfo.exists && suggestion_id) {
      const updateData: Record<string, unknown> = {
        // Keep status as 'pending' - admin must approve
        status: 'pending',
        book_summary: bookInfo.book_summary || bookInfo.description,
        narrative_context: bookInfo.narrative_context || null,
        cover_url: bookInfo.cover_url || null,
        genre: bookInfo.genre || null,
        publication_year: bookInfo.publication_year || null,
        ai_verified: true,
        ai_verification_data: JSON.stringify({
          correct_title: bookInfo.correct_title,
          correct_author: bookInfo.correct_author,
          genre: bookInfo.genre,
          pages: bookInfo.pages,
          rating: bookInfo.rating,
          cover_url: bookInfo.cover_url,
          description: bookInfo.description,
          detailed_description: bookInfo.detailed_description,
          publication_year: bookInfo.publication_year,
          content_warnings: bookInfo.content_warnings,
        }),
        // Also store in chapters_list for backward compatibility
        chapters_list: JSON.stringify({
          verified: true,
          correct_title: bookInfo.correct_title,
          correct_author: bookInfo.correct_author,
          genre: bookInfo.genre,
          pages: bookInfo.pages,
          rating: bookInfo.rating,
          cover_url: bookInfo.cover_url,
          description: bookInfo.description,
          detailed_description: bookInfo.detailed_description,
        }),
        admin_notes: `✅ Verificado por IA | Gênero: ${bookInfo.genre || 'N/A'} | Ano: ${bookInfo.publication_year || 'N/A'} | Páginas: ${bookInfo.pages || 'N/A'}`,
      };

      // Update title and author with corrected versions
      if (bookInfo.correct_title) updateData.title = bookInfo.correct_title;
      if (bookInfo.correct_author) updateData.author = bookInfo.correct_author;

      // If content is inappropriate, auto-reject
      if (bookInfo.is_appropriate === false) {
        updateData.status = 'rejected';
        updateData.admin_notes = 'Rejeitado automaticamente: conteúdo impróprio para a plataforma.';
      }

      await updateSuggestion(suggestion_id, updateData);
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

async function updateSuggestion(id: string, data: Record<string, unknown>) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/book_suggestions?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error('Failed to update suggestion:', await res.text());
  } else {
    console.log('Suggestion updated with AI verification data');
  }
}
