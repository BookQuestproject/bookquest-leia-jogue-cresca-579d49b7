import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface EduChallenge {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  goal_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface EduAchievement {
  id: string;
  class_id: string;
  user_id: string;
  achievement_type: string;
  achievement_label: string;
  metadata: any;
  awarded_at: string;
}

export interface EduAnnouncement {
  id: string;
  class_id: string;
  teacher_id: string;
  content: string;
  created_at: string;
}

export const useEduEngagement = (classId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<EduChallenge[]>([]);
  const [achievements, setAchievements] = useState<EduAchievement[]>([]);
  const [announcements, setAnnouncements] = useState<EduAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChallenges = useCallback(async (cId?: string) => {
    const id = cId || classId;
    if (!id) return;
    const { data } = await supabase
      .from('edu_class_challenges' as any)
      .select('*')
      .eq('class_id', id)
      .order('created_at', { ascending: false });
    setChallenges((data as unknown as EduChallenge[]) ?? []);
  }, [classId]);

  const fetchAchievements = useCallback(async (cId?: string) => {
    const id = cId || classId;
    if (!id) return;
    const { data } = await supabase
      .from('edu_student_achievements' as any)
      .select('*')
      .eq('class_id', id)
      .order('awarded_at', { ascending: false });
    setAchievements((data as EduAchievement[]) ?? []);
  }, [classId]);

  const fetchAnnouncements = useCallback(async (cId?: string) => {
    const id = cId || classId;
    if (!id) return;
    const { data } = await supabase
      .from('edu_class_announcements' as any)
      .select('*')
      .eq('class_id', id)
      .order('created_at', { ascending: false });
    setAnnouncements((data as EduAnnouncement[]) ?? []);
  }, [classId]);

  const fetchAll = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    await Promise.all([fetchChallenges(), fetchAchievements(), fetchAnnouncements()]);
    setLoading(false);
  }, [classId, fetchChallenges, fetchAchievements, fetchAnnouncements]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Teacher actions
  const createChallenge = async (data: {
    title: string;
    description?: string;
    challenge_type: string;
    goal_value: number;
    start_date: string;
    end_date: string;
  }) => {
    if (!user || !classId) return null;
    const { data: result, error } = await supabase
      .from('edu_class_challenges' as any)
      .insert({ ...data, class_id: classId, created_by: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar desafio.', variant: 'destructive' });
      return null;
    }
    toast({ title: '🎯 Desafio criado!' });
    await fetchChallenges();
    return result;
  };

  const deleteChallenge = async (id: string) => {
    await supabase.from('edu_class_challenges' as any).delete().eq('id', id);
    await fetchChallenges();
  };

  const createAnnouncement = async (content: string) => {
    if (!user || !classId) return null;
    const { error } = await supabase
      .from('edu_class_announcements' as any)
      .insert({ class_id: classId, teacher_id: user.id, content });
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar aviso.', variant: 'destructive' });
      return null;
    }
    toast({ title: '📢 Aviso enviado!' });
    await fetchAnnouncements();
  };

  const awardAchievement = async (userId: string, type: string, label: string, metadata?: any) => {
    if (!classId) return;
    const { error } = await supabase
      .from('edu_student_achievements' as any)
      .insert({
        class_id: classId,
        user_id: userId,
        achievement_type: type,
        achievement_label: label,
        metadata: metadata || {},
      });
    if (error && error.code !== '23505') {
      console.error('Award achievement error:', error);
    }
    await fetchAchievements();
  };

  // Auto-check achievements for current user
  const checkAndAwardAchievements = async (currentPage: number, totalPages: number) => {
    if (!user || !classId) return;
    
    const milestones = [
      { pct: 25, type: 'progress_25', label: '📖 25% do Livro' },
      { pct: 50, type: 'progress_50', label: '📚 Metade do Livro' },
      { pct: 75, type: 'progress_75', label: '🔥 75% Concluído' },
      { pct: 100, type: 'progress_100', label: '🏆 Livro Completo!' },
    ];

    if (totalPages <= 0) return;
    const pct = (currentPage / totalPages) * 100;

    for (const m of milestones) {
      if (pct >= m.pct) {
        const exists = achievements.find(a => a.user_id === user.id && a.achievement_type === m.type);
        if (!exists) {
          await awardAchievement(user.id, m.type, m.label);
          toast({ title: `🏅 Conquista desbloqueada!`, description: m.label });
        }
      }
    }

    // First reader achievement
    if (currentPage > 0) {
      const exists = achievements.find(a => a.user_id === user.id && a.achievement_type === 'first_read');
      if (!exists) {
        await awardAchievement(user.id, 'first_read', '🌟 Primeira Leitura');
        toast({ title: '🏅 Conquista desbloqueada!', description: '🌟 Primeira Leitura' });
      }
    }
  };

  return {
    challenges,
    achievements,
    announcements,
    loading,
    fetchChallenges,
    fetchAchievements,
    fetchAnnouncements,
    createChallenge,
    deleteChallenge,
    createAnnouncement,
    awardAchievement,
    checkAndAwardAchievements,
  };
};
