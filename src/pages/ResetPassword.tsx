import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import crownIcon from '@/assets/crown-icon.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event from auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: 'Erro', description: 'Não foi possível redefinir a senha. Tente novamente.', variant: 'destructive' });
      } else {
        setSuccess(true);
        toast({ title: 'Senha redefinida!', description: 'Sua nova senha foi salva com sucesso.' });
        setTimeout(() => navigate('/home'), 2000);
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-[420px] text-center animate-fade-in">
          <div className="mx-auto w-20 h-20 mb-5">
            <img src={crownIcon} alt="BookQuest" className="w-full h-full object-contain opacity-50" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-3">Link inválido</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este link de redefinição de senha é inválido ou expirou.
          </p>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-[420px] text-center animate-fade-in">
          <div className="mx-auto w-16 h-16 mb-5 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-3">Senha redefinida!</h1>
          <p className="text-muted-foreground text-sm">
            Redirecionando para a página inicial...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.05] via-transparent to-accent/[0.02]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-accent/[0.03] blur-[150px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 mb-5 animate-scale-in">
            <img
              src={crownIcon}
              alt="BookQuest"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
            Nova Senha
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Defina uma nova senha para sua conta
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-7 shadow-[0_8px_40px_-12px_hsl(var(--accent)/0.15)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground/80 text-sm font-medium">
                Nova senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-muted/50 border-border focus:border-accent/60 focus:ring-accent/20 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)] transition-all duration-200"
                  disabled={isLoading}
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground/80 text-sm font-medium">
                Confirmar senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-muted/50 border-border focus:border-accent/60 focus:ring-accent/20 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)] transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-sm text-destructive animate-fade-in">As senhas não coincidem</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-px active:translate-y-0 transition-all duration-200"
              disabled={isLoading || password.length < 6 || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                'Redefinir Senha'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          © {new Date().getFullYear()} BookQuest. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
