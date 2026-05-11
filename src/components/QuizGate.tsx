import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface QuizGateProps {
  children: ReactNode;
}

/**
 * Redirects authenticated users who haven't completed the quiz
 * to the quiz onboarding page. Allows unauthenticated users and admins through.
 */
const QuizGate = ({ children }: QuizGateProps) => {
  const { user, loading: authLoading } = useAuth();
  const { quizCompleted, isAdmin, loading: profileLoading } = useProfile();
  const location = useLocation();

  // Don't gate these routes
  const exemptPaths = ["/", "/auth", "/quiz-literario", "/configuracoes", "/edu", "/entrar/", "/auth/callback", "/politica-de-privacidade", "/termos-de-servico"];
  if (exemptPaths.some(p => location.pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Still loading
  if (authLoading || profileLoading) {
    return <>{children}</>;
  }

  // Not logged in - let them browse freely
  if (!user) {
    return <>{children}</>;
  }

  // Admins skip quiz gate
  if (isAdmin) {
    return <>{children}</>;
  }

  // Logged in but hasn't completed quiz
  if (!quizCompleted) {
    return <Navigate to="/quiz-literario" replace />;
  }

  return <>{children}</>;
};

export default QuizGate;
