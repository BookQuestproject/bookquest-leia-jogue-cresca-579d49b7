import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const clearHashFromUrl = () => {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
    };

    const setErrorState = (message: string) => {
      if (!active) return;
      setError(message);
    };

    const processOAuthCallback = async () => {
      try {
        const hash = location.hash.startsWith("#")
          ? location.hash.slice(1)
          : location.hash;
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const authError =
          params.get("error") ??
          params.get("error_description") ??
          new URLSearchParams(location.search).get("error_description");

        if (authError) {
          console.error("Auth callback OAuth error:", authError);
          clearHashFromUrl();
          setErrorState("Falha na autenticação. Tente novamente pelo login.");
          return;
        }

        if (!accessToken || !refreshToken) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            clearHashFromUrl();
            window.location.replace("/dashboard");
            return;
          }

          clearHashFromUrl();
          setErrorState("Token inválido ou expirado. Faça login novamente.");
          return;
        }

        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        clearHashFromUrl();

        if (setSessionError || !data.session) {
          console.error("Auth callback setSession error:", setSessionError);
          setErrorState("Não foi possível iniciar sua sessão. Tente novamente.");
          return;
        }

        window.location.replace("/dashboard");
      } catch (err) {
        console.error("Auth callback exception:", err);
        clearHashFromUrl();
        setErrorState("Erro inesperado ao autenticar. Tente novamente.");
      }
    };

    processOAuthCallback();

    return () => {
      active = false;
    };
  }, [location.hash, location.search]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Erro na autenticação</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => navigate("/auth", { replace: true })} className="w-full">
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

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
