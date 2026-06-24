import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  xp: number;
  streak: number;
}

// Global state for cross-component reactivity
let globalStats: UserStats = { xp: 0, streak: 0 };
let listeners: Set<() => void> = new Set();
let lastGainAmount = 0;
let gainTimestamp = 0;

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(globalStats);
  const [loading, setLoading] = useState(true);
  const [recentGain, setRecentGain] = useState(0);

  // Subscribe to global changes
  useEffect(() => {
    const listener = () => {
      setStats({ ...globalStats });
      // Check for recent gain
      if (Date.now() - gainTimestamp < 500) {
        setRecentGain(lastGainAmount);
        setTimeout(() => setRecentGain(0), 3000);
      }
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_xp')
        .select('xp, streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user stats:', error);
      } else if (data) {
        globalStats = { xp: data.xp || 0, streak: data.streak || 0 };
        setStats({ ...globalStats });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Listen for realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-xp-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_xp',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newData = payload.new as any;
          if (newData) {
            const oldXp = globalStats.xp;
            const gained = (newData.xp || 0) - oldXp;
            if (gained > 0) {
              lastGainAmount = gained;
              gainTimestamp = Date.now();
            }
            globalStats = { xp: newData.xp || 0, streak: newData.streak || 0 };
            notifyListeners();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addEssencia = useCallback(async (amount: number) => {
    if (!user || !amount || amount <= 0) return;

    lastGainAmount = amount;
    gainTimestamp = Date.now();

    try {
      const { data, error } = await supabase.rpc('add_user_xp', { _amount: amount });
      if (error) {
        console.error('Error adding essencia:', error);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        const newXp = (row as any)?.xp ?? globalStats.xp + amount;
        globalStats = { ...globalStats, xp: newXp };
        notifyListeners();
      }
    } catch (err) {
      console.error('Error adding essencia:', err);
    }
  }, [user]);

  const updateStreak = useCallback(async (_newStreak: number) => {
    if (!user) return;
    // Streak updates are handled server-side via the tick_user_streak RPC
    // (see useStreakTick). Direct client updates are no longer permitted.
    try {
      const { data, error } = await supabase.rpc('tick_user_streak', { _user_id: user.id });
      if (error) {
        console.error('Error updating streak:', error);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        const newStreak = (row as any)?.streak ?? globalStats.streak;
        globalStats = { ...globalStats, streak: newStreak };
        notifyListeners();
      }
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [user]);

  return {
    essencia: stats.xp,
    streak: stats.streak,
    loading,
    recentGain,
    addEssencia,
    updateStreak,
    refetch: fetchStats,
  };
};
