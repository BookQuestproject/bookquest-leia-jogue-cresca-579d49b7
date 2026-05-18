import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import EduDashboard from "./EduDashboard";

const EduProfessor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (authLoading || roleLoading) return;
      if (!user) {
        navigate("/auth?redirect=/edu/professor", { replace: true });
        return;
      }
      if (!isTeacher) {
        navigate("/edu/professor/entrar", { replace: true });
        return;
      }

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
        } else {
          navigate("/edu/onboarding", { replace: true });
          return;
        }
      }

      if (!cancelled) setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isTeacher) return null;

  return <EduDashboard />;
};

export default EduProfessor;
