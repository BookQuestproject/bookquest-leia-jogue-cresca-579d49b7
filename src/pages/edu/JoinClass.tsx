import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { z } from "zod";
import logoCrown from "@/assets/logo-crown-transparent.png";

const schema = z.object({
  fullName: z.string().trim().min(2, "Digite seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").max(72),
});

const JoinClass = () => {
  const { codigo = "" } = useParams<{ codigo: string }>();
  const code = codigo.toUpperCase();
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [teacherBlocked, setTeacherBlocked] = useState(false);

  const [classInfo, setClassInfo] = useState<{ id: string; name: string } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      if (!code) { setNotFound(true); setLookupLoading(false); return; }
      const { data } = await supabase
        .rpc("find_class_by_code" as any, { _code: code })
        .maybeSingle();
      if (data) setClassInfo(data as any);
      else setNotFound(true);
      setLookupLoading(false);
    })();
  }, [code]);

  // If already logged in, just join and go to class room
  useEffect(() => {
    (async () => {
      if (!user || !classInfo) return;
      // Block teachers from joining via class code
      const { data: teacherRow } = await supabase
        .from("edu_teachers" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (teacherRow) {
        setTeacherBlocked(true);
        return;
      }
      void joinAndGo(user.email ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, classInfo]);

  const joinAndGo = async (studentEmail: string | null, name?: string) => {
    const { data, error } = await supabase.rpc("student_join_class_by_code" as any, {
      _code: code,
      _email: studentEmail,
    });
    if (error || !data) {
      toast({ title: "Erro ao entrar na turma", description: "Tente novamente.", variant: "destructive" });
      return;
    }
    if (name) {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) await supabase.from("profiles").update({ full_name: name }).eq("id", u.user.id);
    }
    try { localStorage.setItem("bookquest-edu-pending-class", String(data)); } catch {}

    // Check if onboarding already completed → go straight to class room
    const { data: prof } = await supabase
      .from("profiles")
      .select("edu_onboarding_completed")
      .eq("id", (await supabase.auth.getUser()).data.user!.id)
      .maybeSingle();
    if ((prof as any)?.edu_onboarding_completed) {
      navigate("/edu/aluno", { replace: true });
    } else {
      navigate("/edu/onboarding-aluno", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach(er => { errs[er.path[0] as string] = er.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await signUp(email, password);
      if (error && !error.message?.includes("already")) {
        toast({ title: "Não foi possível criar a conta", description: error.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      if (error?.message?.includes("already")) {
        const { error: signInErr } = await signIn(email, password);
        if (signInErr) {
          toast({ title: "Conta já existe", description: "Senha incorreta. Faça login para continuar.", variant: "destructive" });
          setSubmitting(false);
          return;
        }
      }
      // Wait briefly for session to settle
      setTimeout(() => joinAndGo(email, fullName), 600);
    } catch (err: any) {
      toast({ title: "Erro inesperado", description: err?.message ?? "Tente novamente", variant: "destructive" });
      setSubmitting(false);
    }
  };

  if (lookupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#021f53" }}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (teacherBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-white" style={{ backgroundColor: "#021f53" }}>
        <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-amber-400" />
            <h1 className="text-2xl font-bold">Acesso restrito a alunos</h1>
            <p className="text-sm text-white/70">
              Esta página é exclusiva para alunos. Professores acessam pelo painel próprio.
            </p>
            <Button onClick={() => navigate("/edu/professor", { replace: true })}
              className="font-bold text-[#021f53]"
              style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}>
              Ir para o painel do professor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound || !classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-white" style={{ backgroundColor: "#021f53" }}>
        <Card className="max-w-md w-full bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-amber-400" />
            <h1 className="text-2xl font-bold">Turma não encontrada</h1>
            <p className="text-sm text-white/70">
              O código <strong className="font-mono">{code || "—"}</strong> não corresponde a nenhuma turma ativa.
              Confira com seu professor.
            </p>
            <Link to="/edu" className="inline-block text-amber-400 hover:underline text-sm">Voltar</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white" style={{ backgroundColor: "#021f53" }}>
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <img src={logoCrown} alt="BookQuest" className="h-14 w-14 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold mb-2">Entrar na turma</p>
          <h1 className="text-3xl font-bold">{classInfo.name}</h1>
          <p className="text-sm text-white/60 mt-2">
            Crie sua conta com seu e-mail escolar para começar a ler.
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/80">Nome completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  disabled={submitting}
                />
                {errors.fullName && <p className="text-xs text-red-300">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">E-mail escolar</Label>
                <Input
                  id="email" type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aluno@escola.com.br"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  disabled={submitting}
                />
                {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Criar senha</Label>
                <Input
                  id="password" type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  disabled={submitting}
                />
                {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 font-bold text-[#021f53] hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar na aventura <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
              <p className="text-[11px] text-center text-white/50">
                Já tem conta? <Link to={`/auth?redirect=/entrar/${code}`} className="text-amber-400 hover:underline">Faça login</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/50">
          <BookOpen className="h-3.5 w-3.5" /> Sua jornada de leitura começa aqui
        </div>
      </div>
    </div>
  );
};

export default JoinClass;
