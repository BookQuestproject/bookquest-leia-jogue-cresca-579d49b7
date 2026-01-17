import { useMemo } from 'react';
import { useReadingStats } from './useReadingStats';
import { useProfile } from './useProfile';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'reading' | 'time' | 'streak' | 'special';
  earned: boolean;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  unlockedAt?: Date;
}

export const useAchievements = () => {
  const { stats, loading: statsLoading } = useReadingStats();
  const { profile, loading: profileLoading } = useProfile();

  const achievements = useMemo((): Achievement[] => {
    const totalMinutes = Math.floor(stats.totalReadingTime / 60);
    const totalHours = Math.floor(stats.totalReadingTime / 3600);
    const quizCompleted = profile?.quiz_completed || false;

    return [
      // Reading achievements
      {
        id: 'first_chapter',
        name: 'Primeiro Passo',
        icon: '📖',
        description: 'Complete seu primeiro capítulo',
        category: 'reading',
        earned: stats.completedChapters >= 1,
        progress: Math.min((stats.completedChapters / 1) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 1,
      },
      {
        id: 'chapter_5',
        name: 'Leitor Iniciante',
        icon: '📚',
        description: 'Complete 5 capítulos',
        category: 'reading',
        earned: stats.completedChapters >= 5,
        progress: Math.min((stats.completedChapters / 5) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 5,
      },
      {
        id: 'chapter_10',
        name: 'Leitor Dedicado',
        icon: '🎯',
        description: 'Complete 10 capítulos',
        category: 'reading',
        earned: stats.completedChapters >= 10,
        progress: Math.min((stats.completedChapters / 10) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 10,
      },
      {
        id: 'chapter_25',
        name: 'Leitor Ávido',
        icon: '🔥',
        description: 'Complete 25 capítulos',
        category: 'reading',
        earned: stats.completedChapters >= 25,
        progress: Math.min((stats.completedChapters / 25) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 25,
      },
      {
        id: 'chapter_50',
        name: 'Devorador de Livros',
        icon: '📕',
        description: 'Complete 50 capítulos',
        category: 'reading',
        earned: stats.completedChapters >= 50,
        progress: Math.min((stats.completedChapters / 50) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 50,
      },
      {
        id: 'chapter_100',
        name: 'Mestre Literário',
        icon: '👑',
        description: 'Complete 100 capítulos',
        category: 'reading',
        earned: stats.completedChapters >= 100,
        progress: Math.min((stats.completedChapters / 100) * 100, 100),
        currentValue: stats.completedChapters,
        targetValue: 100,
      },
      // Books achievements
      {
        id: 'first_book',
        name: 'Primeiro Livro',
        icon: '🌟',
        description: 'Comece a ler seu primeiro livro',
        category: 'reading',
        earned: stats.booksStarted >= 1,
        progress: Math.min((stats.booksStarted / 1) * 100, 100),
        currentValue: stats.booksStarted,
        targetValue: 1,
      },
      {
        id: 'book_5',
        name: 'Explorador Literário',
        icon: '🗺️',
        description: 'Explore 5 livros diferentes',
        category: 'reading',
        earned: stats.booksStarted >= 5,
        progress: Math.min((stats.booksStarted / 5) * 100, 100),
        currentValue: stats.booksStarted,
        targetValue: 5,
      },
      {
        id: 'book_complete_1',
        name: 'Finalizador',
        icon: '✅',
        description: 'Complete 1 livro',
        category: 'reading',
        earned: stats.booksCompleted >= 1,
        progress: Math.min((stats.booksCompleted / 1) * 100, 100),
        currentValue: stats.booksCompleted,
        targetValue: 1,
      },
      {
        id: 'book_complete_5',
        name: 'Colecionador',
        icon: '🏆',
        description: 'Complete 5 livros',
        category: 'reading',
        earned: stats.booksCompleted >= 5,
        progress: Math.min((stats.booksCompleted / 5) * 100, 100),
        currentValue: stats.booksCompleted,
        targetValue: 5,
      },
      // Time achievements
      {
        id: 'time_30min',
        name: 'Primeira Meia Hora',
        icon: '⏰',
        description: 'Leia por 30 minutos no total',
        category: 'time',
        earned: totalMinutes >= 30,
        progress: Math.min((totalMinutes / 30) * 100, 100),
        currentValue: totalMinutes,
        targetValue: 30,
      },
      {
        id: 'time_1h',
        name: 'Hora de Leitura',
        icon: '⌛',
        description: 'Leia por 1 hora no total',
        category: 'time',
        earned: totalMinutes >= 60,
        progress: Math.min((totalMinutes / 60) * 100, 100),
        currentValue: totalMinutes,
        targetValue: 60,
      },
      {
        id: 'time_5h',
        name: 'Maratonista',
        icon: '🏃',
        description: 'Leia por 5 horas no total',
        category: 'time',
        earned: totalHours >= 5,
        progress: Math.min((totalHours / 5) * 100, 100),
        currentValue: totalHours,
        targetValue: 5,
      },
      {
        id: 'time_10h',
        name: 'Leitor de Elite',
        icon: '💎',
        description: 'Leia por 10 horas no total',
        category: 'time',
        earned: totalHours >= 10,
        progress: Math.min((totalHours / 10) * 100, 100),
        currentValue: totalHours,
        targetValue: 10,
      },
      {
        id: 'time_24h',
        name: 'Um Dia Inteiro',
        icon: '🌙',
        description: 'Leia por 24 horas no total',
        category: 'time',
        earned: totalHours >= 24,
        progress: Math.min((totalHours / 24) * 100, 100),
        currentValue: totalHours,
        targetValue: 24,
      },
      // Special achievements
      {
        id: 'quiz_master',
        name: 'Quiz Master',
        icon: '🧠',
        description: 'Complete o quiz literário',
        category: 'special',
        earned: quizCompleted,
        progress: quizCompleted ? 100 : 0,
        currentValue: quizCompleted ? 1 : 0,
        targetValue: 1,
      },
    ];
  }, [stats, profile]);

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);
  const totalAchievements = achievements.length;
  const earnedCount = earnedAchievements.length;

  const categorizedAchievements = useMemo(() => ({
    reading: achievements.filter(a => a.category === 'reading'),
    time: achievements.filter(a => a.category === 'time'),
    streak: achievements.filter(a => a.category === 'streak'),
    special: achievements.filter(a => a.category === 'special'),
  }), [achievements]);

  return {
    achievements,
    earnedAchievements,
    lockedAchievements,
    totalAchievements,
    earnedCount,
    categorizedAchievements,
    loading: statsLoading || profileLoading,
  };
};
