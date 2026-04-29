import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type BookMode = "chapters" | "pages";

export interface BookStructure {
  id?: string;
  mode: BookMode;
  total_chapters: number | null;
  total_pages: number | null;
  session_size: number | null;
}

export const useBookStructure = (bookId: string | undefined) => {
  const { user } = useAuth();
  const [structure, setStructure] = useState<BookStructure | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStructure = useCallback(async () => {
    if (!user || !bookId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_book_structure" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();
    if (data) setStructure(data as unknown as BookStructure);
    setLoading(false);
  }, [user, bookId]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  const saveStructure = useCallback(
    async (payload: Omit<BookStructure, "id">) => {
      if (!user || !bookId) return;
      const { data, error } = await supabase
        .from("user_book_structure" as any)
        .upsert(
          {
            user_id: user.id,
            book_id: bookId,
            mode: payload.mode,
            total_chapters: payload.total_chapters,
            total_pages: payload.total_pages,
            session_size: payload.session_size,
          },
          { onConflict: "user_id,book_id" }
        )
        .select()
        .single();
      if (!error && data) setStructure(data as unknown as BookStructure);
    },
    [user, bookId]
  );

  return { structure, loading, saveStructure, refetch: fetchStructure };
};
