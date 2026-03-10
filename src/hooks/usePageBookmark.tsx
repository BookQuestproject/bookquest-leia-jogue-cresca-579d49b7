import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PageBookmarks {
  [chapterId: string]: number | null;
}

export const usePageBookmark = (bookId: string | undefined) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<PageBookmarks>({});
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load all bookmarks for the book
  useEffect(() => {
    const load = async () => {
      if (!user || !bookId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('chapter_id, current_page')
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (!error && data) {
          const map: PageBookmarks = {};
          data.forEach((row) => {
            map[row.chapter_id] = row.current_page;
          });
          setBookmarks(map);
        }
      } catch (err) {
        console.error('Error loading page bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, bookId]);

  // Save page bookmark with debounce
  const setPageBookmark = useCallback(
    (chapterId: number, page: number) => {
      if (!user || !bookId) return;

      const key = String(chapterId);

      // Update local state immediately for responsive UI
      setBookmarks((prev) => ({ ...prev, [key]: page }));

      // Debounce the DB write
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }

      debounceTimers.current[key] = setTimeout(async () => {
        try {
          await supabase.from('reading_progress').upsert(
            {
              user_id: user.id,
              book_id: bookId,
              chapter_id: key,
              current_page: page,
            },
            { onConflict: 'user_id,book_id,chapter_id' }
          );
        } catch (err) {
          console.error('Error saving page bookmark:', err);
        }
      }, 500);
    },
    [user, bookId]
  );

  const getPageBookmark = useCallback(
    (chapterId: number): number | null => {
      return bookmarks[String(chapterId)] ?? null;
    },
    [bookmarks]
  );

  // Cleanup debounce timers
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  return { bookmarks, loading, setPageBookmark, getPageBookmark };
};
