import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook responsável por "acender o foguinho" do dia.
 *
 * Regras (server-side via RPC `tick_user_streak`):
 *  - Se o usuário já foi creditado HOJE → não faz nada (idempotente).
 *  - Se foi creditado ontem → incrementa +1.
 *  - Se passou mais de 1 dia → reinicia em 1.
 *
 * Pode ser chamado livremente em vários lugares (login, completar capítulo,
 * concluir missão) sem risco de inflar o streak.
 */
export const useStreakTick = () => {
  const { user } = useAuth();
  const lastTickRef = useRef<string | null>(null);

  const tick = useCallback(async () => {
    if (!user) return null;
    // Evita pingar a função mais de uma vez por dia, por sessão
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `${user.id}:${today}`;
    if (lastTickRef.current === cacheKey) return null;
    lastTickRef.current = cacheKey;

    try {
      const { data, error } = await supabase.rpc('tick_user_streak' as any, {
        _user_id: user.id,
      });
      if (error) {
        console.error('streak tick error', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('streak tick err', err);
      return null;
    }
  }, [user]);

  // Fire-and-forget on mount / when user becomes available
  useEffect(() => {
    if (user) tick();
  }, [user, tick]);

  return { tick };
};
