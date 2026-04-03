import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

const TEACHER_ACTIVATION_CODE = "BOOKQUEST2026";

export const useEduRole = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);

  const checkTeacherStatus = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('edu_teachers' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) setIsTeacher(true);
    } catch {
      // Not a teacher
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentClasses = useCallback(async () => {
    if (!user) return;
    const { data: memberships } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user.id);
    
    if (!memberships || memberships.length === 0) {
      setStudentClasses([]);
      return;
    }

    const classIds = memberships.map(m => m.class_id);
    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds)
      .eq('is_active', true);
    
    setStudentClasses((classes as any[]) ?? []);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkTeacherStatus();
      fetchStudentClasses();
    }
  }, [authLoading, checkTeacherStatus, fetchStudentClasses]);

  const activateTeacher = async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    if (code.toUpperCase() !== TEACHER_ACTIVATION_CODE) {
      toast({ title: 'Código inválido', description: 'O código de ativação não é válido.', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase
      .from('edu_teachers' as any)
      .insert({ user_id: user.id, activation_code: code.toUpperCase() });

    if (error) {
      if (error.code === '23505') {
        setIsTeacher(true);
        return true;
      }
      toast({ title: 'Erro', description: 'Falha ao ativar conta de professor.', variant: 'destructive' });
      return false;
    }

    setIsTeacher(true);
    toast({ title: '✅ Conta de professor ativada!', description: 'Bem-vindo ao BookQuest EDU!' });
    return true;
  };

  return {
    isTeacher,
    loading: loading || authLoading,
    studentClasses,
    activateTeacher,
    fetchStudentClasses,
  };
};
