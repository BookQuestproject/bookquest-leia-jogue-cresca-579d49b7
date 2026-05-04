import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useReferral = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrGenerateCode = async () => {
      try {
        // First try to read the existing referral code
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.referral_code) {
          setReferralCode(profile.referral_code);
          return;
        }

        // No code yet (or no profile row): ensure profile exists, then nudge an
        // update so the BEFORE INSERT trigger fills referral_code, or generate one.
        await supabase
          .from('profiles')
          .upsert(
            { id: user.id, email: user.email ?? null, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
          );

        const { data: updated } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle();

        if (updated?.referral_code) {
          setReferralCode(updated.referral_code);
        } else {
          // Last-resort: ask the DB to generate a code and persist it
          const { data: gen } = await supabase.rpc('generate_referral_code');
          if (gen) {
            await supabase.from('profiles').update({ referral_code: gen }).eq('id', user.id);
            setReferralCode(gen as string);
          }
        }
      } catch (err) {
        console.error('Error fetching referral code:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateCode();
  }, [user]);

  const copyToClipboard = async () => {
    if (!referralCode) return;
    const url = `${window.location.origin}/auth?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Compartilhe com seus amigos para ganharem Essência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return { referralCode, loading, copyToClipboard };
};
