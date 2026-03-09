import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface NewsItem {
  id: string;
  type: 'update' | 'curiosity' | 'announcement';
  title: string;
  content: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_read?: boolean;
}

export const useNews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar todas as notícias
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (newsError) throw newsError;

      // Se o usuário estiver logado, buscar status de leitura
      if (user) {
        const { data: readStatus, error: readError } = await supabase
          .from('news_read_status')
          .select('news_id')
          .eq('user_id', user.id);

        if (readError) throw readError;

        const readNewsIds = new Set(readStatus?.map(r => r.news_id) || []);
        
        const newsWithReadStatus = (newsData || []).map(item => ({
          ...item,
          is_read: readNewsIds.has(item.id),
        }));

        setNews(newsWithReadStatus);
      } else {
        setNews(newsData || []);
      }
    } catch (e: any) {
      console.error('Error fetching news:', e);
      toast({ title: 'Erro', description: 'Falha ao carregar notícias.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNews();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('news_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news',
        },
        () => {
          fetchNews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNews]);

  const markAsRead = async (newsId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('news_read_status')
        .upsert({
          news_id: newsId,
          user_id: user.id,
        }, { onConflict: 'news_id,user_id' });

      if (error) throw error;

      // Atualizar localmente
      setNews(prev => prev.map(item => 
        item.id === newsId ? { ...item, is_read: true } : item
      ));
    } catch (e: any) {
      console.error('Error marking news as read:', e);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadNews = news.filter(n => !n.is_read);
      const inserts = unreadNews.map(n => ({
        news_id: n.id,
        user_id: user.id,
      }));

      if (inserts.length > 0) {
        const { error } = await supabase
          .from('news_read_status')
          .upsert(inserts, { onConflict: 'news_id,user_id' });

        if (error) throw error;

        toast({ title: 'Todas as notícias foram marcadas como lidas!' });
        await fetchNews();
      }
    } catch (e: any) {
      console.error('Error marking all as read:', e);
      toast({ title: 'Erro', description: 'Falha ao marcar como lidas.', variant: 'destructive' });
    }
  };

  const getUnreadCount = () => news.filter(n => !n.is_read).length;

  return {
    news,
    loading,
    fetchNews,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  };
};
