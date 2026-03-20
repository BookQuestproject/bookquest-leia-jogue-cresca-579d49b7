import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface BookSuggestion {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  reason: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  chapters_list: any;
  book_summary: string | null;
  narrative_context: string | null;
  approved_at: string | null;
  approved_by: string | null;
  cover_url: string | null;
  genre: string | null;
  publication_year: number | null;
  external_link: string | null;
  ai_verified: boolean | null;
  ai_verification_data: any;
}

export const useBookSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("book_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuggestions((data as any[]) || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const createSuggestion = async (
    title: string,
    author: string,
    reason?: string
  ): Promise<string | false> => {
    if (!user) {
      toast.error("Você precisa estar logado para sugerir um livro");
      return false;
    }

    try {
      const insertData: any = {
        user_id: user.id,
        title: title.trim(),
        author: author.trim() || null,
        reason: reason?.trim() || null,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("book_suggestions")
        .insert(insertData)
        .select("id")
        .single();

      if (error) throw error;

      await fetchSuggestions();
      return data.id;
    } catch (err) {
      console.error("Error creating suggestion:", err);
      toast.error("Erro ao enviar sugestão");
      return false;
    }
  };

  return { suggestions, loading, createSuggestion, refetch: fetchSuggestions };
};

// Admin-specific hook
export const useAdminBookSuggestions = () => {
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("book_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuggestions((data as any[]) || []);
    } catch (err) {
      console.error("Error fetching all suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSuggestions();
  }, []);

  const updateSuggestionStatus = async (
    id: string,
    status: string,
    adminNotes?: string,
    detailedInfo?: {
      chapters_list?: string[];
      book_summary?: string;
      narrative_context?: string;
      cover_url?: string;
    }
  ) => {
    try {
      const updateData: any = {
        status,
        admin_notes: adminNotes || null,
      };

      if (status === "approved" && detailedInfo) {
        updateData.chapters_list = detailedInfo.chapters_list || null;
        updateData.book_summary = detailedInfo.book_summary || null;
        updateData.narrative_context = detailedInfo.narrative_context || null;
        if (detailedInfo.cover_url) {
          updateData.cover_url = detailedInfo.cover_url;
        }
        updateData.approved_at = new Date().toISOString();
      }

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("book_suggestions")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success(`Sugestão ${status === "approved" ? "aprovada" : "rejeitada"}`);
      await fetchAllSuggestions();
      return true;
    } catch (err) {
      console.error("Error updating suggestion:", err);
      toast.error("Erro ao atualizar sugestão");
      return false;
    }
  };

  const deleteSuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("book_suggestions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Sugestão removida");
      await fetchAllSuggestions();
      return true;
    } catch (err) {
      console.error("Error deleting suggestion:", err);
      toast.error("Erro ao remover sugestão");
      return false;
    }
  };

  return {
    suggestions,
    loading,
    updateSuggestionStatus,
    deleteSuggestion,
    refetch: fetchAllSuggestions,
  };
};
