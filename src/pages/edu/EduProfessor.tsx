import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import EduDashboard from "./EduDashboard";

/**
 * Wrapper that checks teacher status before showing the dashboard.
 * Redirects non-teachers back to /edu.
 */
const EduProfessor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth?redirect=/edu", { replace: true });
      } else if (!isTeacher) {
        navigate("/edu", { replace: true });
      }
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isTeacher) return null;

  // Render the existing dashboard (it's wrapped in EduLayout)
  return <EduDashboard />;
};

export default EduProfessor;
