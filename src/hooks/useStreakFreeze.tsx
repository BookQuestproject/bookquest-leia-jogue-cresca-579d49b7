import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useStreakFreeze = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [usedDates, setUsedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFreezes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('streak_freezes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setQuantity((data as any).quantity ?? 0);
        setUsedDates((data as any).used_dates ?? []);
      } else {
        // Create initial record
        await supabase.from('streak_freezes').insert({ user_id: user.id, quantity: 1 });
        setQuantity(1);
        setUsedDates([]);
      }
    } catch (e) {
      console.error('Error fetching streak freezes:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchFreezes(); }, [fetchFreezes]);

  const useFreeze = async (): Promise<boolean> => {
    if (!user || quantity <= 0) {
      toast({ title: 'Sem Congelar Sequência', description: 'Você não tem itens de congelamento disponíveis.', variant: 'destructive' });
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (usedDates.includes(today)) {
      toast({ title: 'Já usado hoje', description: 'Você já usou um congelamento hoje.' });
      return false;
    }

    const newUsedDates = [...usedDates, today];
    const { error } = await supabase
      .from('streak_freezes')
      .update({ quantity: quantity - 1, used_dates: newUsedDates })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao usar congelamento.', variant: 'destructive' });
      return false;
    }

    setQuantity(q => q - 1);
    setUsedDates(newUsedDates);
    toast({ title: '❄️ Sequência congelada!', description: 'Sua sequência foi preservada por hoje.' });
    return true;
  };

  const addFreezes = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('streak_freezes')
      .update({ quantity: quantity + amount })
      .eq('user_id', user.id);

    if (error) return;
    setQuantity(q => q + amount);
  };

  const wasFrozenToday = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return usedDates.includes(today);
  };

  return { quantity, usedDates, loading, useFreeze, addFreezes, wasFrozenToday };
};
