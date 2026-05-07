import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ReportMetrics {
  progress: number;
  chapters: number;
  frequency: number;
  reflections: number;
  current_page?: number;
  total_pages?: number;
}

export interface EduReport {
  id: string;
  class_id: string;
  student_user_id: string;
  teacher_id: string;
  period_label: string | null;
  metrics: ReportMetrics;
  analysis_text: string | null;
  teacher_note: string | null;
  status: "rascunho" | "gerado" | "enviado";
  sent_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useReports = (classId?: string | null) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<EduReport[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!classId || !user) { setReports([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("edu_reports" as any)
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });
    setReports((data as any) ?? []);
    setLoading(false);
  }, [classId, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const upsertReport = async (payload: {
    student_user_id: string;
    metrics: ReportMetrics;
    analysis_text: string;
    teacher_note?: string;
    period_label?: string;
    status?: EduReport["status"];
  }) => {
    if (!user || !classId) return null;
    const { data, error } = await supabase
      .from("edu_reports" as any)
      .insert({
        class_id: classId,
        teacher_id: user.id,
        student_user_id: payload.student_user_id,
        metrics: payload.metrics as any,
        analysis_text: payload.analysis_text,
        teacher_note: payload.teacher_note,
        period_label: payload.period_label ?? new Date().toLocaleDateString("pt-BR"),
        status: payload.status ?? "gerado",
      })
      .select()
      .single();
    if (error) {
      toast.error("Falha ao salvar relatório");
      return null;
    }
    await fetchAll();
    return data as any as EduReport;
  };

  const markSent = async (id: string) => {
    const { error } = await supabase
      .from("edu_reports" as any)
      .update({ status: "enviado", sent_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Falha ao marcar como enviado");
    toast.success("Relatório marcado como enviado");
    await fetchAll();
  };

  return { reports, loading, upsertReport, markSent, refetch: fetchAll };
};
