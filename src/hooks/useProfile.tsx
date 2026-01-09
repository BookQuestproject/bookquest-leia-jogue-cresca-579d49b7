import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  quiz_completed: boolean;
  literary_profile: any | null;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  quizCompleted: boolean;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  updateQuizCompleted: (literaryProfile: any) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      
      // Refresh profile after checking subscription
      await fetchProfile();
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const updateQuizCompleted = async (literaryProfile: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          quiz_completed: true, 
          literary_profile: literaryProfile 
        })
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile();
    } catch (error) {
      console.error('Error updating quiz status:', error);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (session) {
      checkSubscription();
    }
  }, [session]);

  const value: ProfileContextType = {
    profile,
    loading,
    isPremium: profile?.is_premium ?? false,
    quizCompleted: profile?.quiz_completed ?? false,
    refreshProfile,
    checkSubscription,
    updateQuizCompleted,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
