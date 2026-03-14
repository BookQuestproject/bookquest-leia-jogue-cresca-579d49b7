import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BookClub {
  id: string;
  name: string;
  description: string | null;
  book_id: string;
  book_title: string;
  book_cover: string | null;
  created_by: string;
  max_members: number | null;
  is_active: boolean;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  avg_chapter?: number;
}

export interface ClubDiscussion {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  chapter_ref: number | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export const useBookClubs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<BookClub[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const { data: clubsData, error } = await supabase
        .from('book_clubs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clubIds = (clubsData || []).map(c => c.id);

      // Get member counts
      const { data: members } = await supabase
        .from('book_club_members')
        .select('club_id, user_id, current_chapter')
        .in('club_id', clubIds);

      const enriched = (clubsData || []).map(club => {
        const clubMembers = (members || []).filter(m => m.club_id === club.id);
        const avgChapter = clubMembers.length > 0
          ? Math.round(clubMembers.reduce((s, m) => s + (m.current_chapter || 0), 0) / clubMembers.length)
          : 0;

        return {
          ...club,
          member_count: clubMembers.length,
          is_member: user ? clubMembers.some(m => m.user_id === user.id) : false,
          avg_chapter: avgChapter,
        };
      });

      setClubs(enriched);
    } catch (err) {
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const createClub = async (data: { name: string; description: string; book_id: string; book_title: string; book_cover?: string }) => {
    if (!user) return false;
    try {
      const { data: club, error } = await supabase
        .from('book_clubs')
        .insert({ ...data, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator
      await supabase.from('book_club_members').insert({ club_id: club.id, user_id: user.id });

      toast({ title: '📚 Clube criado!', description: `"${data.name}" está pronto.` });
      await fetchClubs();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro ao criar clube', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const joinClub = async (clubId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('book_club_members').insert({ club_id: clubId, user_id: user.id });
      if (error) throw error;
      toast({ title: '✅ Você entrou no clube!' });
      await fetchClubs();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const leaveClub = async (clubId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('book_club_members').delete().eq('club_id', clubId).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Você saiu do clube' });
      await fetchClubs();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return { clubs, loading, createClub, joinClub, leaveClub, refetch: fetchClubs };
};

export const useClubDetail = (clubId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<ClubDiscussion[]>([]);
  const [members, setMembers] = useState<{ user_id: string; current_chapter: number; profile?: { full_name: string | null; avatar_url: string | null } }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      // Fetch discussions
      const { data: disc } = await supabase
        .from('book_club_discussions')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch members
      const { data: mems } = await supabase
        .from('book_club_members')
        .select('user_id, current_chapter')
        .eq('club_id', clubId);

      // Fetch profiles
      const allUserIds = [...new Set([
        ...(disc || []).map(d => d.user_id),
        ...(mems || []).map(m => m.user_id),
      ])];

      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('id, full_name, avatar_url')
        .in('id', allUserIds);

      const profileMap = new Map(((profiles as any[]) || []).map((p: any) => [p.id, p]));

      setDiscussions((disc || []).map(d => ({
        ...d,
        profile: profileMap.get(d.user_id) || { full_name: null, avatar_url: null },
      })));

      setMembers((mems || []).map(m => ({
        ...m,
        profile: profileMap.get(m.user_id) || { full_name: null, avatar_url: null },
      })));
    } catch (err) {
      console.error('Error fetching club detail:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Realtime subscription for discussions
  useEffect(() => {
    if (!clubId) return;
    const channel = supabase
      .channel(`club-${clubId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'book_club_discussions', filter: `club_id=eq.${clubId}` }, () => {
        fetchDetail();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clubId, fetchDetail]);

  const postDiscussion = async (content: string, chapterRef?: number) => {
    if (!user || !clubId) return false;
    try {
      const { error } = await supabase.from('book_club_discussions').insert({
        club_id: clubId,
        user_id: user.id,
        content,
        chapter_ref: chapterRef || null,
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      toast({ title: 'Erro ao postar', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  return { discussions, members, loading, postDiscussion, refetch: fetchDetail };
};
