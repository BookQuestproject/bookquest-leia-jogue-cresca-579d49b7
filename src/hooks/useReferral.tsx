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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile.referral_code) {
          setReferralCode(profile.referral_code);
        } else {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select('referral_code')
            .single();
            
          if (!updateError && updatedProfile?.referral_code) {
            setReferralCode(updatedProfile.referral_code);
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
