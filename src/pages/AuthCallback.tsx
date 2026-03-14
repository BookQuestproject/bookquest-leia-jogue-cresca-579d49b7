import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : ""
    );

    const oauthError =
      urlParams.get("error_description") ||
      hashParams.get("error_description") ||
      hashParams.get("error");

    if (oauthError) {
      setError("Falha na autenticação. Tente novamente pelo login.");
      return;
    }

    // The Supabase client automatically detects the hash fragment
    // and processes the OAuth tokens. We just need to listen for the result.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Clean the URL hash
          window.history.replaceState(null, "", window.location.pathname);
          // Redirect to dashboard
          window.location.replace("/dashboard");
        }

        if (event === "TOKEN_REFRESHED" && session) {
          window.history.replaceState(null, "", window.location.pathname);
          window.location.replace("/dashboard");
        }
      }
    );

    // Fallback: if session already exists (e.g. Supabase processed it before this listener)
    const checkExistingSession = async () => {
      // Small delay to let Supabase process the hash
      await new Promise((r) => setTimeout(r, 1000));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.history.replaceState(null, "", window.location.pathname);
        window.location.replace("/dashboard");
      } else if (!window.location.hash) {
        // No hash and no session = something went wrong
        setError("Token inválido ou expirado. Faça login novamente.");
      }
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">
              Erro na autenticação
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => navigate("/auth", { replace: true })}
            className="w-full"
          >
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
