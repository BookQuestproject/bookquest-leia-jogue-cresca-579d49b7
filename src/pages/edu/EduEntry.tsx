import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import {
  GraduationCap, Users, BookOpen, ArrowRight, Key, Loader2,
  LayoutDashboard, Trophy, BarChart3, Target, Activity,
  Sparkles, LineChart, ShieldCheck, Zap, TrendingUp, CheckCircle2,
  Quote, Award, Brain, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import logoCrown from "@/assets/logo-crown-transparent.png";
import DemoButton from "@/components/demo/DemoButton";

const ROYAL = "#021f53";
const GOLD = "#F5C842";
const GOLD_DEEP = "#E0A82E";

const useReveal = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => new Set(p).add(e.target.id));
        });
      },
      { threshold: 0.15 },
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return { visible, refs };
};

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {n.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
};

const EduEntry = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading, activateTeacher } = useEduRole();
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showTeacherCode, setShowTeacherCode] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { visible, refs } = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Open role picker — never auto-redirect teachers from the landing
  const handleAccess = () => {
    setShowRolePicker(true);
  };

  const handleTeacher = async () => {
    setShowRolePicker(false);
    if (!user) {
      navigate("/auth?redirect=/edu");
      return;
    }
    if (isTeacher) {
      navigate("/edu/professor");
      return;
    }
    // Block users already enrolled as students
    const { data: membership } = await import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase.from("class_members").select("class_id").eq("user_id", user.id).limit(1).maybeSingle()
    );
    if (membership) {
      navigate("/edu/aluno");
      return;
    }
    setShowTeacherCode(true);
  };

  const handleStudent = () => {
    setShowRolePicker(false);
    if (!user) navigate("/auth?redirect=/edu/aluno");
    else navigate("/edu/aluno");
  };

  const handleActivate = async () => {
    setActivating(true);
    const ok = await activateTeacher(teacherCode);
    setActivating(false);
    if (ok) {
      setShowTeacherCode(false);
      navigate("/edu/professor");
    }
  };

  const reveal = (id: string) =>
    `transition-all duration-700 ${
      visible.has(id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`;

  const setRef = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  const features = [
    { icon: LayoutDashboard, title: "Dashboard de Desempenho", desc: "Visão completa e instantânea de cada turma e aluno." },
    { icon: Trophy, title: "Ranking por Turma", desc: "Competição saudável que estimula leitura contínua." },
    { icon: LineChart, title: "Métricas de Leitura", desc: "Tempo lido, capítulos concluídos e evolução semanal." },
    { icon: Brain, title: "Quizzes Personalizados", desc: "Avaliações automáticas alinhadas a cada obra." },
    { icon: Activity, title: "Acompanhamento Individual", desc: "Histórico detalhado por aluno em tempo real." },
    { icon: Target, title: "Desafios Literários", desc: "Missões semanais que aumentam o engajamento." },
    { icon: ClipboardList, title: "Relatórios Inteligentes", desc: "Exportação clara para coordenação e BNCC." },
    { icon: Zap, title: "Evolução em Tempo Real", desc: "Atualizações instantâneas a cada leitura registrada." },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden">
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-[#021f53]/70 border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <span className="font-bold text-white">BookQuest</span>
            <span
              className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: GOLD, borderColor: `${GOLD}55`, background: `${GOLD}10` }}
            >
              EDU
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#funcionalidades" className="hover:text-white transition">Funcionalidades</a>
            <a href="#dashboard" className="hover:text-white transition">Plataforma</a>
            <a href="#impacto" className="hover:text-white transition">Impacto</a>
            <a href="#depoimentos" className="hover:text-white transition">Depoimentos</a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              BookQuest
            </Button>
            <Button
              size="sm"
              onClick={handleAccess}
              className="font-bold text-[#021f53] hover:scale-[1.04] hover:brightness-110 hover:shadow-[0_0_24px_rgba(245,200,66,0.5)] transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
            >
              Acessar Plataforma
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="hero"
        ref={setRef("hero")}
        className={`relative pt-32 pb-24 px-6 ${reveal("hero")}`}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium"
              style={{ borderColor: `${GOLD}55`, color: GOLD, background: `${GOLD}0D` }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tecnologia educacional premium
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Transformando leitura em{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
              >
                evolução mensurável.
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-xl">
              O BookQuest EDU oferece ferramentas inteligentes para acompanhar engajamento,
              desempenho e evolução leitora dos alunos — tudo em uma única plataforma.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleAccess}
                className="text-[#021f53] font-bold h-12 px-7 shadow-lg shadow-amber-500/30 hover:shadow-[0_0_45px_rgba(245,200,66,0.55)] hover:scale-[1.04] hover:brightness-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
              >
                Acessar Plataforma <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("mailto:contato@bookquest.com.br?subject=Demonstração BookQuest EDU", "_blank")}
                className="h-12 px-7 border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Solicitar Demonstração
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-xs text-white/60">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: GOLD }} /> Conformidade LGPD</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: GOLD }} /> Alinhado à BNCC</div>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="relative">
            <div
              className="absolute -inset-8 rounded-[2rem] blur-3xl opacity-40"
              style={{ background: `radial-gradient(circle, ${GOLD}33, transparent 70%)` }}
            />
            <div className="relative rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                </div>
                <span className="text-[10px] text-white/50">edu.bookquest.com.br/professor</span>
              </div>
              <div className="rounded-xl bg-[#021f53]/60 border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">Painel do Professor</p>
                    <h3 className="text-lg font-semibold">Turma 9º Ano A</h3>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{ background: `${GOLD}1A`, color: GOLD }}
                  >
                    AO VIVO
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Engajamento", value: "92%", icon: TrendingUp },
                    { label: "Leituras", value: "248", icon: BookOpen },
                    { label: "Concluídas", value: "76%", icon: CheckCircle2 },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <m.icon className="h-3.5 w-3.5 mb-1.5" style={{ color: GOLD }} />
                      <p className="text-base font-bold">{m.value}</p>
                      <p className="text-[10px] text-white/50">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>Evolução semanal</span>
                    <span style={{ color: GOLD }}>+18%</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 48, 70, 62, 85, 92].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(180deg, ${GOLD}, ${GOLD}33)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-white/60">Top alunos</p>
                  {[
                    { n: "Ana Beatriz", p: 96 },
                    { n: "Lucas Reis", p: 89 },
                    { n: "Maria Silva", p: 84 },
                  ].map((a, i) => (
                    <div key={a.n} className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{ background: `${GOLD}26`, color: GOLD }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs flex-1">{a.n}</span>
                      <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full" style={{ width: `${a.p}%`, background: GOLD }} />
                      </div>
                      <span className="text-[10px] text-white/60 w-8 text-right">{a.p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funcionalidades"
        ref={setRef("features")}
        className={`py-24 px-6 ${reveal("features")}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Funcionalidades
            </p>
            <h2 className="text-3xl md:text-5xl font-bold">Tudo que sua instituição precisa.</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Uma suíte completa de ferramentas para coordenar, avaliar e impulsionar a leitura.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:-translate-y-1"
              >
                <div
                  className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}33, transparent 60%)`,
                    mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                    padding: 1,
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  } as React.CSSProperties}
                />
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${GOLD}14`, color: GOLD }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section
        id="dashboard"
        ref={setRef("dashboard")}
        className={`py-24 px-6 ${reveal("dashboard")}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>
              Plataforma
            </p>
            <h2 className="text-3xl md:text-5xl font-bold">Um produto real. Dados reais.</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Acompanhe a evolução de cada turma com clareza analítica.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            <div
              className="absolute -inset-8 rounded-[2rem] blur-3xl opacity-30 -z-10"
              style={{ background: `radial-gradient(circle, ${GOLD}40, transparent 70%)` }}
            />
            <div className="grid lg:grid-cols-3 gap-5">
              {[
                { label: "Taxa de Participação", value: "94%", trend: "+6%" },
                { label: "Evolução Semanal", value: "+18%", trend: "vs semana anterior" },
                { label: "Leitura Concluída", value: "76%", trend: "média geral" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-[#021f53]/50 border border-white/10 p-5">
                  <p className="text-xs text-white/60">{m.label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: GOLD }}>{m.value}</p>
                  <p className="text-[11px] text-white/50 mt-1">{m.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mt-5">
              <div className="rounded-xl bg-[#021f53]/50 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Engajamento por turma</h4>
                  <BarChart3 className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <div className="space-y-3">
                  {[
                    { n: "9º A", p: 92 },
                    { n: "9º B", p: 78 },
                    { n: "8º A", p: 85 },
                    { n: "8º B", p: 64 },
                    { n: "7º A", p: 71 },
                  ].map((t) => (
                    <div key={t.n} className="flex items-center gap-3">
                      <span className="text-xs w-10 text-white/70">{t.n}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${t.p}%`,
                            background: `linear-gradient(90deg, ${GOLD}, #F5D77A)`,
                          }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right text-white/60">{t.p}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#021f53]/50 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Evolução de leitura (8 semanas)</h4>
                  <LineChart className="h-4 w-4" style={{ color: GOLD }} />
                </div>
                <div className="relative h-40">
                  <svg viewBox="0 0 320 140" className="w-full h-full">
                    <defs>
                      <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={GOLD} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,110 L40,95 L80,100 L120,75 L160,80 L200,55 L240,45 L280,30 L320,20 L320,140 L0,140 Z"
                      fill="url(#lg)"
                    />
                    <path
                      d="M0,110 L40,95 L80,100 L120,75 L160,80 L200,55 L240,45 L280,30 L320,20"
                      stroke={GOLD}
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section
        id="impacto"
        ref={setRef("impacto")}
        className={`py-24 px-6 ${reveal("impacto")}`}
      >
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Impacto educacional</p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Mais do que leitura.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
            >
              Evolução real.
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            O BookQuest EDU transforma leitura em engajamento, participação e crescimento contínuo
            dentro do ambiente escolar.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section
        id="stats"
        ref={setRef("stats")}
        className={`py-20 px-6 ${reveal("stats")}`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { v: 12000, s: "+", label: "Alunos impactados" },
            { v: 45000, s: "+", label: "Quizzes realizados" },
            { v: 1800, s: "+", label: "Livros acompanhados" },
            { v: 87, s: "%", label: "Aumento de engajamento" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 text-center"
            >
              <p className="text-3xl md:text-4xl font-bold" style={{ color: GOLD }}>
                <AnimatedNumber value={s.v} suffix={s.s} />
              </p>
              <p className="text-xs text-white/60 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEACHER EXPERIENCE */}
      <section
        id="teacher"
        ref={setRef("teacher")}
        className={`py-24 px-6 ${reveal("teacher")}`}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Para professores</p>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Poderoso por dentro. Simples por fora.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Crie turmas em segundos, atribua livros, gere desafios e acompanhe métricas
              automaticamente. Tudo o que você precisa, sem complicação.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "Gerenciamento de turmas em poucos cliques",
                "Acompanhamento individual e coletivo",
                "Criação de desafios literários personalizados",
                "Métricas geradas automaticamente",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-5">
            <div className="rounded-xl bg-[#021f53]/60 border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Minhas turmas</h4>
                <span className="text-[10px] text-white/50">4 ativas</span>
              </div>
              {[
                { n: "9º Ano A", b: "Dom Casmurro", p: 76 },
                { n: "9º Ano B", b: "O Cortiço", p: 62 },
                { n: "8º Ano A", b: "Memórias Póstumas", p: 84 },
              ].map((t) => (
                <div key={t.n} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{t.n}</p>
                      <p className="text-[11px] text-white/50">{t.b}</p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: GOLD }}>{t.p}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.p}%`, background: GOLD }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="depoimentos"
        ref={setRef("depoimentos")}
        className={`py-24 px-6 ${reveal("depoimentos")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: GOLD }}>Depoimentos</p>
            <h2 className="text-3xl md:text-5xl font-bold">Quem já vive a experiência.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                q: "Pela primeira vez vejo meus alunos pedindo para ler mais. A plataforma mudou nossa rotina.",
                n: "Profa. Carolina M.",
                r: "Coordenadora Pedagógica",
              },
              {
                q: "Os relatórios automáticos me economizam horas toda semana — e mostram exatamente onde intervir.",
                n: "Prof. Rafael T.",
                r: "Professor de Literatura",
              },
              {
                q: "Subir no ranking virou meta da turma. Nunca vi uma motivação tão real para a leitura.",
                n: "Beatriz, 14 anos",
                r: "Aluna do 9º ano",
              },
            ].map((t) => (
              <div
                key={t.n}
                className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6"
              >
                <Quote className="h-5 w-5 mb-3" style={{ color: GOLD }} />
                <p className="text-sm text-white/80 leading-relaxed mb-4">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: `${GOLD}26`, color: GOLD }}
                  >
                    {t.n[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.n}</p>
                    <p className="text-[11px] text-white/50">{t.r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLE SELECTION */}
      <section
        id="roles"
        ref={setRef("roles")}
        className={`py-20 px-6 ${reveal("roles")}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Comece agora</h2>
            <p className="text-white/60 mt-2">Escolha como deseja entrar na plataforma.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <button
              onClick={handleStudent}
              className="group text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-7 transition-all hover:border-white/25 hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${GOLD}14`, color: GOLD }}
              >
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Sou Aluno</h3>
              <p className="text-sm text-white/60 mb-5">
                Entre com o código da sua turma e comece a evoluir na leitura.
              </p>
              <span className="inline-flex items-center text-sm font-semibold" style={{ color: GOLD }}>
                Entrar como aluno <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition" />
              </span>
            </button>
            <button
              onClick={handleTeacher}
              className="group text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-7 transition-all hover:border-white/25 hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${GOLD}14`, color: GOLD }}
              >
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Sou Professor</h3>
              <p className="text-sm text-white/60 mb-5">
                Crie turmas, atribua leituras e acompanhe o desempenho em tempo real.
              </p>
              <span className="inline-flex items-center text-sm font-semibold" style={{ color: GOLD }}>
                Entrar como professor <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition" />
              </span>
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 pt-8">
            <DemoButton size="lg" label="Explorar BookQuest EDU em modo demonstração" />
            <p className="text-xs text-white/50">Sem cadastro. Acesso instantâneo com dados fictícios.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        id="cta"
        ref={setRef("cta")}
        className={`py-28 px-6 ${reveal("cta")}`}
      >
        <div className="max-w-4xl mx-auto relative">
          <div
            className="absolute -inset-10 rounded-[3rem] blur-3xl opacity-40 -z-10"
            style={{ background: `radial-gradient(circle, ${GOLD}40, transparent 70%)` }}
          />
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-10 md:p-14 text-center space-y-6">
            <Award className="h-10 w-10 mx-auto" style={{ color: GOLD }} />
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Leve a experiência da leitura para outro nível.
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Junte-se às instituições que já estão transformando a forma como seus alunos leem.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button
                size="lg"
                onClick={handleAccess}
                className="text-[#021f53] font-bold h-12 px-8 shadow-lg shadow-amber-500/30 hover:shadow-[0_0_45px_rgba(245,200,66,0.55)] hover:scale-[1.04] hover:brightness-110 transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
              >
                Entrar no BookQuest EDU <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.open("mailto:contato@bookquest.com.br?subject=Demonstração BookQuest EDU", "_blank")}
                className="h-12 px-8 border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Solicitar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="h-6 w-6" />
            <span>BookQuest EDU © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/politica-de-privacidade" className="hover:text-white">Privacidade</a>
            <a href="/termos-de-servico" className="hover:text-white">Termos</a>
            <a href="mailto:contato@bookquest.com.br" className="hover:text-white">Contato</a>
          </div>
        </div>
      </footer>

      {/* Role Picker Dialog */}
      <Dialog open={showRolePicker} onOpenChange={setShowRolePicker}>
        <DialogContent className="bg-[#021f53] border-white/15 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-white">
              Como você quer entrar?
            </DialogTitle>
            <p className="text-center text-sm text-white/60 mt-1">
              Escolha seu perfil para continuar no BookQuest EDU.
            </p>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleStudent}
              className="group text-left rounded-xl border border-white/15 bg-white/[0.04] p-5 transition-all hover:border-white/35 hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${GOLD}1A`, color: GOLD }}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">Sou Estudante</h3>
              <p className="text-xs text-white/60 mb-3">
                Cadastre-se com e-mail e senha e entre na turma com o código do professor.
              </p>
              <span className="inline-flex items-center text-xs font-semibold" style={{ color: GOLD }}>
                Entrar como estudante <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </span>
            </button>
            <button
              onClick={handleTeacher}
              className="group text-left rounded-xl border border-white/15 bg-white/[0.04] p-5 transition-all hover:border-white/35 hover:-translate-y-0.5"
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${GOLD}1A`, color: GOLD }}
              >
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">Sou Professor</h3>
              <p className="text-xs text-white/60 mb-3">
                Configure escola, turmas e acompanhe o desempenho dos seus alunos.
              </p>
              <span className="inline-flex items-center text-xs font-semibold" style={{ color: GOLD }}>
                Entrar como professor <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition" />
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher Code Dialog */}
      <Dialog open={showTeacherCode} onOpenChange={setShowTeacherCode}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5 text-primary" />
              Código de Ativação do Professor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para acessar a área do professor, insira o código fornecido pela equipe BookQuest.
            </p>
            <Input
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
              placeholder="Digite o código"
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTeacherCode(false)}>Cancelar</Button>
            <Button onClick={handleActivate} disabled={!teacherCode.trim() || activating}>
              {activating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EduEntry;
