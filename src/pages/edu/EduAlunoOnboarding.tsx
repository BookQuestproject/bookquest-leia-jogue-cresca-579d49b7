import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, Compass, Wand2, Shield, FlaskConical, Mountain,
  BookOpen, Trophy, Brain, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const AVATARS = [
  { id: "explorer", name: "Explorador", icon: Compass, color: "from-emerald-400 to-teal-500" },
  { id: "mage", name: "Mago", icon: Wand2, color: "from-purple-400 to-indigo-500" },
  { id: "knight", name: "Cavaleira", icon: Shield, color: "from-rose-400 to-red-500" },
  { id: "scientist", name: "Cientista", icon: FlaskConical, color: "from-cyan-400 to-blue-500" },
  { id: "adventurer", name: "Aventureiro", icon: Mountain, color: "from-amber-400 to-orange-500" },
];

const STEPS = ["Boas-vindas", "Avatar", "Como funciona", "Primeira missão"] as const;

const EduAlunoOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [classInfo, setClassInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Load pending class info
  useEffect(() => {
    if (!user) return;
    (async () => {
      const classId = localStorage.getItem("bookquest-edu-pending-class");
      if (!classId) return;
      const { data } = await supabase.from("classes")
        .select("id, name, book_title, author, reading_deadline").eq("id", classId).maybeSingle();
      if (data) setClassInfo(data);
    })();
  }, [user]);

  const next = async () => {
    if (step === 1 && !avatar) { toast({ title: "Escolha um avatar" }); return; }
    if (step === STEPS.length - 1) { await finish(); return; }
    setStep(s => s + 1);
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({
      avatar_character: avatar,
      edu_onboarding_completed: true,
    } as any).eq("id", user.id);
    try { localStorage.removeItem("bookquest-edu-pending-class"); } catch {}
    setSaving(false);
    navigate("/edu/aluno", { replace: true });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#021f53" }}>
      <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" style={{ backgroundColor: "#021f53" }}>
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <img src={logoCrown} alt="BookQuest" className="h-12 w-12 mx-auto mb-3" />
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">Sua jornada começa</p>
        </div>

        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-6" />

        <Card className="bg-white/[0.04] border-white/15 backdrop-blur-xl text-white">
          <CardContent className="p-6 md:p-8 min-h-[420px]">
            {step === 0 && (
              <div className="text-center space-y-5 py-8">
                <Sparkles className="h-14 w-14 mx-auto text-amber-400" />
                <h1 className="text-3xl font-bold">Bem-vindo ao BookQuest 📖</h1>
                <p className="text-white/70 max-w-md mx-auto text-lg">
                  Páginas viram pontos. Pontos viram conquistas.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-center">Escolha seu avatar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVATARS.map(a => {
                    const Icon = a.icon;
                    const active = avatar === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAvatar(a.id)}
                        className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.03] ${
                          active ? "border-amber-400 bg-amber-400/10" : "border-white/15 bg-white/5"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-sm font-semibold">{a.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 py-4">
                <h2 className="text-2xl font-bold text-center">Como funciona</h2>
                <div className="grid gap-3">
                  {[
                    { icon: BookOpen, t: "Leia", d: "Avance pelos capítulos no seu ritmo" },
                    { icon: Brain, t: "Responda quizzes", d: "Mostre o que entendeu da história" },
                    { icon: Trophy, t: "Ganhe pontos e suba no ranking", d: "Compita com a turma toda" },
                  ].map((c) => (
                    <div key={c.t} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-lg bg-amber-400/15 flex items-center justify-center text-amber-400">
                        <c.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">{c.t}</p>
                        <p className="text-sm text-white/60">{c.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 py-2">
                <h2 className="text-2xl font-bold text-center">Sua primeira missão</h2>
                {classInfo ? (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-amber-400">Turma {classInfo.name}</p>
                    <h3 className="text-2xl font-bold">{classInfo.book_title || "Livro a ser definido"}</h3>
                    {classInfo.author && <p className="text-sm text-white/70">por {classInfo.author}</p>}
                    {classInfo.reading_deadline && (
                      <p className="text-sm text-white/70">
                        📅 Prazo: {new Date(classInfo.reading_deadline).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-amber-400">+500</p>
                        <p className="text-[10px] text-white/60">Pontos possíveis</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-amber-400">🥉</p>
                        <p className="text-[10px] text-white/60">Ranking inicial</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-amber-400">🔥</p>
                        <p className="text-[10px] text-white/60">Comece agora</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3" />
                    <p>Tudo pronto!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-6">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
            className="text-white/70 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Button onClick={next} disabled={saving}
            className="font-bold text-[#021f53] hover:brightness-110 h-11 px-6"
            style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> :
              step === 0 ? <>Começar minha jornada <ArrowRight className="h-4 w-4 ml-1" /></> :
              step === STEPS.length - 1 ? <>Ir para minha jornada <ArrowRight className="h-4 w-4 ml-1" /></> :
              <>Continuar <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EduAlunoOnboarding;
