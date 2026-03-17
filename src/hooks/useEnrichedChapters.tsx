import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EnrichedChapter {
  id: number;
  title: string;
  icon: string;
}

interface BookEnrichment {
  book_id: string;
  title: string;
  author: string;
  chapters: EnrichedChapter[];
  genre: string | null;
  cover_url: string | null;
  total_pages: number | null;
  theme_color: string | null;
  source: string;
}

export const useEnrichedChapters = () => {
  const [enrichments, setEnrichments] = useState<BookEnrichment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("book_trail_enrichments")
          .select("*");

        if (error) throw error;

        const parsed: BookEnrichment[] = (data || []).map((row: any) => {
          let chapters: EnrichedChapter[] = [];
          try {
            const raw = typeof row.chapters === "string" ? JSON.parse(row.chapters) : row.chapters;
            chapters = Array.isArray(raw) ? raw : [];
          } catch {}

          return {
            book_id: row.book_id,
            title: row.title,
            author: row.author,
            chapters,
            genre: row.genre,
            cover_url: row.cover_url,
            total_pages: row.total_pages,
            theme_color: row.theme_color,
            source: row.source,
          };
        });

        setEnrichments(parsed);
      } catch (err) {
        console.error("Error fetching enrichments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const getEnrichment = (bookId: string) => enrichments.find(e => e.book_id === bookId);

  return { enrichments, loading, getEnrichment };
};
