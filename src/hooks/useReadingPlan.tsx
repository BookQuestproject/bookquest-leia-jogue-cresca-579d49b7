import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ReadingPlan {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string | null;
  total_pages: number;
  daily_minutes: number;
  daily_pages: number;
  current_day: number;
  is_active: boolean;
  created_at: string;
}

export const useReadingPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPlans((data as ReadingPlan[]) ?? []);
    } catch (e) {
      console.error('Error fetching reading plans:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const createPlan = async (params: {
    bookId: string;
    bookTitle: string;
    totalPages: number;
    dailyMinutes: number;
  }): Promise<ReadingPlan | null> => {
    if (!user) return null;

    // ~1 page per 2 minutes average
    const pagesPerMinute = 0.5;
    const dailyPages = Math.max(1, Math.round(params.dailyMinutes * pagesPerMinute));

    const { data, error } = await supabase
      .from('reading_plans')
      .upsert({
        user_id: user.id,
        book_id: params.bookId,
        book_title: params.bookTitle,
        total_pages: params.totalPages,
        daily_minutes: params.dailyMinutes,
        daily_pages: dailyPages,
        current_day: 1,
        is_active: true,
      }, { onConflict: 'user_id,book_id' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar plano.', variant: 'destructive' });
      return null;
    }

    toast({ title: '📖 Plano criado!', description: `${dailyPages} páginas por dia.` });
    await fetchPlans();
    return data as ReadingPlan;
  };

  const advanceDay = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const totalDays = Math.ceil(plan.total_pages / plan.daily_pages);
    const newDay = Math.min(plan.current_day + 1, totalDays);
    const isComplete = newDay >= totalDays;

    await supabase
      .from('reading_plans')
      .update({ current_day: newDay, is_active: !isComplete })
      .eq('id', planId);

    if (isComplete) {
      toast({ title: '🎉 Plano concluído!', description: `Você completou "${plan.book_title}"!` });
    }
    await fetchPlans();
  };

  const deletePlan = async (planId: string) => {
    await supabase.from('reading_plans').delete().eq('id', planId);
    await fetchPlans();
  };

  const getActivePlan = () => plans.find(p => p.is_active) ?? null;

  return { plans, loading, createPlan, advanceDay, deletePlan, getActivePlan };
};
