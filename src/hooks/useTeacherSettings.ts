import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface TeacherSettings {
  teacher_id: string;
  school_name: string | null;
  signature: string | null;
  email_settings: { sender_email?: string; auto_send_weekly?: boolean };
  notification_prefs: { student_inactive?: boolean; weekly_summary?: boolean; mentions?: boolean };
  visual_prefs: { compact?: boolean };
}

const empty = (id: string): TeacherSettings => ({
  teacher_id: id,
  school_name: null,
  signature: "Atenciosamente,\nProfessor(a)",
  email_settings: {},
  notification_prefs: { student_inactive: true, weekly_summary: true, mentions: false },
  visual_prefs: {},
});

export const useTeacherSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("edu_teacher_settings" as any)
      .select("*")
      .eq("teacher_id", user.id)
      .maybeSingle();
    setSettings((data as any) ?? empty(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async (patch: Partial<TeacherSettings>) => {
    if (!user) return;
    const next = { ...(settings ?? empty(user.id)), ...patch, teacher_id: user.id };
    const { error } = await supabase
      .from("edu_teacher_settings" as any)
      .upsert(next as any, { onConflict: "teacher_id" });
    if (error) return toast.error("Falha ao salvar");
    setSettings(next);
    toast.success("Configurações salvas");
  };

  return { settings, loading, save, refetch: fetch };
};
