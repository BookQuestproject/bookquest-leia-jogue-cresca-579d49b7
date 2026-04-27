import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CatalogBook {
  book_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  total_pages: number | null;
  genre: string | null;
}

export interface NextBook {
  id: string;
  class_id: string;
  book_id: string | null;
  book_title: string;
  author: string | null;
  total_pages: number | null;
  scheduled_start_date: string;
  created_at: string;
}

export interface ClassBookHistoryItem {
  id: string;
  class_id: string;
  book_id: string | null;
  book_title: string;
  author: string | null;
  total_pages: number | null;
  started_at: string;
  ended_at: string;
  avg_progress: number | null;
  members_count: number | null;
  created_at: string;
}

export interface BookRequest {
  id: string;
  requested_by: string;
  class_id: string | null;
  title: string;
  author: string;
  school_name: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

export const useClassBooks = (classId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nextBook, setNextBook] = useState<NextBook | null>(null);
  const [history, setHistory] = useState<ClassBookHistoryItem[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    const [{ data: nb }, { data: h }] = await Promise.all([
      supabase.from("class_next_book" as any).select("*").eq("class_id", classId).maybeSingle(),
      supabase.from("class_book_history" as any).select("*").eq("class_id", classId).order("ended_at", { ascending: false }),
    ]);
    setNextBook((nb as any) ?? null);
    setHistory(((h as any) ?? []) as ClassBookHistoryItem[]);
    setLoading(false);
  }, [classId]);

  const fetchMyRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("book_requests" as any)
      .select("*")
      .eq("requested_by", user.id)
      .order("created_at", { ascending: false });
    setRequests(((data as any) ?? []) as BookRequest[]);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchMyRequests(); }, [fetchMyRequests]);

  /** Search the BookQuest catalog (enriched library). */
  const searchCatalog = async (query: string): Promise<CatalogBook[]> => {
    const q = query.trim();
    if (!q) return [];
    const { data, error } = await supabase
      .from("book_trail_enrichments")
      .select("book_id, title, author, cover_url, total_pages, genre")
      .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
      .limit(20);
    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []) as CatalogBook[];
  };

  /** Schedule the next book for the class (replaces any existing scheduled book). */
  const scheduleNextBook = async (payload: {
    book_id?: string | null;
    book_title: string;
    author?: string | null;
    total_pages?: number | null;
    scheduled_start_date: string;
  }) => {
    if (!classId || !user) return false;
    const { error } = await supabase
      .from("class_next_book" as any)
      .upsert({
        class_id: classId,
        created_by: user.id,
        ...payload,
      }, { onConflict: "class_id" });
    if (error) {
      toast({ title: "Erro", description: "Falha ao agendar próximo livro.", variant: "destructive" });
      return false;
    }
    toast({ title: "Próximo livro agendado", description: `Início: ${payload.scheduled_start_date}` });
    await fetchAll();
    return true;
  };

  const cancelNextBook = async () => {
    if (!classId) return;
    const { error } = await supabase.from("class_next_book" as any).delete().eq("class_id", classId);
    if (error) {
      toast({ title: "Erro", description: "Falha ao cancelar.", variant: "destructive" });
      return;
    }
    await fetchAll();
  };

  /**
   * End the current book of a class:
   *  - Saves the current book to history (preserving avg progress & members count)
   *  - Resets reading progress (pages) of all members for that class
   *  - Clears the current book from `classes` (or replaces it with the next book if provided)
   *
   * Essência and badges live in unrelated tables and are NOT touched.
   */
  const endCurrentBook = async (
    classData: {
      id: string;
      book_id: string | null;
      book_title: string | null;
      author: string | null;
      total_pages: number | null;
      reading_start_date: string | null;
    },
    replaceWith?: { book_id: string | null; book_title: string; author: string | null; total_pages: number | null; start_date: string } | null,
  ) => {
    if (!user || !classData.book_title) {
      toast({ title: "Sem livro atual", description: "Esta turma não tem um livro em andamento.", variant: "destructive" });
      return false;
    }

    // 1. compute averages
    const { data: progressRows } = await supabase
      .from("class_reading_progress")
      .select("current_page")
      .eq("class_id", classData.id);
    const totalPages = classData.total_pages || 0;
    const avg = progressRows && progressRows.length && totalPages
      ? Math.round((progressRows.reduce((s: number, r: any) => s + (r.current_page || 0), 0) / (progressRows.length * totalPages)) * 100)
      : 0;
    const { count: membersCount } = await supabase
      .from("class_members")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classData.id);

    // 2. push to history
    const { error: histErr } = await supabase.from("class_book_history" as any).insert({
      class_id: classData.id,
      book_id: classData.book_id,
      book_title: classData.book_title,
      author: classData.author,
      total_pages: classData.total_pages,
      started_at: classData.reading_start_date ?? new Date().toISOString().slice(0, 10),
      ended_at: new Date().toISOString().slice(0, 10),
      avg_progress: avg,
      members_count: membersCount ?? 0,
      ended_by: user.id,
    });
    if (histErr) {
      toast({ title: "Erro", description: "Falha ao salvar histórico.", variant: "destructive" });
      return false;
    }

    // 3. reset reading progress
    await supabase.from("class_reading_progress").delete().eq("class_id", classData.id);

    // 4. update class with next book or clear
    const update: any = replaceWith
      ? {
          book_id: replaceWith.book_id,
          book_title: replaceWith.book_title,
          author: replaceWith.author,
          total_pages: replaceWith.total_pages,
          reading_start_date: replaceWith.start_date,
          reading_deadline: null,
        }
      : {
          book_id: null,
          book_title: null,
          author: null,
          total_pages: null,
          reading_start_date: null,
          reading_deadline: null,
        };
    await supabase.from("classes").update(update).eq("id", classData.id);

    // 5. if we used the scheduled next book, remove it
    if (replaceWith) {
      await supabase.from("class_next_book" as any).delete().eq("class_id", classData.id);
    }

    toast({
      title: "Livro encerrado",
      description: replaceWith ? `Iniciado: ${replaceWith.book_title}` : "Histórico atualizado.",
    });
    await fetchAll();
    return true;
  };

  /** Start the scheduled book immediately (ends current and replaces). */
  const startNextNow = async (classData: any) => {
    if (!nextBook) return false;
    return endCurrentBook(classData, {
      book_id: nextBook.book_id,
      book_title: nextBook.book_title,
      author: nextBook.author,
      total_pages: nextBook.total_pages,
      start_date: new Date().toISOString().slice(0, 10),
    });
  };

  /** Submit a request for a new book to be added to the catalog. */
  const submitBookRequest = async (payload: { title: string; author: string; school_name?: string; notes?: string }) => {
    if (!user) return false;
    const { error } = await supabase.from("book_requests" as any).insert({
      requested_by: user.id,
      class_id: classId ?? null,
      title: payload.title.trim(),
      author: payload.author.trim(),
      school_name: payload.school_name?.trim() || null,
      notes: payload.notes?.trim() || null,
    });
    if (error) {
      toast({ title: "Erro", description: "Falha ao enviar solicitação.", variant: "destructive" });
      return false;
    }
    toast({ title: "Solicitação enviada", description: "Nossa equipe revisará em breve." });
    await fetchMyRequests();
    return true;
  };

  return {
    loading,
    nextBook,
    history,
    requests,
    searchCatalog,
    scheduleNextBook,
    cancelNextBook,
    endCurrentBook,
    startNextNow,
    submitBookRequest,
    refresh: fetchAll,
  };
};
