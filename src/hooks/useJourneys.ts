import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Journey {
  id: string;
  teacher_id: string;
  title: string;
  book_id: string | null;
  book_title: string | null;
  author: string | null;
  total_pages: number | null;
  total_chapters: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface JourneyClassLink {
  id: string;
  journey_id: string;
  class_id: string;
  assigned_at: string;
}

export const useJourneys = () => {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [links, setLinks] = useState<JourneyClassLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: js }, { data: ls }] = await Promise.all([
      supabase.from("edu_journeys" as any).select("*").eq("teacher_id", user.id).order("created_at", { ascending: false }),
      supabase.from("edu_journey_classes" as any).select("*"),
    ]);
    setJourneys((js as any) ?? []);
    setLinks((ls as any) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (payload: Partial<Journey> & { title: string; classIds?: string[] }) => {
    if (!user) return null;
    const { classIds = [], ...rest } = payload;
    const { data, error } = await supabase
      .from("edu_journeys" as any)
      .insert({ ...rest, teacher_id: user.id })
      .select()
      .single();
    if (error || !data) {
      toast.error("Falha ao criar jornada");
      return null;
    }
    if (classIds.length) {
      await supabase.from("edu_journey_classes" as any).insert(
        classIds.map((class_id) => ({ journey_id: (data as any).id, class_id }))
      );
    }
    toast.success("Jornada criada");
    await fetchAll();
    return data as any as Journey;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("edu_journeys" as any).delete().eq("id", id);
    if (error) return toast.error("Falha ao excluir");
    toast.success("Jornada excluída");
    await fetchAll();
  };

  const duplicate = async (j: Journey) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("edu_journeys" as any)
      .insert({
        teacher_id: user.id,
        title: `${j.title} (cópia)`,
        book_id: j.book_id,
        book_title: j.book_title,
        author: j.author,
        total_pages: j.total_pages,
        total_chapters: j.total_chapters,
        description: j.description,
      })
      .select()
      .single();
    if (error || !data) return toast.error("Falha ao duplicar");
    // duplicate questions
    const { data: qs } = await supabase
      .from("edu_journey_chapter_questions" as any)
      .select("*")
      .eq("journey_id", j.id);
    if (qs && (qs as any[]).length) {
      await supabase.from("edu_journey_chapter_questions" as any).insert(
        (qs as any[]).map((q) => ({
          journey_id: (data as any).id,
          chapter_number: q.chapter_number,
          question_text: q.question_text,
          created_by: user.id,
        }))
      );
    }
    toast.success("Jornada duplicada");
    await fetchAll();
  };

  const assignToClasses = async (journeyId: string, classIds: string[]) => {
    if (!classIds.length) return;
    await supabase.from("edu_journey_classes" as any).insert(
      classIds.map((class_id) => ({ journey_id: journeyId, class_id }))
    );
    toast.success("Jornada aplicada às turmas");
    await fetchAll();
  };

  return { journeys, links, loading, create, remove, duplicate, assignToClasses, refetch: fetchAll };
};
