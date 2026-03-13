import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase JS client automatically picks up tokens from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate("/auth", { replace: true });
          return;
        }

        if (session) {
          navigate("/quiz-onboarding", { replace: true });
        } else {
          // Fallback: listen for the auth state change (hash may still be processing)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                subscription.unsubscribe();
                navigate("/quiz-onboarding", { replace: true });
              }
            }
          );

          // Timeout fallback
          setTimeout(() => {
            subscription.unsubscribe();
            navigate("/auth", { replace: true });
          }, 5000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
