import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClassReadingProgress {
  id: string;
  class_id: string;
  user_id: string;
  current_page: number;
  pages_read_today: number;
  last_read_date: string | null;
  is_up_to_date: boolean;
  created_at: string;
  updated_at: string;
}

export const useClassReadingProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progressData, setProgressData] = useState<ClassReadingProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_reading_progress')
        .select('*')
        .eq('class_id', classId)
        .order('current_page', { ascending: false });
      
      if (error) throw error;
      setProgressData((data as ClassReadingProgress[]) ?? []);
    } catch (e: any) {
      console.error('Error fetching reading progress:', e);
      toast({ title: 'Erro', description: 'Falha ao carregar progresso.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProgress = async (classId: string, currentPage: number) => {
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    // Check if there's existing progress for today
    const { data: existing } = await supabase
      .from('class_reading_progress')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .maybeSingle();

    let pagesReadToday = 1;
    if (existing && existing.last_read_date === today) {
      pagesReadToday = (existing.pages_read_today || 0) + 1;
    }

    const { data, error } = await supabase
      .from('class_reading_progress')
      .upsert({
        class_id: classId,
        user_id: user.id,
        current_page: currentPage,
        pages_read_today: pagesReadToday,
        last_read_date: today,
        is_up_to_date: true,
      }, { onConflict: 'class_id,user_id' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar progresso.', variant: 'destructive' });
      return null;
    }

    toast({ title: '📖 Progresso atualizado!' });
    await fetchProgress(classId);
    return data as ClassReadingProgress;
  };

  return {
    progressData,
    loading,
    fetchProgress,
    updateProgress,
  };
};
