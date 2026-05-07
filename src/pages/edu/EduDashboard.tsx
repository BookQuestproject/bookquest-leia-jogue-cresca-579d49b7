import { useMemo, useEffect, useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useProfile } from "@/hooks/useProfile";
import {
  Users, BookOpen, TrendingUp, GraduationCap, Sparkles, Trophy,
  Activity, Target, Flame, ArrowUpRight, Plus, Bell, Search,
  ChevronRight, Zap, Award, BarChart3, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/* ---------- Animated counter ---------- */
const useCountUp = (target: number, duration = 1200) => {
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
const Sparkline = ({ data, color = "hsl(var(--accent))" }: { data: number[]; color?: string }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => `${i * step},${h - ((d - min) / range) * h}`).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- Big line chart ---------- */
const LineChart = ({ data, labels }: { data: number[]; labels: string[] }) => {
  const max = Math.max(...data, 1);
  const w = 600;
  const h = 180;
  const padX = 24;
  const padY = 20;
  const step = (w - padX * 2) / (data.length - 1);
  const points = data.map((d, i) => `${padX + i * step},${h - padY - (d / max) * (h - padY * 2)}`);
  const polyline = points.join(" ");
  const area = `${padX},${h - padY} ${polyline} ${w - padX},${h - padY}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(48 96% 55%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(48 96% 55%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={padX} x2={w - padX} y1={padY + g * (h - padY * 2)} y2={padY + g * (h - padY * 2)}
          stroke="hsl(210 40% 96% / 0.08)" strokeDasharray="3 3" />
      ))}
      <polygon points={area} fill="url(#chart-grad)" />
      <polyline points={polyline} fill="none" stroke="hsl(48 96% 55%)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="hsl(230 76% 15%)" stroke="hsl(48 96% 55%)" strokeWidth="2" />;
      })}
      {labels.map((l, i) => (
        <text key={i} x={padX + i * step} y={h - 4} textAnchor="middle" fontSize="10" fill="hsl(215 20% 65%)">{l}</text>
      ))}
    </svg>
  );
};

/* ---------- KPI card ---------- */
interface KpiProps {
  label: string;
  value: number;
  delta: string;
  icon: React.ElementType;
  trend: number[];
  accent?: "gold" | "blue" | "green" | "violet";
}
const accentMap = {
  gold: { bg: "from-[hsl(48_96%_55%/0.18)] to-[hsl(48_96%_45%/0.05)]", icon: "text-accent", glow: "shadow-[0_0_40px_hsl(48_96%_55%/0.18)]", color: "hsl(48 96% 55%)" },
  blue: { bg: "from-[hsl(220_90%_60%/0.20)] to-[hsl(220_90%_50%/0.05)]", icon: "text-[hsl(220_90%_70%)]", glow: "shadow-[0_0_40px_hsl(220_90%_60%/0.18)]", color: "hsl(220 90% 70%)" },
  green: { bg: "from-[hsl(150_70%_50%/0.20)] to-[hsl(150_70%_40%/0.05)]", icon: "text-[hsl(150_70%_60%)]", glow: "shadow-[0_0_40px_hsl(150_70%_50%/0.18)]", color: "hsl(150 70% 60%)" },
  violet: { bg: "from-[hsl(270_80%_65%/0.20)] to-[hsl(270_80%_50%/0.05)]", icon: "text-[hsl(270_80%_75%)]", glow: "shadow-[0_0_40px_hsl(270_80%_65%/0.18)]", color: "hsl(270 80% 75%)" },
};

const KpiCard = ({ label, value, delta, icon: Icon, trend, accent = "gold" }: KpiProps) => {
  const v = useCountUp(value);
  const a = accentMap[accent];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${a.bg} backdrop-blur-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:${a.glow} hover:border-white/20`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-sm ${a.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(150_70%_65%)] bg-[hsl(150_70%_50%/0.12)] px-2 py-1 rounded-full">
          <ArrowUpRight className="h-3 w-3" />{delta}
        </span>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">{v}</p>
      <p className="text-xs text-muted-foreground mt-1 mb-3">{label}</p>
      <Sparkline data={trend} color={a.color} />
    </div>
  );
};

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
      <h3 className="text-xl font-bold text-foreground mb-2">Comece sua jornada como professor</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        Crie sua primeira turma para desbloquear métricas em tempo real, gamificação, ranking e acompanhamento inteligente da leitura.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-6">
        {[
          { icon: Users, label: "Crie a turma", desc: "Em menos de 1 minuto" },
          { icon: BookOpen, label: "Atribua livros", desc: "Da nossa biblioteca" },
          { icon: BarChart3, label: "Acompanhe", desc: "Métricas em tempo real" },
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
  const withDeadline = activeClasses.filter((c) => c.reading_deadline).length;

  // Synthetic but consistent demo metrics (until real data flows in)
  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const teacherName = profile?.full_name?.split(" ")[0] ?? "Professor(a)";

  const kpis: KpiProps[] = [
    { label: "Turmas ativas", value: totalClasses, delta: "+1", icon: Users, trend: [2, 3, 3, 4, 4, 5, totalClasses || 1], accent: "gold" },
    { label: "Alunos engajados", value: totalClasses * 18, delta: "+12%", icon: Sparkles, trend: [40, 55, 60, 70, 85, 92, 110], accent: "blue" },
    { label: "Livros em leitura", value: withBooks, delta: "+3", icon: BookOpen, trend: [1, 2, 2, 3, 4, 5, withBooks || 1], accent: "violet" },
    { label: "Taxa de conclusão", value: 78, delta: "+8%", icon: Target, trend: [50, 55, 60, 65, 68, 72, 78], accent: "green" },
  ];

  const chartData = [42, 58, 51, 73, 68, 82, 95, 88, 102, 118];
  const chartLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"];

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* ============ HEADER ============ */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-primary/40 via-card/30 to-transparent backdrop-blur-xl p-6">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Painel do professor</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {greet}, <span className="bg-gradient-to-r from-accent to-[hsl(48_96%_70%)] bg-clip-text text-transparent">{teacherName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe desempenho, engajamento e evolução das suas turmas em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Buscar turma, aluno..."
                  className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-48"
                />
              </div>
              <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <Bell className="h-4 w-4 text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(48_96%_55%)]" />
              </button>
              <Button
                onClick={() => navigate("/edu/turmas")}
                className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30"
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
            {/* ============ KPI CARDS ============ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </div>

            {/* ============ ANALYTICS ROW ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Reading evolution chart */}
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

              {/* Engagement donut/list */}
              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-accent" />Engajamento por turma
                </h3>
                <div className="space-y-3.5">
                  {activeClasses.slice(0, 4).map((c, i) => {
                    const pct = 60 + ((i * 17) % 35);
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-foreground/90 font-medium truncate">{c.name}</span>
                          <span className="text-accent font-bold">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)] shadow-[0_0_10px_hsl(48_96%_55%/0.6)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ============ CLASSES + ACTIVITY ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Classes */}
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

              {/* Activity feed */}
              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-accent" />Atividade recente
                </h3>
                <div className="space-y-4">
                  <ActivityItem icon={CheckCircle2} title={`Turma ${activeClasses[0]?.name ?? ""} concluiu 12 quizzes`} time="há 5 min" color="bg-[hsl(150_70%_50%/0.15)] text-[hsl(150_70%_65%)]" />
                  <ActivityItem icon={Flame} title="Maria avançou 3 níveis em literatura" time="há 18 min" color="bg-[hsl(20_90%_55%/0.15)] text-[hsl(20_90%_65%)]" />
                  <ActivityItem icon={BookOpen} title="Novo livro atribuído a Turma 8A" time="há 1h" color="bg-[hsl(220_90%_60%/0.15)] text-[hsl(220_90%_70%)]" />
                  <ActivityItem icon={Award} title="Desafio semanal iniciado" time="há 2h" color="bg-[hsl(48_96%_55%/0.15)] text-accent" />
                  <ActivityItem icon={Trophy} title="João alcançou o topo do ranking" time="há 4h" color="bg-[hsl(270_80%_65%/0.15)] text-[hsl(270_80%_75%)]" />
                </div>
              </div>
            </div>

            {/* ============ GAMIFICATION ROW ============ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-xl p-5 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
                <Trophy className="h-5 w-5 text-accent mb-2" />
                <p className="text-2xl font-bold text-foreground">{totalClasses * 240}</p>
                <p className="text-xs text-muted-foreground">XP coletivo da semana</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-accent font-semibold">
                  <Sparkles className="h-3 w-3" />Top 5% das escolas
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <Target className="h-5 w-5 text-[hsl(150_70%_60%)] mb-2" />
                <p className="text-2xl font-bold text-foreground">{withDeadline}/{totalClasses || 1}</p>
                <p className="text-xs text-muted-foreground">Turmas com meta semanal</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[hsl(150_70%_50%)] to-[hsl(150_70%_70%)]" style={{ width: `${totalClasses ? (withDeadline / totalClasses) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
                <Flame className="h-5 w-5 text-orange-400 mb-2" />
                <p className="text-2xl font-bold text-foreground">12 dias</p>
                <p className="text-xs text-muted-foreground">Streak coletivo da escola</p>
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-orange-400 shadow-[0_0_6px_hsl(20_90%_55%/0.6)]" : "bg-white/5"}`} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
