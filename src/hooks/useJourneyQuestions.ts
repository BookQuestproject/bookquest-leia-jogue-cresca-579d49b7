import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface JourneyQuestion {
  id: string;
  journey_id: string;
  chapter_number: number;
  question_text: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useJourneyQuestions = (journeyId?: string | null) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<JourneyQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!journeyId) { setQuestions([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("edu_journey_chapter_questions" as any)
      .select("*")
      .eq("journey_id", journeyId)
      .order("chapter_number", { ascending: true });
    setQuestions((data as any) ?? []);
    setLoading(false);
  }, [journeyId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (chapter_number: number, question_text: string) => {
    if (!user || !journeyId) return;
    const { error } = await supabase.from("edu_journey_chapter_questions" as any).insert({
      journey_id: journeyId,
      chapter_number,
      question_text,
      created_by: user.id,
    });
    if (error) return toast.error("Falha ao criar pergunta");
    toast.success("Pergunta criada");
    await fetchAll();
  };

  const update = async (id: string, question_text: string) => {
    const { error } = await supabase
      .from("edu_journey_chapter_questions" as any)
      .update({ question_text })
      .eq("id", id);
    if (error) return toast.error("Falha ao atualizar");
    toast.success("Pergunta atualizada");
    await fetchAll();
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from("edu_journey_chapter_questions" as any)
      .delete()
      .eq("id", id);
    if (error) return toast.error("Falha ao excluir");
    await fetchAll();
  };

  return { questions, loading, create, update, remove, refetch: fetchAll };
};
