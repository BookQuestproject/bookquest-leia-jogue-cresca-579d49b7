import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  synonyms: string[];
  example: string | null;
  book_id: string | null;
  book_title: string | null;
  created_at: string;
}

export const useVocabulary = (bookId?: string) => {
  const { user } = useAuth();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWords = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from("user_vocabulary" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (bookId) query = query.eq("book_id", bookId);
    const { data, error } = await query;
    if (!error && data) setWords(data as unknown as VocabWord[]);
    setLoading(false);
  }, [user, bookId]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const addWord = useCallback(
    async (payload: {
      word: string;
      definition: string;
      synonyms: string[];
      example: string;
      book_id?: string;
      book_title?: string;
    }) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_vocabulary" as any)
        .insert({
          user_id: user.id,
          word: payload.word.trim(),
          definition: payload.definition,
          synonyms: payload.synonyms,
          example: payload.example,
          book_id: payload.book_id || null,
          book_title: payload.book_title || null,
        })
        .select()
        .single();
      if (!error && data) {
        await fetchWords();
        return data as unknown as VocabWord;
      }
      return null;
    },
    [user, fetchWords]
  );

  const removeWord = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("user_vocabulary" as any).delete().eq("id", id).eq("user_id", user.id);
      await fetchWords();
    },
    [user, fetchWords]
  );

  return { words, loading, addWord, removeWord, refetch: fetchWords };
};
