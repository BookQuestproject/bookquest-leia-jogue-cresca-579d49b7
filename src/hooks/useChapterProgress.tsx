import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ChapterProgress {
  chapter_id: string;
  elapsed_time: number;
  is_completed: boolean;
  notes: string | null;
}

export const useChapterProgress = (bookId: string | undefined) => {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Map<string, ChapterProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllProgress = async () => {
      if (!user || !bookId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('chapter_id, elapsed_time, is_completed, notes')
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (error) {
          console.error('Error loading chapter progress:', error);
        } else if (data) {
          const map = new Map<string, ChapterProgress>();
          data.forEach((item) => {
            map.set(item.chapter_id, item);
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.error('Error loading chapter progress:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllProgress();
  }, [user, bookId]);

  const getChapterProgress = (chapterId: number): ChapterProgress | undefined => {
    return progressMap.get(String(chapterId));
  };

  const isChapterCompleted = (chapterId: number): boolean => {
    const progress = progressMap.get(String(chapterId));
    return progress?.is_completed || false;
  };

  const getReadingTime = (chapterId: number): number => {
    const progress = progressMap.get(String(chapterId));
    return progress?.elapsed_time || 0;
  };

  const refetch = async () => {
    if (!user || !bookId) return;

    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('chapter_id, elapsed_time, is_completed, notes')
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (!error && data) {
        const map = new Map<string, ChapterProgress>();
        data.forEach((item) => {
          map.set(item.chapter_id, item);
        });
        setProgressMap(map);
      }
    } catch (err) {
      console.error('Error refetching chapter progress:', err);
    }
  };

  return {
    progressMap,
    loading,
    getChapterProgress,
    isChapterCompleted,
    getReadingTime,
    refetch,
  };
};
