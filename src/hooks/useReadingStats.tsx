import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingStats {
  totalReadingTime: number; // in seconds
  completedChapters: number;
  booksStarted: number;
  booksCompleted: number;
  averageReadingTime: number; // average per chapter in seconds
}

export const useReadingStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReadingStats>({
    totalReadingTime: 0,
    completedChapters: 0,
    booksStarted: 0,
    booksCompleted: 0,
    averageReadingTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get all reading progress for the user
        const { data, error } = await supabase
          .from('reading_progress')
          .select('book_id, chapter_id, elapsed_time, is_completed')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading reading stats:', error);
          setLoading(false);
          return;
        }

        if (data) {
          // Calculate total reading time
          const totalReadingTime = data.reduce((sum, item) => sum + (item.elapsed_time || 0), 0);

          // Count completed chapters
          const completedChapters = data.filter(item => item.is_completed).length;

          // Get unique books started
          const uniqueBooks = new Set(data.map(item => item.book_id));
          const booksStarted = uniqueBooks.size;

          // Count books completed (assuming each book has a known number of chapters)
          // For now, we'll count books where at least one chapter is completed
          const booksWithCompletedChapters = new Set(
            data.filter(item => item.is_completed).map(item => item.book_id)
          );
          const booksCompleted = booksWithCompletedChapters.size;

          // Calculate average reading time per completed chapter
          const averageReadingTime = completedChapters > 0 
            ? totalReadingTime / completedChapters 
            : 0;

          setStats({
            totalReadingTime,
            completedChapters,
            booksStarted,
            booksCompleted,
            averageReadingTime,
          });
        }
      } catch (err) {
        console.error('Error loading reading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      return `${mins}min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  return {
    stats,
    loading,
    formatTime,
  };
};
