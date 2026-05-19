import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import EduDashboard from "./EduDashboard";

const EduProfessor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authLoading || roleLoading) return;
      if (!user || !isTeacher) {
        // EduLayout (rendered inside EduDashboard) handles the redirect
        if (!cancelled) setOnboardingChecked(true);
        return;
      }

      try {
        const { data } = await supabase
          .from("edu_teachers" as any)
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if ((data as any)?.onboarding_completed === false) {
          const { count } = await supabase
            .from("classes")
            .select("id", { count: "exact", head: true })
            .eq("teacher_id", user.id);

          if ((count ?? 0) > 0) {
            await supabase
              .from("edu_teachers" as any)
              .update({ onboarding_completed: true } as any)
              .eq("user_id", user.id);
          } else if (!cancelled) {
            navigate("/edu/onboarding", { replace: true });
            return;
          }
        }
      } catch (e) {
        console.error("[EduProfessor] onboarding check failed", e);
      }

      if (!cancelled) setOnboardingChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  // Always render EduDashboard so EduLayout's shell + loader are visible.
  // The onboarding redirect is handled silently above.
  return <EduDashboard key={onboardingChecked ? "ready" : "loading"} />;
};

export default EduProfessor;
