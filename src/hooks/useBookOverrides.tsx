import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BookOverride {
  id: string;
  book_id: string;
  title: string | null;
  author: string | null;
  cover_url: string | null;
  description: string | null;
  detailed_description: string | null;
  genre: string | null;
  updated_by: string;
  updated_at: string;
}

export const useBookOverrides = () => {
  const [overrides, setOverrides] = useState<BookOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverrides = useCallback(async () => {
    const { data, error } = await supabase
      .from("book_overrides")
      .select("*");
    if (!error && data) setOverrides(data as BookOverride[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOverrides(); }, [fetchOverrides]);

  const getOverride = useCallback((bookId: string) => {
    return overrides.find(o => o.book_id === bookId) || null;
  }, [overrides]);

  /** Apply overrides to a book object. Non-null override fields win. */
  const applyOverride = useCallback(<T extends { id: string | number; title: string; author: string; cover?: string; coverImage?: string; genre?: string; description?: string; detailedDescription?: string }>(book: T, bookIdKey?: string): T => {
    const id = bookIdKey || String(book.id);
    const ov = getOverride(id);
    if (!ov) return book;
    return {
      ...book,
      title: ov.title || book.title,
      author: ov.author || book.author,
      coverImage: ov.cover_url || (book as any).coverImage,
      cover: ov.cover_url || book.cover,
      genre: ov.genre || book.genre,
      description: ov.description || book.description,
      detailedDescription: ov.detailed_description || book.detailedDescription,
    };
  }, [getOverride]);

  return { overrides, loading, fetchOverrides, getOverride, applyOverride };
};

export const useBookOverridesMutation = () => {
  const { user } = useAuth();

  const upsertOverride = async (bookId: string, fields: Partial<Omit<BookOverride, "id" | "book_id" | "updated_by" | "updated_at">>) => {
    if (!user) throw new Error("Not authenticated");

    // Remove null/empty fields
    const cleanFields: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined && v !== null && v !== "") cleanFields[k] = v;
    }

    const { error } = await supabase
      .from("book_overrides")
      .upsert({
        book_id: bookId,
        ...cleanFields,
        updated_by: user.id,
      }, { onConflict: "book_id" });

    if (error) throw error;
  };

  const deleteOverride = async (bookId: string) => {
    const { error } = await supabase
      .from("book_overrides")
      .delete()
      .eq("book_id", bookId);
    if (error) throw error;
  };

  return { upsertOverride, deleteOverride };
};
