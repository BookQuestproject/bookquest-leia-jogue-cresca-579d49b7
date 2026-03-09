import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MonthlyBook {
  id: string;
  month_year: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

export interface BookClubContent {
  id: string;
  monthly_id: string;
  content_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  sort_order: number;
  created_at: string;
}

export const useBookClubMonthly = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [months, setMonths] = useState<MonthlyBook[]>([]);
  const [contents, setContents] = useState<BookClubContent[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: m } = await (supabase.from('book_club_monthly') as any).select('*').order('month_year', { ascending: false });
      const { data: c } = await (supabase.from('book_club_content') as any).select('*').order('sort_order', { ascending: true });
      setMonths(m || []);
      setContents(c || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const currentMonth = months.find(m => m.status === 'active') || null;

  const createMonthlyBook = async (data: { month_year: string; book_title: string; book_author: string; book_cover_url?: string; description?: string }) => {
    if (!user) return false;
    try {
      const { error } = await (supabase.from('book_club_monthly') as any).insert({ ...data, created_by: user.id });
      if (error) throw error;
      toast({ title: '📚 Livro do mês criado!' });
      await fetchAll();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const updateMonthlyBook = async (id: string, data: Partial<MonthlyBook>) => {
    try {
      const { error } = await (supabase.from('book_club_monthly') as any).update(data).eq('id', id);
      if (error) throw error;
      await fetchAll();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteMonthlyBook = async (id: string) => {
    try {
      const { error } = await (supabase.from('book_club_monthly') as any).delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Livro removido' });
      await fetchAll();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const addContent = async (data: { monthly_id: string; content_type: string; title: string; description?: string; file_url?: string; sort_order?: number }) => {
    if (!user) return false;
    try {
      const { error } = await (supabase.from('book_club_content') as any).insert({ ...data, created_by: user.id });
      if (error) throw error;
      toast({ title: '✅ Conteúdo adicionado!' });
      await fetchAll();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await (supabase.from('book_club_content') as any).delete().eq('id', id);
      if (error) throw error;
      await fetchAll();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('book-club').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('book-club').getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const getContentsForMonth = (monthlyId: string) => contents.filter(c => c.monthly_id === monthlyId);

  return {
    months, currentMonth, contents, loading, currentMonthKey,
    createMonthlyBook, updateMonthlyBook, deleteMonthlyBook,
    addContent, deleteContent, uploadFile, getContentsForMonth,
    refetch: fetchAll,
  };
};
