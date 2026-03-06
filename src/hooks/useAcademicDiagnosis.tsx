import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AcademicDiagnosis {
  id: string;
  user_id: string;
  focus: string;
  target_exams: string[];
  weekly_hours: number;
  completed_at: string;
}

export const useAcademicDiagnosis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [diagnosis, setDiagnosis] = useState<AcademicDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiagnosis = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('academic_diagnosis')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      setDiagnosis(data as AcademicDiagnosis | null);
    } catch (e) {
      console.error('Error fetching diagnosis:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchDiagnosis(); }, [fetchDiagnosis]);

  const saveDiagnosis = async (params: {
    focus: string;
    targetExams: string[];
    weeklyHours: number;
  }) => {
    if (!user) return false;

    const payload = {
      user_id: user.id,
      focus: params.focus,
      target_exams: params.targetExams,
      weekly_hours: params.weeklyHours,
    };

    const { data, error } = await supabase
      .from('academic_diagnosis')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar diagnóstico.', variant: 'destructive' });
      return false;
    }

    setDiagnosis(data as AcademicDiagnosis);
    toast({ title: '✅ Diagnóstico salvo!', description: 'Sua trilha personalizada foi criada.' });
    return true;
  };

  const resetDiagnosis = async () => {
    if (!user || !diagnosis) return;
    await supabase.from('academic_diagnosis').delete().eq('user_id', user.id);
    setDiagnosis(null);
  };

  return { diagnosis, loading, saveDiagnosis, resetDiagnosis, hasDiagnosis: !!diagnosis };
};
