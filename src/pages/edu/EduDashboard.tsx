import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, BookMarked, FileBarChart, TrendingUp, Plus, Sparkles,
  Activity, Clock, ArrowUpRight,
} from "lucide-react";

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

const Kpi = ({ icon: Icon, label, value, hint, accent = "accent" }: {
  icon: any; label: string; value: number; hint: string; accent?: "accent" | "blue" | "green" | "violet";
}) => {
  const display = useCountUp(value);
  const ring = {
    accent: "from-accent/30 to-accent/0",
    blue: "from-[hsl(217_91%_60%/0.3)] to-transparent",
    green: "from-[hsl(142_71%_45%/0.3)] to-transparent",
    violet: "from-[hsl(262_83%_58%/0.3)] to-transparent",
  }[accent];
  const iconColor = {
    accent: "text-accent",
    blue: "text-[hsl(217_91%_70%)]",
    green: "text-[hsl(142_71%_55%)]",
    violet: "text-[hsl(262_83%_70%)]",
  }[accent];
  return (
    <Card className="relative overflow-hidden bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${ring} blur-xl`} />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-white/[0.04] ${iconColor}`}><Icon className="h-4 w-4" /></div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold text-foreground tabular-nums">{display}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
};

const EduDashboard = () => {
  const navigate = useNavigate();
  const { classes, loading } = useClasses();
  const active = classes.filter(c => c.is_active);
  const totalStudents = active.length * 24; // approximation until students count is wired
  const journeysActive = active.filter(c => c.book_title).length;
  const avgProgress = 62;

  const recentClasses = active.slice(0, 4);
  const recentJourneys = [
    { title: "Dom Casmurro · 9º Ano A", date: "Aplicada hoje", progress: 41 },
    { title: "O Cortiço · 1º Médio B",   date: "Há 2 dias",     progress: 78 },
    { title: "Vidas Secas · 9º Ano C",   date: "Há 4 dias",     progress: 23 },
  ];
  const recentReports = [
    { name: "Lucas Ferreira", class: "9º Ano A", status: "Enviado",  when: "há 1h" },
    { name: "Mariana Souza",  class: "1º Médio B", status: "Pendente", when: "há 3h" },
    { name: "Pedro Alves",    class: "9º Ano A", status: "Enviado",  when: "há 6h" },
  ];
  const feed = [
    { who: "Júlia M.",  what: "concluiu o capítulo 3 de Dom Casmurro", when: "agora" },
    { who: "Rafael S.", what: "respondeu uma pergunta de reflexão",     when: "5 min" },
    { who: "Bia P.",    what: "começou a leitura de O Cortiço",          when: "12 min" },
    { who: "Nathan R.", what: "entrou na turma 1º Médio B",              when: "32 min" },
  ];

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-1">Painel do Professor</p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bem-vindo de volta 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">Acompanhe suas turmas, jornadas e relatórios em um só lugar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/edu/turmas")} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"><Plus className="h-4 w-4" />Nova turma</Button>
            <Button onClick={() => navigate("/edu/jornadas")} variant="outline" className="border-white/10 hover:bg-white/5 gap-1.5"><BookMarked className="h-4 w-4" />Nova jornada</Button>
            <Button onClick={() => navigate("/edu/relatorios")} variant="outline" className="border-white/10 hover:bg-white/5 gap-1.5"><FileBarChart className="h-4 w-4" />Gerar relatórios</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={Users}        label="Turmas ativas"        value={loading ? 0 : active.length} hint="turmas em andamento" accent="accent" />
          <Kpi icon={Sparkles}     label="Alunos ativos"        value={loading ? 0 : totalStudents} hint="lendo nesta semana"  accent="blue" />
          <Kpi icon={BookMarked}   label="Leituras em andamento" value={loading ? 0 : journeysActive} hint="jornadas vivas"      accent="violet" />
          <Kpi icon={TrendingUp}   label="Progresso médio"      value={avgProgress} hint="% das jornadas"      accent="green" />
        </div>

        {/* Three side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-accent" />Últimas turmas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentClasses.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma turma criada ainda.</p>}
              {recentClasses.map((c) => (
                <Link key={c.id} to={`/edu/turmas/${c.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{c.book_title ?? "Sem jornada ativa"}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BookMarked className="h-4 w-4 text-accent" />Últimas jornadas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {recentJourneys.map((j, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{j.title}</p>
                    <span className="text-[10px] text-muted-foreground">{j.date}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)] rounded-full" style={{ width: `${j.progress}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileBarChart className="h-4 w-4 text-accent" />Últimos relatórios</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04]">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.class} · {r.when}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.status === "Enviado" ? "bg-[hsl(142_71%_45%/0.15)] text-[hsl(142_71%_60%)]" : "bg-accent/15 text-accent"}`}>{r.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity feed */}
        <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />Atividade recente das turmas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {feed.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04]">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/5 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                  {f.who.split(" ")[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground"><span className="font-semibold">{f.who}</span> <span className="text-muted-foreground">{f.what}</span></p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{f.when}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
