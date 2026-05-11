import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import EduDashboard from "./EduDashboard";
import TeacherProfileGate from "@/components/edu/TeacherProfileGate";

const EduProfessor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      if (authLoading || roleLoading) return;
      if (!user) { navigate("/auth?redirect=/edu", { replace: true }); return; }
      if (!isTeacher) { navigate("/edu", { replace: true }); return; }

      const { data } = await supabase
        .from("edu_teachers" as any)
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if ((data as any)?.onboarding_completed === false) {
        navigate("/edu/onboarding", { replace: true });
        return;
      }
      setChecking(false);
    })();
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading || checking) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isTeacher) return null;

  return (
    <TeacherProfileGate>
      <EduDashboard />
    </TeacherProfileGate>
  );
};

export default EduProfessor;
