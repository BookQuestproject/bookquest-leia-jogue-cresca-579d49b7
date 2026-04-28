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
        // Count total founders via secure RPC (no row data exposed)
        const { data: countData } = await supabase.rpc("get_founder_count" as any);
        setTotalFounders(typeof countData === "number" ? countData : 0);

        // Check if current user is founder (RLS allows reading own row only)
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
