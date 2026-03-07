import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getTierFromXp, RankingTier } from '@/components/RankingBadge';

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  tier: RankingTier;
  streak: number;
  isCurrentUser: boolean;
}

export const useRanking = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_xp' as any)
        .select('user_id, xp, streak')
        .order('xp', { ascending: false });

      if (error) throw error;

      // Fetch profiles for names
      const userIds = (data as any[]).map((d: any) => d.user_id);
      
      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const rankingUsers: RankingUser[] = (data as any[]).map((d: any) => {
        const profile = profileMap.get(d.user_id);
        const name = profile?.full_name || 'Usuário';
        const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
        return {
          id: d.user_id,
          name,
          avatar: initials,
          xp: d.xp || 0,
          tier: getTierFromXp(d.xp || 0),
          streak: d.streak || 0,
          isCurrentUser: d.user_id === user?.id,
        };
      });

      setUsers(rankingUsers);
    } catch (err) {
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRanking();
  }, [user]);

  return { users, loading, refetch: fetchRanking };
};
