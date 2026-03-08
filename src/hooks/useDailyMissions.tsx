import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { BookOpen, Target, CheckCircle } from 'lucide-react';

export interface DailyMission {
  id: string;
  title: string;
  progress: number;
  goal: number;
  reward: number;
  rewardLabel: string;
  icon: any;
  completed: boolean;
}

interface MissionCompletion {
  missionId: string;
  missionTitle: string;
  reward: number;
}

export const useDailyMissions = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentCompletion, setRecentCompletion] = useState<MissionCompletion | null>(null);

  const fetchMissions = useCallback(async () => {
    if (!user) {
      setMissions(getDefaultMissions(0, false));
      setLoading(false);
      return;
    }

    try {
      // Get today's completed chapters
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayProgress } = await supabase
        .from('reading_progress')
        .select('id, book_id, chapter_id, is_completed, updated_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('updated_at', today.toISOString());

      const chaptersToday = todayProgress?.length || 0;
      
      // Check login (always true if we're here)
      const loginDone = true;

      // Check if any trail unit was completed today (3+ chapters in same book today)
      const bookChapterCounts: Record<string, number> = {};
      todayProgress?.forEach(p => {
        bookChapterCounts[p.book_id] = (bookChapterCounts[p.book_id] || 0) + 1;
      });
      const unitCompleted = Object.values(bookChapterCounts).some(count => count >= 3);

      const updatedMissions = getDefaultMissions(chaptersToday, loginDone, unitCompleted);
      setMissions(updatedMissions);
    } catch (err) {
      console.error('Error fetching daily missions:', err);
      setMissions(getDefaultMissions(0, true));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Listen for reading_progress changes to auto-update missions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('mission-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch missions when progress changes
          fetchMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMissions]);

  const checkAndNotifyCompletion = useCallback((oldMissions: DailyMission[], newMissions: DailyMission[]) => {
    for (const newM of newMissions) {
      const oldM = oldMissions.find(m => m.id === newM.id);
      if (newM.completed && oldM && !oldM.completed) {
        setRecentCompletion({
          missionId: newM.id,
          missionTitle: newM.title,
          reward: newM.reward,
        });
        setTimeout(() => setRecentCompletion(null), 5000);
        break;
      }
    }
  }, []);

  const clearCompletion = useCallback(() => {
    setRecentCompletion(null);
  }, []);

  return {
    missions,
    loading,
    recentCompletion,
    clearCompletion,
    refetch: fetchMissions,
    completedCount: missions.filter(m => m.completed).length,
    totalCount: missions.length,
  };
};

function getDefaultMissions(
  chaptersToday: number,
  loginDone: boolean,
  unitCompleted = false,
): DailyMission[] {
  return [
    {
      id: 'read-chapter',
      title: 'Complete 1 capítulo hoje',
      progress: Math.min(chaptersToday, 1),
      goal: 1,
      reward: 10,
      rewardLabel: '+10 ✦',
      icon: BookOpen,
      completed: chaptersToday >= 1,
    },
    {
      id: 'complete-unit',
      title: 'Completar unidade de trilha',
      progress: unitCompleted ? 1 : 0,
      goal: 1,
      reward: 25,
      rewardLabel: '+25 ✦',
      icon: Target,
      completed: unitCompleted,
    },
    {
      id: 'daily-login',
      title: 'Fazer login hoje',
      progress: loginDone ? 1 : 0,
      goal: 1,
      reward: 5,
      rewardLabel: '+5 ✦',
      icon: CheckCircle,
      completed: loginDone,
    },
  ];
}
