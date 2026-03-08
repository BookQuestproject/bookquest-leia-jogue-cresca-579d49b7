import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserBadge {
  id: string;
  badge_type: string;
  badge_label: string;
  awarded_at: string;
  metadata: any;
}

interface UserTitle {
  id: string;
  title: string;
  is_active: boolean;
  awarded_at: string;
}

export const useUserBadges = (userId?: string) => {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        const { data: badgeData } = await supabase
          .from("user_badges" as any)
          .select("*")
          .eq("user_id", targetId);

        setBadges((badgeData as any[]) ?? []);

        const { data: titleData } = await supabase
          .from("user_titles" as any)
          .select("*")
          .eq("user_id", targetId)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        setActiveTitle((titleData as any)?.title ?? null);
      } catch (e) {
        console.error("Error fetching badges/titles:", e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [targetId]);

  const isFounder = badges.some(b => b.badge_type === "founder");

  return { badges, activeTitle, isFounder, loading };
};
