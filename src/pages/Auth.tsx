import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import crownIcon from '@/assets/crown-icon.png';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}`,
        extraParams: {
          prompt: 'select_account',
        },
      });
      if (result?.error) {
        console.error('Google OAuth error:', result.error);
        toast({ title: 'Erro', description: 'Erro ao conectar com Google. Tente novamente.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Google OAuth exception:', err);
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado ao conectar com Google', variant: 'destructive' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) navigate('/quiz-onboarding');
  }, [user, loading, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0] === 'email') newErrors.email = error.message;
          if (error.path[0] === 'password') newErrors.password = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = error.message.includes('Invalid login credentials')
            ? 'Email ou senha incorretos. Se você ainda não tem conta, clique em "Cadastre-se".'
            : error.message.includes('Email not confirmed')
            ? 'Confirme seu email antes de fazer login. Verifique sua caixa de entrada.'
            : 'Erro ao fazer login. Tente novamente.';
          toast({ title: 'Erro no login', description: msg, variant: 'destructive' });
        } else {
          toast({ title: 'Bem-vindo de volta!', description: 'Login realizado com sucesso' });
          navigate('/quiz-onboarding');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          const message = error.message.includes('User already registered')
            ? 'Este email já está cadastrado. Volte ao login para acessar.'
            : 'Erro ao criar conta';
          toast({ title: 'Erro', description: message, variant: 'destructive' });
        } else {
          toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar o cadastro.' });
        }
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Digite seu email para redefinir a senha' });
      return;
    }
    const emailCheck = z.string().email().safeParse(email);
    if (!emailCheck.success) {
      setErrors({ email: 'Email inválido' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: 'Erro', description: 'Não foi possível enviar o email de redefinição', variant: 'destructive' });
      } else {
        setResetSent(true);
        toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada para redefinir a senha' });
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Fraca', color: 'bg-destructive' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, pwd.length >= 10].filter(Boolean).length;
    if (score <= 2) return { level: 2, label: 'Média', color: 'bg-accent' };
    if (score <= 3) return { level: 3, label: 'Boa', color: 'bg-secondary' };
    return { level: 4, label: 'Forte', color: 'bg-success' };
  };

  const strength = getPasswordStrength(password);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background text-foreground overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.05] via-transparent to-accent/[0.02]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-accent/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/[0.06] blur-[100px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Crown + Title */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 mb-5 animate-scale-in">
            <img
              src={crownIcon}
              alt="BookQuest"
              className="w-full h-full object-contain drop-shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
            />
          </div>
          <h1 className={`text-3xl font-serif font-bold text-foreground tracking-tight transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            {isForgotPassword ? 'Redefinir Senha' : isLogin ? 'Bem-vindo ao BookQuest' : 'Comece sua Jornada'}
          </h1>
          <p className={`text-muted-foreground mt-2 text-sm transition-all duration-300 delay-75 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            {isForgotPassword
              ? 'Enviaremos um link para redefinir sua senha'
              : isLogin
              ? 'Entre para continuar sua aventura literária'
              : 'Crie sua conta e embarque nessa aventura'}
          </p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-7 shadow-[0_8px_40px_-12px_hsl(var(--accent)/0.15)] transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          {isForgotPassword ? (
            /* Forgot Password Form */
            <div className="space-y-5">
              {resetSent ? (
                <div className="text-center py-4 animate-fade-in">
                  <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Email enviado!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para redefinir sua senha.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-foreground/80 text-sm font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-accent/20 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)] transition-all duration-200"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <Button
                    type="button"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 shadow-md shadow-accent/20 transition-all duration-200"
                    disabled={isLoading}
                    onClick={handleForgotPassword}
                  >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar link de redefinição'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setErrors({}); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Voltar ao login
                  </button>
                </>
              )}
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
                Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-accent/20 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)] transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80 text-sm font-medium">
                  Senha
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setIsTransitioning(true); setTimeout(() => { setIsForgotPassword(true); setErrors({}); setIsTransitioning(false); }, 200); }}
                    className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={password.length > 0 ? '' : 'Digite sua senha'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-accent/60 focus:ring-accent/20 focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.08)] transition-all duration-200"
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

              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((dot) => (
                      <div
                        key={dot}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          dot <= strength.level ? strength.color : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strength.label}</span>
                  <span className="text-xs text-muted-foreground/60 ml-auto">
                    {password.length} caracteres
                  </span>
                </div>
              )}

              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-px active:translate-y-0 transition-all duration-200"
              disabled={isLoading || isGoogleLoading || isTransitioning}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? 'Entrar' : 'Criar conta'
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground/60">ou continue com</span>
              </div>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-border bg-muted/30 text-foreground hover:bg-muted/60 hover:border-border transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continuar com Google
            </Button>
          </form>
          )}

          {/* Toggle - only show when not in forgot password mode */}
          {!isForgotPassword && (
          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setPassword('');
                  setShowPassword(false);
                  setIsTransitioning(false);
                }, 200);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              disabled={isLoading}
            >
              {isLogin ? (
                <>Não tem conta? <span className="text-accent font-semibold">Cadastre-se</span></>
              ) : (
                <>Já tem conta? <span className="text-accent font-semibold">Entre</span></>
              )}
            </button>
          </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          © {new Date().getFullYear()} BookQuest. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Auth;
