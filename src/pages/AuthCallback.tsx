import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthWithSessionFromUrl = typeof supabase.auth & {
  getSessionFromUrl?: (options?: { storeSession?: boolean }) => Promise<{
    data?: { session: Session | null };
    error?: Error | null;
  }>;
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    let timeoutId: number | undefined;
    let unsubscribe: (() => void) | undefined;

    const extractTokensFromHash = () => {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);

      return {
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
      };
    };

    const clearAuthHash = () => {
      if (!window.location.hash) return;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };

    const redirectWithSession = (session: Session | null) => {
      if (!session) return false;
      clearAuthHash();
      navigate("/quiz-onboarding", { replace: true });
      return true;
    };

    const handleCallback = async () => {
      try {
        const authClient = supabase.auth as AuthWithSessionFromUrl;

        if (typeof authClient.getSessionFromUrl === "function") {
          const { data, error } = await authClient.getSessionFromUrl({ storeSession: true });
          if (error) {
            console.error("Auth callback getSessionFromUrl error:", error);
          }
          if (redirectWithSession(data?.session ?? null)) {
            return;
          }
        }

        const {
          data: { session: existingSession },
          error: existingSessionError,
        } = await supabase.auth.getSession();

        if (existingSessionError) {
          console.error("Auth callback getSession error:", existingSessionError);
        }

        if (redirectWithSession(existingSession)) {
          return;
        }

        const { accessToken, refreshToken } = extractTokensFromHash();

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Auth callback setSession error:", error);
          }

          if (redirectWithSession(data.session)) {
            return;
          }
        }

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (redirectWithSession(session)) {
            unsubscribe?.();
            if (timeoutId) window.clearTimeout(timeoutId);
          }
        });

        unsubscribe = () => data.subscription.unsubscribe();

        timeoutId = window.setTimeout(() => {
          unsubscribe?.();
          navigate("/auth", { replace: true });
        }, 5000);
      } catch (err) {
        console.error("Auth callback exception:", err);
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      unsubscribe?.();
    };
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
