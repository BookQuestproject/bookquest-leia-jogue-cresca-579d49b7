import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getTierFromEssencia, RankingTier } from '@/components/RankingBadge';

export interface RankingUser {
  id: string;
  name: string;
  username: string | null;
  avatar: string;
  essencia: number;
  /** @deprecated use essencia */
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
        .select('user_id, xp, streak, assigned_tier, week_xp')
        .order('xp', { ascending: false });

      if (error) throw error;

      const userIds = (data as any[]).map((d: any) => d.user_id);
      
      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(((profiles as any[]) || []).map((p: any) => [p.id, p]));

      const rankingUsers: RankingUser[] = (data as any[]).map((d: any) => {
        const profile = profileMap.get(d.user_id);
        const name = profile?.full_name || 'Usuário';
        const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
        // Use assigned_tier if available, otherwise fall back to XP-based tier
        const tier = d.assigned_tier && d.assigned_tier !== 'bronze' 
          ? d.assigned_tier as RankingTier 
          : getTierFromEssencia(d.xp || 0);
        return {
          id: d.user_id,
          name,
          avatar: initials,
          essencia: d.xp || 0,
          xp: d.xp || 0,
          tier,
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
