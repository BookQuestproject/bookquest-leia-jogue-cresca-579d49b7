import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronLeft, ChevronRight, Compass, FlaskConical, Flame, Heart, Lightbulb, Loader2, Mountain, Sparkles, Target, Trophy, UserRound, Wand2 } from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const AVATARS = [
  {
    id: "explorer",
    name: "Explorador",
    icon: Compass,
    color: "hsl(158 48% 40%)",
    tagline: "Você quer descobrir o que está por trás da história.",
    description: "Curioso, gosta de pistas, mundos novos e capítulos que deixam uma pergunta na cabeça.",
    traits: ["Curiosidade", "Descoberta", "Mistério"],
  },
  {
    id: "mage",
    name: "Imaginador",
    icon: Wand2,
    color: "hsl(274 72% 58%)",
    tagline: "Você transforma palavras em imagens.",
    description: "Entra na história pelo clima, pelos personagens e pelas possibilidades que a leitura abre.",
    traits: ["Imaginação", "Personagens", "Atmosfera"],
  },
  {
    id: "knight",
    name: "Desafiante",
    icon: Trophy,
    color: "hsl(345 58% 52%)",
    tagline: "Você gosta de metas que dão vontade de continuar.",
    description: "Curte superar etapas, perceber evolução e transformar um objetivo grande em pequenas vitórias.",
    traits: ["Conquista", "Metas", "Sequência"],
  },
  {
    id: "scientist",
    name: "Investigador",
    icon: FlaskConical,
    color: "hsl(197 70% 45%)",
    tagline: "Você repara no que passa despercebido.",
    description: "Prefere entender como as peças se conectam, encontrar evidências e tirar suas próprias conclusões.",
    traits: ["Detalhes", "Lógica", "Evidências"],
  },
  {
    id: "adventurer",
    name: "Aventureiro",
    icon: Mountain,
    color: "hsl(24 72% 48%)",
    tagline: "Você precisa sentir que algo está acontecendo.",
    description: "Gosta de ritmo, escolhas, movimento e histórias que parecem uma jornada de verdade.",
    traits: ["Ação", "Ritmo", "Jornada"],
  },
] as const;

const STEPS = [
  { key: "welcome", label: "Começo" },
  { key: "avatar", label: "Quem combina com você?" },
  { key: "experience", label: "Seu jeito de ler" },
  { key: "routine", label: "Sua rotina" },
  { key: "barrier", label: "O que atrapalha?" },
  { key: "goal", label: "Seu plano" },
  { key: "finish", label: "Pronto" },
] as const;

const EXPERIENCE_OPTIONS = [
  { id: "starting", title: "Estou começando", desc: "Ainda estou criando meu hábito de leitura." },
  { id: "occasional", title: "Leio às vezes", desc: "Leio quando aparece um livro ou assunto que me interessa." },
  { id: "regular", title: "Leio com frequência", desc: "Já tenho algum ritmo e quero evoluir." },
  { id: "avid", title: "Leio bastante", desc: "A leitura já faz parte da minha rotina." },
];

const FREQUENCY_OPTIONS = [
  { id: "rare", title: "Quase nunca" },
  { id: "weekly", title: "1–2 dias por semana" },
  { id: "most_days", title: "3–5 dias por semana" },
  { id: "daily", title: "Quase todos os dias" },
];

const ROUTINE_OPTIONS = [
  { id: "busy", minutes: 10, title: "Minha rotina é corrida", desc: "Prefiro pequenas sessões que cabem no dia." },
  { id: "balanced", minutes: 20, title: "Consigo reservar um tempo", desc: "Tenho um espaço razoável para ler." },
  { id: "calm", minutes: 30, title: "Gosto de ler com calma", desc: "Consigo ficar mais tempo concentrado na história." },
  { id: "flexible", minutes: 45, title: "Tenho bastante liberdade", desc: "Posso aprofundar a leitura quando quiser." },
];

const BARRIER_OPTIONS = [
  { id: "time", icon: Flame, title: "Falta de tempo", desc: "Começo, mas a rotina atropela." },
  { id: "focus", icon: Target, title: "Perco a concentração", desc: "É difícil ficar muito tempo na mesma atividade." },
  { id: "interest", icon: Heart, title: "Às vezes acho a leitura chata", desc: "Tenho dificuldade de me envolver com alguns livros." },
  { id: "difficulty", icon: Lightbulb, title: "Nem sempre entendo", desc: "Vocabulário ou partes da história me travam." },
  { id: "starting", icon: Compass, title: "Não sei por onde começar", desc: "Quando vejo um livro grande, me sinto perdido." },
];

const MOTIVATION_OPTIONS = [
  { id: "finish", title: "Quero conseguir terminar o livro." },
  { id: "understand", title: "Quero entender e lembrar melhor do que li." },
  { id: "enjoy", title: "Quero descobrir que posso gostar de ler." },
  { id: "improve", title: "Quero evoluir para a escola e para mim." },
];

const SUPPORT_OPTIONS = [
  { id: "short_missions", title: "Missões curtas", desc: "Me diga o próximo passo sem me sobrecarregar." },
  { id: "discoveries", title: "Pistas e descobertas", desc: "Me ajude a perceber detalhes da história." },
  { id: "characters", title: "Personagens e escolhas", desc: "Quero me conectar com quem está na história." },
  { id: "competition", title: "Ranking e sequência", desc: "Gosto de ver meu avanço e ter um desafio." },
];

const EduAlunoOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [experience, setExperience] = useState("");
  const [frequency, setFrequency] = useState("");
  const [routine, setRoutine] = useState(20);
  const [barrier, setBarrier] = useState("");
  const [motivation, setMotivation] = useState("");
  const [support, setSupport] = useState("short_missions");
  const [goalPages, setGoalPages] = useState(10);
  const [preferredDays, setPreferredDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/edu/aluno/entrar", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      let classId = "";
      try { classId = localStorage.getItem("bookquest-edu-pending-class") || ""; } catch {}
      if (!classId) {
        const { data } = await supabase.from("class_members").select("class_id").eq("user_id", user.id).limit(1).maybeSingle();
        classId = data?.class_id || "";
      }
      if (classId) {
        const { data } = await supabase.from("classes")
          .select("id,name,book_title,author,reading_deadline")
          .eq("id", classId).maybeSingle();
        if (data) setClassInfo(data);
      }

      const { data: preferences } = await supabase
        .from("edu_student_preferences" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferences) {
        setAvatar(preferences.avatar_id || "");
        setExperience(preferences.reading_experience || "");
        setFrequency(preferences.reading_frequency || "");
        setRoutine(Number(preferences.routine_minutes) || 20);
        setBarrier(preferences.reading_barrier || "");
        setMotivation(preferences.reading_motivation || "");
        setSupport(preferences.preferred_support || "short_missions");
        setGoalPages(Number(preferences.daily_goal_pages) || 10);
        setPreferredDays(Array.isArray(preferences.preferred_days) ? preferences.preferred_days : [1,2,3,4,5]);
      }
    })();
  }, [user]);

  const selectedAvatar = AVATARS.find((item) => item.id === avatar);
  const stepValid = useMemo(() => {
    if (step === 1) return !!avatar;
    if (step === 2) return !!experience && !!frequency;
    if (step === 3) return routine > 0;
    if (step === 4) return !!barrier;
    if (step === 5) return !!motivation && !!support && goalPages > 0 && preferredDays.length > 0;
    return true;
  }, [step, avatar, experience, frequency, routine, barrier, motivation, support, goalPages, preferredDays]);

  const toggleDay = (day: number) => {
    setPreferredDays((days) => days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort());
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);

    const diagnostic = {
      avatar_id: avatar,
      reading_experience: experience,
      reading_frequency: frequency,
      routine_minutes: routine,
      preferred_days: preferredDays,
      reading_barrier: barrier,
      reading_motivation: motivation,
      preferred_support: support,
      daily_goal_pages: goalPages,
      captured_at: new Date().toISOString(),
    };

    // Preferred storage for teacher analytics and future adaptive rules.
    await supabase.from("edu_student_preferences" as any).upsert({
      user_id: user.id,
      ...diagnostic,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Mirror the diagnostic into the existing profile so the first experience
    // remains useful even before the personalization table is available.
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("literary_profile")
      .eq("id", user.id)
      .maybeSingle();

    const currentLiterary = (currentProfile as any)?.literary_profile;
    const mergedLiterary = {
      ...(currentLiterary && typeof currentLiterary === "object" ? currentLiterary : {}),
      edu_diagnostic: diagnostic,
    };

    const { error: profileError } = await supabase.from("profiles").update({
      avatar_character: avatar,
      edu_onboarding_completed: true,
      literary_profile: mergedLiterary,
    } as any).eq("id", user.id);

    if (profileError) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: user.user_metadata?.full_name || null,
        avatar_character: avatar,
        edu_onboarding_completed: true,
        literary_profile: mergedLiterary,
      } as any, { onConflict: "id" });
    }

    try { localStorage.removeItem("bookquest-edu-pending-class"); } catch {}
    setSaving(false);
    setStep(STEPS.length - 1);
  };

  const next = async () => {
    if (!stepValid || saving) return;
    if (step === STEPS.length - 2) {
      await finish();
      return;
    }
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  };

  const back = () => setStep((value) => Math.max(0, value - 1));

  const dayLabels = [
    [1, "S"], [2, "T"], [3, "Q"], [4, "Q"], [5, "S"], [6, "S"], [0, "D"],
  ] as const;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#071833]"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#071833] text-white">
      <div className="min-h-screen relative">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <header className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
              <span className="font-bold">BookQuest</span>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold tracking-[0.18em] text-amber-300">EDU</span>
            </div>
            <span className="text-[11px] text-white/45">{step + 1} de {STEPS.length}</span>
          </div>

          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 mt-6 bg-white/10" />
        </header>

        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {step === 0 && (
            <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center min-h-[600px]">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] font-bold text-amber-300">Antes de começar</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] mt-3">A gente vai montar uma leitura que combina com você.</h1>
                <p className="text-base sm:text-lg text-white/65 leading-relaxed mt-5 max-w-xl">
                  Nada de prova aqui. Queremos entender seu ritmo, seus interesses e o que costuma atrapalhar — para o BookQuest adaptar as próximas missões.
                </p>

                {classInfo && (
                  <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-300/10 text-amber-300 flex items-center justify-center"><BookOpenMini /></div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Sua turma</p>
                      <p className="text-sm font-semibold">{classInfo.name}</p>
                      <p className="text-xs text-white/55">{classInfo.book_title || "Livro da turma será definido em seguida"}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mt-8 max-w-lg">
                  {[
                    [Sparkles, "Seu perfil", "um jeito de ler"],
                    [Target, "Seu ritmo", "uma meta possível"],
                    [Heart, "Seu apoio", "um próximo passo claro"],
                  ].map(([Icon, title, desc]: any) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <Icon className="h-5 w-5 text-amber-300" />
                      <p className="text-xs font-bold mt-3">{title}</p>
                      <p className="text-[10px] text-white/45 mt-1">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-[34px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-violet-400/10 via-transparent to-amber-300/10 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-300/10 text-amber-300 flex items-center justify-center"><Compass className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/45">Como funciona</p>
                      <p className="text-lg font-bold">Você responde. A jornada se adapta.</p>
                    </div>
                  </div>
                  <div className="mt-7 space-y-4">
                    {[
                      ["1", "Você conta como gosta de ler", "curiosidade, rotina, obstáculos e objetivos"],
                      ["2", "Escolhemos um ritmo possível", "missões e metas que cabem no seu dia"],
                      ["3", "A plataforma aprende com você", "cada resposta ajuda a ajustar os próximos passos"],
                    ].map(([n, title, desc]) => (
                      <div key={n} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-amber-300 shrink-0">{n}</div>
                        <div>
                          <p className="text-sm font-semibold">{title}</p>
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="max-w-4xl mx-auto">
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300">Quem combina com você?</p>
                <h1 className="text-4xl font-black mt-3">Escolha a história que mais parece com você.</h1>
                <p className="text-sm sm:text-base text-white/60 mt-3">Não é um teste de personalidade. É uma forma de escolher como você quer viver sua jornada.</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
                {AVATARS.map((item) => {
                  const Icon = item.icon;
                  const active = avatar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.id)}
                      className={`text-left rounded-[26px] border p-5 transition-all hover:-translate-y-1 focus:outline-none ${
                        active ? "bg-white/[0.08] border-white/30 shadow-lg" : "bg-white/[0.03] border-white/10 hover:border-white/20"
                      }`}
                      style={active ? { boxShadow: `0 16px 40px ${item.color}24` } : undefined}
                    >
                      <div className="flex items-start justify-between">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className="h-7 w-7 rounded-full border flex items-center justify-center" style={{ borderColor: active ? item.color : "rgba(255,255,255,0.14)", backgroundColor: active ? item.color : "transparent" }}>
                          {active && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                      <h2 className="text-xl font-bold mt-5">{item.name}</h2>
                      <p className="text-sm text-white/75 mt-1 leading-relaxed">{item.tagline}</p>
                      <p className="text-xs text-white/48 mt-3 leading-relaxed">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {item.traits.map((trait) => (
                          <span key={trait} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/55">{trait}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAvatar && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: selectedAvatar.color }}>
                    <selectedAvatar.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/45 uppercase tracking-wider">Seu ponto de partida</p>
                    <p className="text-sm font-semibold mt-1">{selectedAvatar.name}: {selectedAvatar.tagline}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <OptionStep
              eyebrow="Seu jeito de ler"
              title="Como a leitura entra hoje na sua vida?"
              description="Isso ajuda a definir o ponto de partida, sem colocar você em uma caixinha."
              groups={[
                { label: "Experiência", options: EXPERIENCE_OPTIONS, value: experience, setValue: setExperience },
                { label: "Frequência", options: FREQUENCY_OPTIONS, value: frequency, setValue: setFrequency },
              ]}
            />
          )}

          {step === 3 && (
            <section className="max-w-3xl mx-auto">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300">Sua rotina</p>
                <h1 className="text-4xl font-black mt-3">Quanto tempo realmente cabe no seu dia?</h1>
                <p className="text-sm sm:text-base text-white/60 mt-3">Não escolha o que parece ideal. Escolha o que você consegue repetir.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                {ROUTINE_OPTIONS.map((item) => {
                  const active = routine === item.minutes;
                  return (
                    <button key={item.id} type="button" onClick={() => setRoutine(item.minutes)} className={`text-left rounded-[26px] border p-6 transition-all hover:-translate-y-0.5 ${active ? "bg-amber-300/10 border-amber-300/50" : "bg-white/[0.03] border-white/10"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center"><ClockMini /></div>
                        <span className="text-3xl font-black text-amber-300">{item.minutes}<span className="text-sm ml-1">min</span></span>
                      </div>
                      <h2 className="text-lg font-bold mt-5">{item.title}</h2>
                      <p className="text-sm text-white/50 mt-2">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-wider text-white/40">Dias em que você quer tentar</p>
                <div className="flex gap-2 mt-4">
                  {dayLabels.map(([day, label]) => {
                    const active = preferredDays.includes(day);
                    return (
                      <button key={day} type="button" onClick={() => toggleDay(day)} className={`h-11 w-11 rounded-full border text-xs font-bold transition-all ${active ? "bg-amber-300 text-[#071833] border-amber-300" : "bg-white/[0.03] border-white/10 text-white/55"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-white/40 mt-3">Você pode mudar isso depois.</p>
              </div>
            </section>
          )}

          {step === 4 && (
            <OptionStep
              eyebrow="O que costuma atrapalhar?"
              title="O que mais faz você perder o ritmo?"
              description="Escolha o obstáculo que mais acontece com você. A plataforma pode mudar a forma de propor a próxima missão."
              groups={[{ label: "Escolha uma opção", options: BARRIER_OPTIONS, value: barrier, setValue: setBarrier }]}
              iconMode
            />
          )}

          {step === 5 && (
            <section className="max-w-3xl mx-auto">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300">Seu plano</p>
                <h1 className="text-4xl font-black mt-3">Vamos escolher o que faz você querer voltar.</h1>
                <p className="text-sm sm:text-base text-white/60 mt-3">Seu plano não é definitivo. É apenas o melhor ponto de partida que você escolheu.</p>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Por que você quer ler?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {MOTIVATION_OPTIONS.map((item) => (
                      <OptionButton key={item.id} selected={motivation === item.id} onClick={() => setMotivation(item.id)} title={item.title} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Como você prefere ser ajudado?</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {SUPPORT_OPTIONS.map((item) => (
                      <OptionButton key={item.id} selected={support === item.id} onClick={() => setSupport(item.id)} title={item.title} description={item.desc} />
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40">Meta inicial</p>
                      <p className="text-4xl font-black mt-1 text-amber-300">{goalPages} <span className="text-base text-white/50">páginas / dia</span></p>
                    </div>
                    <Target className="h-8 w-8 text-amber-300" />
                  </div>
                  <input type="range" min={5} max={30} step={5} value={goalPages} onChange={(e) => setGoalPages(Number(e.target.value))} className="w-full mt-5 accent-amber-300" />
                  <div className="flex justify-between text-[10px] text-white/40 mt-2"><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div>
                  <p className="text-xs text-white/45 mt-4">Uma meta que você cumpre vale mais do que uma meta enorme que faz você desistir.</p>
                </div>
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="max-w-3xl mx-auto text-center py-8">
              <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-amber-300/20 to-violet-400/20 border border-white/10 flex items-center justify-center mx-auto">
                <Sparkles className="h-9 w-9 text-amber-300" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300 mt-6">Seu ponto de partida está pronto</p>
              <h1 className="text-4xl sm:text-5xl font-black mt-3">A jornada agora é sua.</h1>
              <p className="text-base text-white/60 mt-4 max-w-xl mx-auto leading-relaxed">
                {selectedAvatar ? `Você começa como ${selectedAvatar.name.toLowerCase()}, com ${routine} minutos de leitura e uma meta de ${goalPages} páginas por dia.` : "Seu plano de leitura está pronto."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-left">
                <Summary icon={UserRound} label="Perfil" value={selectedAvatar?.name || "—"} />
                <Summary icon={ClockMini} label="Ritmo" value={`${routine} min`} />
                <Summary icon={Target} label="Meta" value={`${goalPages} pág./dia`} />
                <Summary icon={Sparkles} label="Apoio" value={SUPPORT_OPTIONS.find((item) => item.id === support)?.title || "—"} />
              </div>

              {classInfo && (
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-left">
                  <p className="text-xs uppercase tracking-wider text-white/40">Primeira missão</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                    <div className="h-14 w-14 rounded-2xl bg-amber-300/10 text-amber-300 flex items-center justify-center"><BookOpenMini /></div>
                    <div className="flex-1">
                      <p className="text-lg font-bold">{classInfo.book_title || "Conheça o livro da turma"}</p>
                      <p className="text-xs text-white/50 mt-1">{classInfo.author ? `por ${classInfo.author} · ` : ""}{classInfo.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>

        <footer className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 0 || saving} className="text-white/55 hover:text-white hover:bg-white/5">
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Button
            onClick={step === STEPS.length - 1 ? () => navigate("/edu/aluno", { replace: true }) : next}
            disabled={saving || (!stepValid && step !== STEPS.length - 1)}
            className="h-11 px-6 font-bold text-[#071833] bg-amber-300 hover:bg-amber-200"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === STEPS.length - 1 ? <>Entrar na jornada <ChevronRight className="h-4 w-4 ml-1" /></> : <>Continuar <ChevronRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </footer>
      </div>
    </div>
  );
};

const OptionStep = ({
  eyebrow,
  title,
  description,
  groups,
  iconMode = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  groups: Array<{
    label: string;
    options: any[];
    value: string;
    setValue: (value: string) => void;
  }>;
  iconMode?: boolean;
}) => (
  <section className="max-w-3xl mx-auto">
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300">{eyebrow}</p>
      <h1 className="text-4xl font-black mt-3">{title}</h1>
      <p className="text-sm sm:text-base text-white/60 mt-3">{description}</p>
    </div>
    <div className="space-y-7 mt-8">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">{group.label}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {group.options.map((item: any) => {
              const Icon = iconMode ? (item.icon || Lightbulb) : null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => group.setValue(item.id)}
                  className={`text-left rounded-[24px] border p-5 transition-all ${group.value === item.id ? "border-amber-300/50 bg-amber-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}
                >
                  <div className="flex items-start gap-3">
                    {Icon ? (
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-amber-300" /></div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{item.title}</p>
                      {item.desc && <p className="text-xs text-white/45 mt-1 leading-relaxed">{item.desc}</p>}
                    </div>
                    {group.value === item.id && <Check className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const OptionButton = ({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-2xl border p-4 transition-all ${selected ? "border-amber-300/50 bg-amber-300/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-white/45 mt-1">{description}</p>}
      </div>
      {selected && <Check className="h-4 w-4 text-amber-300 shrink-0" />}
    </div>
  </button>
);

const Summary = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <Icon className="h-5 w-5 text-amber-300" />
    <p className="text-[10px] uppercase tracking-wider text-white/35 mt-3">{label}</p>
    <p className="text-sm font-bold mt-1 truncate">{value}</p>
  </div>
);

const BookOpenMini = () => <BookOpen className="h-5 w-5" />;
const ClockMini = () => <ClockIcon className="h-5 w-5" />;
const ClockIcon = ({ className = "" }: { className?: string }) => <span className={`inline-flex ${className}`} aria-hidden="true">◷</span>;

export default EduAlunoOnboarding;
