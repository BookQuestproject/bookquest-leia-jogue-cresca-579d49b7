import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingProgress {
  elapsed_time: number;
  is_paused: boolean;
  is_completed: boolean;
}

export const useReadingProgress = (bookId: string | undefined, chapterId: string | undefined) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !bookId || !chapterId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('elapsed_time, is_paused, is_completed')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .eq('chapter_id', chapterId)
          .maybeSingle();

        if (error) {
          console.error('Error loading reading progress:', error);
        } else if (data) {
          setProgress(data);
        }
      } catch (err) {
        console.error('Error loading reading progress:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user, bookId, chapterId]);

  // Save progress function
  const saveProgress = useCallback(async (
    elapsedTime: number, 
    isPaused: boolean, 
    isCompleted: boolean = false
  ) => {
    if (!user || !bookId || !chapterId) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: isPaused,
          is_completed: isCompleted,
        }, {
          onConflict: 'user_id,book_id,chapter_id'
        });

      if (error) {
        console.error('Error saving reading progress:', error);
      }
    } catch (err) {
      console.error('Error saving reading progress:', err);
    }
  }, [user, bookId, chapterId]);

  // Mark chapter as fully completed (keeps the record)
  const markAsCompleted = useCallback(async (elapsedTime: number) => {
    if (!user || !bookId || !chapterId) return;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: false,
          is_completed: true,
        }, {
          onConflict: 'user_id,book_id,chapter_id'
        });

      if (error) {
        console.error('Error marking chapter as completed:', error);
      }
    } catch (err) {
      console.error('Error marking chapter as completed:', err);
    }
  }, [user, bookId, chapterId]);

  // Clear progress (resets the chapter for re-reading)
  const clearProgress = useCallback(async () => {
    if (!user || !bookId || !chapterId) return;

    try {
      await supabase
        .from('reading_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('chapter_id', chapterId);
    } catch (err) {
      console.error('Error clearing reading progress:', err);
    }
  }, [user, bookId, chapterId]);

  return {
    progress,
    loading,
    saveProgress,
    markAsCompleted,
    clearProgress,
  };
};
