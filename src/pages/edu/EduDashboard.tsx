import { useMemo, useEffect, useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useProfile } from "@/hooks/useProfile";
import {
  Users, BookOpen, TrendingUp, GraduationCap, Sparkles, Trophy,
  Activity, Target, Flame, ArrowUpRight, Plus, Bell, Search,
  ChevronRight, Zap, BarChart3, FileQuestion, ListChecks,
  CalendarDays, Copy, Send, Megaphone, Layers, Clock, BookMarked,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/* ---------- Animated counter ---------- */
const useCountUp = (target: number, duration = 1000) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
};

/* ---------- Sparkline ---------- */
const Sparkline = ({ data, color = "hsl(48 96% 58%)" }: { data: number[]; color?: string }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100, h = 32;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => `${i * step},${h - ((d - min) / range) * h}`).join(" ");
  const id = `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- Big line chart ---------- */
const LineChart = ({ data, labels }: { data: number[]; labels: string[] }) => {
  const max = Math.max(...data, 1);
  const w = 600, h = 200, padX = 28, padY = 22;
  const step = (w - padX * 2) / (data.length - 1);
  const points = data.map((d, i) => `${padX + i * step},${h - padY - (d / max) * (h - padY * 2)}`);
  const polyline = points.join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
      <defs>
        <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(48 96% 58%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(48 96% 58%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={padX} x2={w - padX} y1={padY + g * (h - padY * 2)} y2={padY + g * (h - padY * 2)}
          stroke="hsl(210 40% 96% / 0.07)" strokeDasharray="3 3" />
      ))}
      <polygon points={`${padX},${h - padY} ${polyline} ${w - padX},${h - padY}`} fill="url(#chart-grad)" />
      <polyline points={polyline} fill="none" stroke="hsl(48 96% 58%)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="hsl(230 76% 12%)" stroke="hsl(48 96% 58%)" strokeWidth="2" />;
      })}
      {labels.map((l, i) => (
        <text key={i} x={padX + i * step} y={h - 4} textAnchor="middle" fontSize="10" fill="hsl(215 20% 65%)">{l}</text>
      ))}
    </svg>
  );
};

/* ---------- KPI card ---------- */
const accentMap = {
  gold:   { bg: "from-[hsl(48_96%_55%/0.16)] to-[hsl(48_96%_45%/0.04)]", icon: "text-accent",                 glow: "hover:shadow-[0_0_40px_hsl(48_96%_55%/0.22)]",   color: "hsl(48 96% 58%)" },
  blue:   { bg: "from-[hsl(220_90%_60%/0.18)] to-[hsl(220_90%_50%/0.04)]", icon: "text-[hsl(220_90%_70%)]",   glow: "hover:shadow-[0_0_40px_hsl(220_90%_60%/0.22)]",  color: "hsl(220 90% 70%)" },
  green:  { bg: "from-[hsl(150_70%_50%/0.18)] to-[hsl(150_70%_40%/0.04)]", icon: "text-[hsl(150_70%_60%)]",   glow: "hover:shadow-[0_0_40px_hsl(150_70%_50%/0.22)]",  color: "hsl(150 70% 60%)" },
  violet: { bg: "from-[hsl(270_80%_65%/0.18)] to-[hsl(270_80%_50%/0.04)]", icon: "text-[hsl(270_80%_75%)]",   glow: "hover:shadow-[0_0_40px_hsl(270_80%_65%/0.22)]",  color: "hsl(270 80% 75%)" },
} as const;

interface KpiProps {
  label: string; value: number; delta: string; icon: React.ElementType;
  trend: number[]; accent?: keyof typeof accentMap; suffix?: string;
}
const KpiCard = ({ label, value, delta, icon: Icon, trend, accent = "gold", suffix }: KpiProps) => {
  const v = useCountUp(value);
  const a = accentMap[accent];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${a.bg} backdrop-blur-xl p-5 transition-all duration-300 hover:scale-[1.02] ${a.glow} hover:border-white/20`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-sm ${a.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[hsl(150_70%_65%)] bg-[hsl(150_70%_50%/0.12)] px-2 py-1 rounded-full">
          <ArrowUpRight className="h-3 w-3" />{delta}
        </span>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">{v}{suffix}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-3">{label}</p>
      <Sparkline data={trend} color={a.color} />
    </div>
  );
};

/* ---------- Quick action ---------- */
const QuickAction = ({ icon: Icon, label, onClick, accent }: { icon: React.ElementType; label: string; onClick: () => void; accent?: boolean }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-[1.04] ${
      accent
        ? "bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:shadow-[0_0_25px_hsl(48_96%_55%/0.35)]"
        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/15"
    }`}
  >
    <div className={`p-2 rounded-lg ${accent ? "bg-accent/20 text-accent" : "bg-white/5 text-foreground/80 group-hover:text-accent"}`}>
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-[11px] font-semibold text-foreground/90 text-center leading-tight">{label}</span>
  </button>
);

/* ---------- Activity item ---------- */
const ActivityItem = ({ icon: Icon, title, time, color }: { icon: React.ElementType; title: string; time: string; color: string }) => (
  <div className="flex items-start gap-3 group">
    <div className={`mt-0.5 p-2 rounded-lg ${color} flex-shrink-0`}>
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground/90 leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
    </div>
  </div>
);

/* ---------- Empty state ---------- */
const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/30 via-card/40 to-card/20 backdrop-blur-2xl p-10 text-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(48_96%_55%/0.15),transparent_60%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(220_90%_60%/0.15),transparent_60%)]" />
    <div className="relative">
      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 mb-4">
        <GraduationCap className="h-8 w-8 text-accent" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">Comece sua jornada como educador</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        Crie sua primeira turma para desbloquear analytics em tempo real, gamificação, ranking e atividades inteligentes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-6">
        {[
          { icon: Users,     label: "1. Crie a turma",  desc: "Em menos de 1 minuto" },
          { icon: BookOpen,  label: "2. Atribua livros",desc: "Da nossa biblioteca" },
          { icon: BarChart3, label: "3. Acompanhe",     desc: "Métricas em tempo real" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-left">
            <s.icon className="h-4 w-4 text-accent mb-2" />
            <p className="text-sm font-semibold text-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
      <Button onClick={onCreate} size="lg" className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30 hover:shadow-[0_0_40px_hsl(48_96%_55%/0.5)]">
        <Plus className="h-4 w-4 mr-2" />Criar primeira turma
      </Button>
    </div>
  </div>
);

/* ===== Templates de atividades ===== */
const TEMPLATES = [
  { icon: BookMarked, title: "Resumo de capítulo", desc: "Síntese guiada · 20 min", xp: 50 },
  { icon: MessageIconStub,    title: "Debate literário",   desc: "Discussão em grupo · 45 min", xp: 80 },
  { icon: Layers,     title: "Leitura semanal",    desc: "Meta de páginas · 7 dias", xp: 120 },
  { icon: FileQuestion,title:"Interpretação ENEM", desc: "5 questões · 15 min", xp: 60 },
  { icon: Trophy,     title: "Desafio literário",  desc: "Competitivo · 1 semana", xp: 200 },
];
function MessageIconStub(props: any) { return <Megaphone {...props} />; }

/* =====================================================
 *  MAIN
 * ===================================================== */
const EduDashboard = () => {
  const { classes, loading } = useClasses();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const activeClasses = useMemo(() => classes.filter((c) => c.is_active && !c.is_archived), [classes]);
  const totalClasses = activeClasses.length;
  const withBooks = activeClasses.filter((c) => c.book_title).length;

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();
  const teacherName = profile?.full_name?.split(" ")[0] ?? "Professor(a)";

  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const kpis: KpiProps[] = [
    { label: "Turmas ativas",    value: totalClasses,     delta: "+1",   icon: Users,    trend: [2,3,3,4,4,5, totalClasses || 1], accent: "gold" },
    { label: "Alunos engajados", value: totalClasses * 18,delta: "+12%", icon: Sparkles, trend: [40,55,60,70,85,92,110],          accent: "blue" },
    { label: "Livros em leitura",value: withBooks,        delta: "+3",   icon: BookOpen, trend: [1,2,2,3,4,5, withBooks || 1],    accent: "violet" },
    { label: "Conclusão média",  value: 78, suffix: "%",  delta: "+8%",  icon: Target,   trend: [50,55,60,65,68,72,78],           accent: "green" },
  ];

  const chartData = [42, 58, 51, 73, 68, 82, 95, 88, 102, 118];
  const chartLabels = ["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10"];

  // Mini calendar (this week)
  const weekDays = ["D","S","T","Q","Q","S","S"];
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* ============ HEADER ============ */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-primary/40 via-card/30 to-transparent backdrop-blur-xl p-6">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-[hsl(220_90%_60%)]/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em] mb-1.5">Painel · {dateStr}</p>
              <h1 className="text-2xl lg:text-[28px] font-bold text-foreground">
                {greet}, <span className="bg-gradient-to-r from-accent to-[hsl(48_96%_70%)] bg-clip-text text-transparent">{teacherName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                Você tem <span className="text-foreground font-semibold">{totalClasses} turma{totalClasses !== 1 ? "s" : ""} ativa{totalClasses !== 1 ? "s" : ""}</span> e <span className="text-foreground font-semibold">3 atividades</span> aguardando revisão.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Buscar turma, aluno, livro…"
                  className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-56"
                />
                <kbd className="text-[9px] font-mono text-muted-foreground border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
              </div>
              <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Bell className="h-4 w-4 text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(48_96%_55%)]" />
              </button>
              <Button
                onClick={() => navigate("/edu/turmas")}
                className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30 hover:shadow-[0_0_30px_hsl(48_96%_55%/0.45)]"
              >
                <Plus className="h-4 w-4 mr-1.5" />Nova turma
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : totalClasses === 0 ? (
          <EmptyState onCreate={() => navigate("/edu/turmas")} />
        ) : (
          <>
            {/* ============ QUICK ACTIONS ============ */}
            <div className="rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-accent" />Ações rápidas
                </h3>
                <button className="text-[11px] text-muted-foreground hover:text-accent transition-colors">Personalizar</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                <QuickAction icon={Plus}         label="Criar atividade"  onClick={() => navigate("/edu/atividades")} accent />
                <QuickAction icon={FileQuestion} label="Aplicar quiz"     onClick={() => navigate("/edu/quizzes")} />
                <QuickAction icon={BookOpen}     label="Atribuir livro"   onClick={() => navigate("/edu/livros")} />
                <QuickAction icon={Copy}         label="Duplicar"         onClick={() => navigate("/edu/atividades")} />
                <QuickAction icon={Trophy}       label="Criar desafio"    onClick={() => navigate("/edu/atividades")} />
                <QuickAction icon={Megaphone}    label="Enviar aviso"     onClick={() => navigate("/edu/mensagens")} />
                <QuickAction icon={Award}        label="Abrir ranking"    onClick={() => navigate("/edu/relatorios")} />
              </div>
            </div>

            {/* ============ KPI CARDS ============ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </div>

            {/* ============ ANALYTICS ROW ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />Evolução da leitura
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Páginas lidas por semana — últimas 10 semanas</p>
                  </div>
                  <div className="flex gap-1.5 text-xs">
                    {["7d", "30d", "90d"].map((t, i) => (
                      <button key={t} className={`px-2.5 py-1 rounded-lg transition-colors ${i === 1 ? "bg-accent/15 text-accent border border-accent/30" : "text-muted-foreground hover:bg-white/5"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <LineChart data={chartData} labels={chartLabels} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-accent" />Engajamento por turma
                </h3>
                <div className="space-y-3.5">
                  {activeClasses.slice(0, 5).map((c, i) => {
                    const pct = 60 + ((i * 17) % 35);
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-foreground/90 font-medium truncate">{c.name}</span>
                          <span className="text-accent font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)] shadow-[0_0_10px_hsl(48_96%_55%/0.6)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ============ CLASSES + AGENDA ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />Suas turmas
                  </h3>
                  <button onClick={() => navigate("/edu/turmas")} className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeClasses.slice(0, 4).map((c, i) => {
                    const progress = 45 + ((i * 13) % 50);
                    const students = 18 + (i * 4);
                    return (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/edu/turmas/${c.id}`)}
                        className="text-left group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4 hover:border-accent/40 hover:bg-white/[0.07] transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.grade ?? "Turma"} · {c.book_title ?? "Sem livro"}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded">{c.access_code}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{students}</span>
                          <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" />{i + 3}d</span>
                          <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-accent" />#{i + 1}</span>
                        </div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Progresso médio</span>
                          <span className="text-foreground font-semibold">{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)]" style={{ width: `${progress}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agenda da semana */}
              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-accent" />Agenda da semana
                  </h3>
                  <button onClick={() => navigate("/edu/agenda")} className="text-xs text-accent font-semibold hover:underline">Abrir</button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekDates.map((d, i) => {
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <div key={i} className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${isToday ? "bg-accent/15 border border-accent/30" : "bg-white/[0.03]"}`}>
                        <span className="text-[9px] font-bold text-muted-foreground">{weekDays[i]}</span>
                        <span className={`text-sm font-bold ${isToday ? "text-accent" : "text-foreground"}`}>{d.getDate()}</span>
                        {(i === 1 || i === 3 || i === 5) && <span className="w-1 h-1 rounded-full bg-accent" />}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {[
                    { icon: FileQuestion, title: "Quiz · Cap. 3", time: "Hoje · 14h" , color: "bg-accent/15 text-accent" },
                    { icon: BookOpen,    title: "Meta semanal — 9º A", time: "Quarta · prazo",   color: "bg-[hsl(220_90%_60%)]/15 text-[hsl(220_90%_70%)]" },
                    { icon: Trophy,      title: "Desafio literário",   time: "Sexta · finaliza", color: "bg-[hsl(150_70%_50%)]/15 text-[hsl(150_70%_65%)]" },
                  ].map((e, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <div className={`p-1.5 rounded-md ${e.color}`}><e.icon className="h-3.5 w-3.5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground">{e.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ============ TEMPLATES + ACTIVITY FEED ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-accent" />Templates de atividade
                  </h3>
                  <button onClick={() => navigate("/edu/atividades")} className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                    Ver biblioteca <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.title}
                      onClick={() => navigate("/edu/atividades")}
                      className="group text-left rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 hover:border-accent/40 hover:bg-white/[0.07] hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                          <t.icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">+{t.xp} XP</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <Send className="h-3 w-3" />Usar template
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-accent" />Atividade recente
                </h3>
                <div className="space-y-4">
                  <ActivityItem icon={Sparkles}     title="Maria entregou o resumo de Cap. 3" time="há 5 min" color="bg-accent/15 text-accent" />
                  <ActivityItem icon={FileQuestion} title="9º B concluiu o Quiz semanal"      time="há 1 h"   color="bg-[hsl(220_90%_60%)]/15 text-[hsl(220_90%_70%)]" />
                  <ActivityItem icon={Trophy}       title="João alcançou o topo do ranking"   time="há 2 h"   color="bg-[hsl(150_70%_50%)]/15 text-[hsl(150_70%_65%)]" />
                  <ActivityItem icon={BookOpen}     title="Novo livro adicionado à 8º C"      time="ontem"     color="bg-[hsl(270_80%_65%)]/15 text-[hsl(270_80%_75%)]" />
                  <ActivityItem icon={Megaphone}    title="Aviso enviado para 3 turmas"       time="ontem"     color="bg-orange-500/15 text-orange-300" />
                </div>
                <button className="mt-4 w-full text-center text-xs text-accent font-semibold hover:underline">Ver toda a atividade</button>
              </div>
            </div>
          </>
        )}
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
