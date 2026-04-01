import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface BookReview {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; username: string | null };
}

export const useBookReviews = (bookId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<BookReview | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('book_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for each review
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(((profiles as any[]) || []).map((p: any) => [p.id, p]));

      const enriched = (data || []).map(r => ({
        ...r,
        profile: (profileMap.get(r.user_id) as any) || { full_name: null, avatar_url: null },
      }));

      setReviews(enriched as any);

      if (user) {
        const mine = enriched.find(r => r.user_id === user.id);
        setUserReview((mine as any) || null);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (bookIdParam: string, rating: number, comment: string, bookTitle?: string) => {
    if (!user) {
      toast({ title: 'Faça login para avaliar', variant: 'destructive' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('book_reviews')
        .upsert({
          user_id: user.id,
          book_id: bookIdParam,
          book_title: bookTitle || null,
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,book_id' });

      if (error) throw error;

      toast({ title: '✦ Avaliação publicada!', description: 'Sua opinião foi registrada.' });
      await fetchReviews();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro ao avaliar', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('book_reviews').delete().eq('id', reviewId);
      if (error) throw error;
      toast({ title: 'Avaliação removida' });
      await fetchReviews();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    reviews,
    loading,
    userReview,
    averageRating,
    totalReviews: reviews.length,
    submitReview,
    deleteReview,
    refetch: fetchReviews,
  };
};
