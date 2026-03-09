import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ClassQuestion {
  id: string;
  class_id: string;
  chapter_number: number | null;
  created_by: string;
  question_text: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionResponse {
  id: string;
  question_id: string;
  user_id: string;
  response_text: string;
  created_at: string;
  updated_at: string;
}

export const useClassQuestions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ClassQuestion[]>([]);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const { data: questionsData, error: qError } = await supabase
        .from('class_questions')
        .select('*')
        .eq('class_id', classId)
        .order('chapter_number', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (qError) throw qError;
      setQuestions((questionsData as ClassQuestion[]) ?? []);

      // Fetch all responses for these questions
      const questionIds = (questionsData ?? []).map((q: any) => q.id);
      if (questionIds.length > 0) {
        const { data: responsesData, error: rError } = await supabase
          .from('class_question_responses')
          .select('*')
          .in('question_id', questionIds)
          .order('created_at', { ascending: true });
        
        if (rError) throw rError;
        setResponses((responsesData as QuestionResponse[]) ?? []);
      } else {
        setResponses([]);
      }
    } catch (e: any) {
      console.error('Error fetching questions:', e);
      toast({ title: 'Erro', description: 'Falha ao carregar perguntas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createQuestion = async (
    classId: string,
    questionText: string,
    chapterNumber?: number
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('class_questions')
      .insert({
        class_id: classId,
        chapter_number: chapterNumber || null,
        created_by: user.id,
        question_text: questionText,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar pergunta.', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Pergunta criada!' });
    await fetchQuestions(classId);
    return data as ClassQuestion;
  };

  const createResponse = async (questionId: string, responseText: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('class_question_responses')
      .insert({
        question_id: questionId,
        user_id: user.id,
        response_text: responseText,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar resposta.', variant: 'destructive' });
      return null;
    }

    toast({ title: 'Resposta enviada!' });
    // Fetch the class_id from the question to refresh
    const question = questions.find(q => q.id === questionId);
    if (question) {
      await fetchQuestions(question.class_id);
    }
    return data as QuestionResponse;
  };

  return {
    questions,
    responses,
    loading,
    fetchQuestions,
    createQuestion,
    createResponse,
  };
};
