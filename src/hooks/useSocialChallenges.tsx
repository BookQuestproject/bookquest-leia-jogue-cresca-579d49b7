import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SocialChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenge_type: string;
  title: string;
  description: string | null;
  goal_value: number;
  challenger_progress: number;
  challenged_progress: number;
  status: string;
  winner_id: string | null;
  xp_reward: number;
  expires_at: string | null;
  created_at: string;
  challenger_name?: string;
  challenged_name?: string;
}

const CHALLENGE_TEMPLATES = [
  { type: 'streak_7days', title: 'Maratona de 7 dias', description: 'Ler por 7 dias seguidos', goal: 7, xp: 100 },
  { type: 'read_3chapters', title: 'Sprint de Capítulos', description: 'Ler 3 capítulos primeiro', goal: 3, xp: 75 },
  { type: 'finish_book', title: 'Corrida Literária', description: 'Terminar um livro primeiro', goal: 1, xp: 150 },
  { type: 'read_5days', title: 'Semana Constante', description: 'Ler por 5 dias em uma semana', goal: 5, xp: 80 },
];

export const useSocialChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (data ?? []) as SocialChallenge[];

      // Fetch profile names
      const userIds = [...new Set(items.flatMap(c => [c.challenger_id, c.challenged_id]))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles_public' as any)
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const nameMap = new Map((profiles ?? []).map(p => [p.id, p.full_name || p.email || 'Usuário']));
        items.forEach(c => {
          c.challenger_name = nameMap.get(c.challenger_id) || 'Usuário';
          c.challenged_name = nameMap.get(c.challenged_id) || 'Usuário';
        });
      }

      setChallenges(items);
    } catch (e) {
      console.error('Error fetching challenges:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const createChallenge = async (challengedEmail: string, templateType: string) => {
    if (!user) return false;

    const template = CHALLENGE_TEMPLATES.find(t => t.type === templateType);
    if (!template) return false;

    // Find user by email
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', challengedEmail)
      .maybeSingle();

    if (!targetProfile) {
      toast({ title: 'Usuário não encontrado', description: 'Verifique o email informado.', variant: 'destructive' });
      return false;
    }

    if ((targetProfile as any).id === user.id) {
      toast({ title: 'Ops!', description: 'Você não pode desafiar a si mesmo.', variant: 'destructive' });
      return false;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error } = await supabase
      .from('social_challenges')
      .insert({
        challenger_id: user.id,
        challenged_id: (targetProfile as any).id,
        challenge_type: template.type,
        title: template.title,
        description: template.description,
        goal_value: template.goal,
        xp_reward: template.xp,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao criar desafio.', variant: 'destructive' });
      return false;
    }

    toast({ title: '⚔️ Desafio enviado!', description: `Aguardando ${challengedEmail} aceitar.` });
    await fetchChallenges();
    return true;
  };

  const respondChallenge = async (challengeId: string, accept: boolean) => {
    const newStatus = accept ? 'active' : 'declined';
    const { error } = await supabase
      .from('social_challenges')
      .update({ status: newStatus })
      .eq('id', challengeId);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao responder desafio.', variant: 'destructive' });
      return;
    }

    toast({
      title: accept ? '✅ Desafio aceito!' : '❌ Desafio recusado',
      description: accept ? 'Boa sorte!' : 'Desafio recusado com sucesso.',
    });
    await fetchChallenges();
  };

  return { challenges, loading, createChallenge, respondChallenge, fetchChallenges, templates: CHALLENGE_TEMPLATES };
};
