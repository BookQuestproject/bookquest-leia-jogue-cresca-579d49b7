import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
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
  isAdmin: boolean;
  quizCompleted: boolean;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  updateQuizCompleted: (literaryProfile: any) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Fetch profile (can be null for users without row yet)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData ?? null);

      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!roleData);
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
      const payload: any = {
        id: user.id,
        email: user.email ?? null,
        full_name: literaryProfile?.name || user.user_metadata?.full_name || null,
        username: literaryProfile?.username || null,
        quiz_completed: true,
        literary_profile: literaryProfile,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select('*')
        .single();

      if (error) throw error;

      // Update local state immediately so QuizGate won't redirect back
      setProfile(data);
    } catch (error) {
      console.error('Error updating quiz status:', error);
      throw error; // Re-throw so callers know it failed
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

  // Admins always have premium access
  const isPremium = isAdmin || (profile?.is_premium ?? false);

  const value: ProfileContextType = {
    profile,
    loading,
    isPremium,
    isAdmin,
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

const defaultProfileContext: ProfileContextType = {
  profile: null,
  loading: true,
  isPremium: false,
  isAdmin: false,
  quizCompleted: false,
  refreshProfile: async () => {},
  checkSubscription: async () => {},
  updateQuizCompleted: async () => {},
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  return context ?? defaultProfileContext;
};
