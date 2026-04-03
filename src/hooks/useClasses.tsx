import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClassData {
  id: string;
  name: string;
  grade: string | null;
  description: string | null;
  book_id: string | null;
  book_title: string | null;
  author: string | null;
  total_pages: number | null;
  reading_start_date: string | null;
  reading_deadline: string | null;
  access_code: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_archived: boolean | null;
}

export interface ClassMember {
  id: string;
  class_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export const useClasses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch classes where user is teacher (RLS handles the filtering)
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClasses((data as ClassData[]) ?? []);
    } catch (e: any) {
      console.error('Error fetching classes:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const createClass = async (payload: {
    name: string;
    grade?: string;
    description?: string;
    book_id?: string;
    book_title?: string;
    author?: string;
    total_pages?: number;
    reading_start_date?: string;
    reading_deadline?: string;
  }) => {
    if (!user) return null;

    // Generate code via DB function
    const { data: codeData, error: codeError } = await supabase.rpc('generate_class_code');
    if (codeError) {
      toast({ title: 'Erro', description: 'Falha ao gerar código da turma.', variant: 'destructive' });
      return null;
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...payload,
        teacher_id: user.id,
        access_code: codeData as string,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar turma.', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Turma criada!', description: `Código: ${(data as ClassData).access_code}` });
    await fetchClasses();
    return data as ClassData;
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir turma.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Turma excluída' });
    await fetchClasses();
  };

  const archiveClass = async (id: string) => {
    const { error } = await supabase
      .from('classes')
      .update({ is_archived: true, is_active: false })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao arquivar turma.', variant: 'destructive' });
      return;
    }
    await fetchClasses();
  };

  const duplicateClass = async (id: string) => {
    const classData = classes.find(c => c.id === id);
    if (!classData || !user) return null;

    // Generate new code
    const { data: codeData, error: codeError } = await supabase.rpc('generate_class_code');
    if (codeError) {
      toast({ title: 'Erro', description: 'Falha ao gerar código.', variant: 'destructive' });
      return null;
    }

    // Create new class with same data
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        name: `${classData.name} (Cópia)`,
        grade: classData.grade,
        description: classData.description,
        book_id: classData.book_id,
        book_title: classData.book_title,
        author: classData.author,
        total_pages: classData.total_pages,
        teacher_id: user.id,
        access_code: codeData as string,
      })
      .select()
      .single();

    if (createError) {
      toast({ title: 'Erro', description: 'Falha ao duplicar turma.', variant: 'destructive' });
      return null;
    }

    // Duplicate questions
    const { data: questions } = await supabase
      .from('class_questions')
      .select('*')
      .eq('class_id', id);

    if (questions && questions.length > 0) {
      const newQuestions = questions.map(q => ({
        class_id: (newClass as ClassData).id,
        chapter_number: q.chapter_number,
        created_by: user.id,
        question_text: q.question_text,
      }));
      
      await supabase.from('class_questions').insert(newQuestions);
    }

    toast({ title: 'Turma duplicada!', description: 'Perguntas foram copiadas.' });
    await fetchClasses();
    return newClass as ClassData;
  };

  const fetchClassMembers = async (classId: string): Promise<ClassMember[]> => {
    const { data, error } = await supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    // Fetch profiles for each member
    const members = (data ?? []) as ClassMember[];
    const userIds = members.map(m => m.user_id);
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles_public' as any)
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profiles) {
        const profileMap = new Map(((profiles as any[]).map((p: any) => [p.id, p])));
        members.forEach(m => {
          const prof = profileMap.get(m.user_id) as any;
          if (prof) {
            m.profile = {
              full_name: prof.full_name,
              email: null,
              avatar_url: prof.avatar_url,
            };
          }
        });
      }
    }

    return members;
  };

  const joinClassByCode = async (code: string) => {
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado.', variant: 'destructive' });
      return false;
    }

    // Find class by code
    const { data: classData, error: findError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('access_code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (findError || !classData) {
      toast({ title: 'Código inválido', description: 'Nenhuma turma encontrada com esse código.', variant: 'destructive' });
      return false;
    }

    const { error: joinError } = await supabase
      .from('class_members')
      .insert({ class_id: (classData as any).id, user_id: user.id });

    if (joinError) {
      if (joinError.code === '23505') {
        toast({ title: 'Já inscrito', description: 'Você já faz parte dessa turma.' });
      } else {
        toast({ title: 'Erro', description: 'Falha ao entrar na turma.', variant: 'destructive' });
      }
      return false;
    }

    toast({ title: 'Bem-vindo!', description: `Você entrou na turma "${(classData as any).name}".` });
    return true;
  };

  return { 
    classes, 
    loading, 
    fetchClasses, 
    createClass, 
    deleteClass, 
    archiveClass,
    duplicateClass,
    fetchClassMembers, 
    joinClassByCode 
  };
};
