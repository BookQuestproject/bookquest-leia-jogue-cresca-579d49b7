import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface FounderInfo {
  totalFounders: number;
  slotsRemaining: number;
  isFounder: boolean;
  loading: boolean;
}

export const useFounderStatus = (): FounderInfo => {
  const { user } = useAuth();
  const [totalFounders, setTotalFounders] = useState(0);
  const [isFounder, setIsFounder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Count total founders
        const { count } = await supabase
          .from("founder_subscriptions" as any)
          .select("*", { count: "exact", head: true });

        setTotalFounders(count ?? 0);

        // Check if current user is founder
        if (user) {
          const { data } = await supabase
            .from("founder_subscriptions" as any)
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
          setIsFounder(!!data);
        }
      } catch (e) {
        console.error("Error fetching founder status:", e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return {
    totalFounders,
    slotsRemaining: Math.max(0, 100 - totalFounders),
    isFounder,
    loading,
  };
};
