import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logoCrown from "@/assets/logo-crown-transparent.png";

const STUDENT_ENTRY = "/edu/aluno/entrar";

const EduAlunoEntry = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [studentCode, setStudentCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [ready, setReady] = useState(false);
  const [joinedClass, setJoinedClass] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=${encodeURIComponent(STUDENT_ENTRY)}`, { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: membership } = await supabase
        .from("class_members")
        .select("class_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.class_id) {
        const { data: cls } = await supabase
          .from("classes")
          .select("id,name")
          .eq("id", membership.class_id)
          .maybeSingle();

        if (cls) {
          setJoinedClass(cls as any);
        }
      }
      setReady(true);
    })();
  }, [user]);

  const submit = async () => {
    if (!user) return;

    const code = studentCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError("Digite o código completo de 6 caracteres.");
      return;
    }

    setError("");
    setJoining(true);

    const { data: classId, error: joinError } = await supabase.rpc(
      "student_join_class_by_code" as any,
      {
        _code: code,
        _email: user.email ?? null,
      },
    );

    if (joinError || !classId) {
      setJoining(false);
      setError("Não encontramos essa turma. Confira o código com seu professor.");
      return;
    }

    const { data: cls } = await supabase
      .from("classes")
      .select("id,name")
      .eq("id", classId as string)
      .maybeSingle();

    setJoining(false);

    if (!cls) {
      setError("A turma foi encontrada, mas não conseguimos carregar os dados. Tente novamente.");
      return;
    }

    setJoinedClass(cls as any);
    try {
      localStorage.setItem("bookquest-edu-pending-class", String(classId));
    } catch {}
  };

  const continueToStudentArea = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("edu_onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if ((profile as any)?.edu_onboarding_completed) {
      navigate("/edu/aluno", { replace: true });
    } else {
      navigate("/edu/onboarding-aluno", { replace: true });
    }
  };

  if (authLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#021f53]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#021f53] px-4 py-8 text-white">
      <div className="w-full max-w-xl">
        <div className="text-center mb-7">
          <img src={logoCrown} alt="BookQuest" className="h-14 w-14 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-[0.24em] text-amber-400 font-bold">Entrada do aluno</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Entre na sua turma.</h1>
          <p className="text-sm text-white/65 mt-2 max-w-md mx-auto">
            Digite o código de 6 caracteres que o professor passou para você.
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            {!joinedClass ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Código da turma</p>
                    <p className="text-xs text-white/55 mt-1">
                      Use apenas letras e números. O código tem exatamente 6 caracteres.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="student-class-code" className="text-xs font-semibold text-white/70">
                    Código de acesso
                  </label>
                  <Input
                    id="student-class-code"
                    value={studentCode}
                    onChange={(e) => {
                      setStudentCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
                      );
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && studentCode.length === 6 && !joining) submit();
                    }}
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode="text"
                    maxLength={6}
                    placeholder="EX.: A7K2P9"
                    className="mt-2 h-14 bg-white/10 border-white/20 text-white text-center text-xl font-mono font-bold tracking-[0.35em] placeholder:text-white/25 placeholder:tracking-normal"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-white/45">{studentCode.length}/6 caracteres</p>
                    {error && <p className="text-xs text-red-300 text-right">{error}</p>}
                  </div>
                </div>

                <Button
                  onClick={submit}
                  disabled={studentCode.length !== 6 || joining}
                  className="w-full h-12 font-bold text-[#021f53]"
                  style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Conferindo código...
                    </>
                  ) : (
                    <>
                      Entrar na turma <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>

                <button
                  onClick={() => navigate("/edu")}
                  className="w-full text-xs text-white/45 hover:text-white/80 transition py-1"
                >
                  Voltar para BookQuest EDU
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <div className="h-11 w-11 rounded-full bg-emerald-400/10 text-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-300">Código confirmado</p>
                    <p className="text-sm text-white/65 mt-1">Você agora faz parte da turma abaixo.</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-white/45">Sua turma</p>
                      <h2 className="text-xl font-bold text-white mt-1">{joinedClass.name}</h2>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={continueToStudentArea}
                  className="w-full h-12 font-bold text-[#021f53]"
                  style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}
                >
                  Continuar para minha jornada <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>

                <button
                  onClick={() => {
                    setJoinedClass(null);
                    setStudentCode("");
                  }}
                  className="w-full text-xs text-white/45 hover:text-white/80 transition py-1"
                >
                  Usar outro código
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduAlunoEntry;
