import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClassDiscussion {
  id: string;
  class_id: string;
  chapter_number: number;
  chapter_title: string | null;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useClassDiscussions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<ClassDiscussion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscussions = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_chapter_discussions')
        .select('*')
        .eq('class_id', classId)
        .order('chapter_number', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setDiscussions((data as ClassDiscussion[]) ?? []);
    } catch (e: any) {
      console.error('Error fetching discussions:', e);
      toast({ title: 'Erro', description: 'Falha ao carregar discussões.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDiscussion = async (
    classId: string,
    chapterNumber: number,
    content: string,
    chapterTitle?: string
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('class_chapter_discussions')
      .insert({
        class_id: classId,
        chapter_number: chapterNumber,
        chapter_title: chapterTitle || null,
        user_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar discussão.', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Discussão criada!' });
    await fetchDiscussions(classId);
    return data as ClassDiscussion;
  };

  const deleteDiscussion = async (discussionId: string, classId: string) => {
    const { error } = await supabase
      .from('class_chapter_discussions')
      .delete()
      .eq('id', discussionId);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao deletar discussão.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Discussão deletada' });
    await fetchDiscussions(classId);
  };

  return {
    discussions,
    loading,
    fetchDiscussions,
    createDiscussion,
    deleteDiscussion,
  };
};
