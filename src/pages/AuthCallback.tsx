import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const authError = params.get("error");

        if (authError) {
          console.error("Auth callback OAuth error:", authError);
          navigate("/auth", { replace: true });
          return;
        }

        if (!accessToken || !refreshToken) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            navigate("/dashboard", { replace: true });
            return;
          }

          navigate("/auth", { replace: true });
          return;
        }

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          console.error("Auth callback setSession error:", error);
          navigate("/auth", { replace: true });
          return;
        }

        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Auth callback exception:", err);
        navigate("/auth", { replace: true });
      }
    };

    processOAuthCallback();
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
