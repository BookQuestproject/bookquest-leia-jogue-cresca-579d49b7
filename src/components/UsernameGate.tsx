import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, AtSign, Check } from "lucide-react";
import { useLocation } from "react-router-dom";

interface UsernameGateProps {
  children: ReactNode;
}

const UsernameGate = ({ children }: UsernameGateProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isAdmin, refreshProfile } = useProfile();
  const location = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Exempt paths
  const exemptPaths = ["/", "/auth", "/quiz-literario", "/configuracoes", "/auth/callback", "/politica-de-privacidade", "/termos-de-servico", "/reset-password"];
  if (exemptPaths.some(p => location.pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Still loading or not logged in
  if (authLoading || profileLoading || !user) {
    return <>{children}</>;
  }

  // Admin or already has username
  if (isAdmin || profile?.username) {
    return <>{children}</>;
  }

  // Quiz not completed yet — let QuizGate handle it
  if (!profile?.quiz_completed) {
    return <>{children}</>;
  }

  const validateUsername = (value: string) => {
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 20) return "Máximo 20 caracteres";
    if (!/^[a-z0-9._]+$/.test(value)) return "Apenas letras minúsculas, números, pontos e underline";
    return "";
  };

  const handleSave = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Check uniqueness
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        setError("Este nome de usuário já está em uso");
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Nome de usuário definido!", description: `Você agora é @${username}` });
      await refreshProfile();
    } catch (err: any) {
      console.error(err);
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <AtSign className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Escolha seu nome de usuário
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Seu @username será visível nos rankings, comunidades e avaliações. Escolha com cuidado!
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <Input
              value={username}
              onChange={e => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
                setUsername(val);
                setError("");
              }}
              placeholder="seu.username"
              className="pl-8"
              maxLength={20}
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive text-left">{error}</p>
          )}

          <p className="text-xs text-muted-foreground text-left">
            Apenas letras minúsculas, números, pontos e underline. De 3 a 20 caracteres.
          </p>

          <Button
            onClick={handleSave}
            disabled={saving || username.length < 3}
            className="w-full gap-2"
          >
            <Check className="w-4 h-4" />
            {saving ? "Salvando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsernameGate;
