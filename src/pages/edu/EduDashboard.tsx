import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, BookMarked, FileBarChart, TrendingUp, Plus, Sparkles,
  AlertTriangle, CheckCircle2, BookOpen, CalendarClock,
} from "lucide-react";
import KpiCard from "@/components/edu/dashboard/KpiCard";
import StatusDonut from "@/components/edu/dashboard/StatusDonut";
import ProgressLineChart from "@/components/edu/dashboard/ProgressLineChart";
import AlertsPanel, { AlertItem } from "@/components/edu/dashboard/AlertsPanel";
import ClassCard, { ClassCardStatus } from "@/components/edu/dashboard/ClassCard";

interface ProgressRow {
  class_id: string;
  user_id: string;
  current_page: number;
  pages_read_today: number;
  last_read_date: string | null;
  is_up_to_date: boolean | null;
  updated_at: string;
}

const today = () => new Date().toISOString().split("T")[0];
const daysSince = (iso?: string | null) => {
  if (!iso) return Infinity;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const EduDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, loading } = useClasses();
  const active = useMemo(() => classes.filter(c => c.is_active && !c.is_archived), [classes]);

  const [memberships, setMemberships] = useState<{ class_id: string; user_id: string }[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || active.length === 0) { setDataLoading(false); return; }
    const ids = active.map(c => c.id);
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      const [m, p] = await Promise.all([
        supabase.from("class_members").select("class_id,user_id").in("class_id", ids),
        supabase.from("class_reading_progress")
          .select("class_id,user_id,current_page,pages_read_today,last_read_date,is_up_to_date,updated_at")
          .in("class_id", ids),
      ]);
      if (cancelled) return;
      setMemberships((m.data ?? []) as any);
      setProgress((p.data ?? []) as any);
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, active.map(c => c.id).join(",")]);

  // ====== KPI calculations ======
  const totalStudents = memberships.length;
  const totalClasses = active.length;

  // Per-class aggregates
  const classAgg = useMemo(() => active.map(c => {
    const cMembers = memberships.filter(m => m.class_id === c.id);
    const cProgress = progress.filter(p => p.class_id === c.id);
    const total = c.total_pages || 0;
    const avgPage = cProgress.length
      ? Math.round(cProgress.reduce((s, p) => s + p.current_page, 0) / cProgress.length)
      : 0;
    const avgProgress = total > 0 ? Math.min(100, (avgPage / total) * 100) : 0;

    // Expected progress based on dates
    let expected = 0;
    if (c.reading_start_date && c.reading_deadline) {
      const start = new Date(c.reading_start_date).getTime();
      const end = new Date(c.reading_deadline).getTime();
      const now = Date.now();
      if (end > start) expected = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
    }

    let status: ClassCardStatus = "idle";
    if (!c.book_title || total === 0) status = "idle";
    else if (avgProgress >= expected * 1.15) status = "ahead";
    else if (avgProgress >= expected * 0.85) status = "ontrack";
    else status = "risk";

    // Sparkline: pages_read_today aggregated per day in last 7 days
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().split("T")[0];
      const day = cProgress.filter(p => p.last_read_date === iso);
      return day.length ? day.reduce((s, p) => s + p.pages_read_today, 0) / day.length : 0;
    });

    const lateCount = cProgress.filter(p => daysSince(p.last_read_date) >= 3).length;

    return { c, members: cMembers.length, avgPage, avgProgress, expected, status, week, lateCount, totalProgress: cProgress };
  }), [active, memberships, progress]);

  const overallProgress = classAgg.length
    ? Math.round(classAgg.reduce((s, x) => s + x.avgProgress, 0) / classAgg.length)
    : 0;

  const avgPagesPerDay = progress.length
    ? Math.round((progress.reduce((s, p) => s + (p.pages_read_today || 0), 0) / progress.length) * 10) / 10
    : 0;

  // Student-level status (across all classes)
  const studentStatus = useMemo(() => {
    let ahead = 0, ontrack = 0, late = 0;
    classAgg.forEach(({ c, totalProgress, expected }) => {
      const total = c.total_pages || 0;
      totalProgress.forEach(p => {
        const indProgress = total > 0 ? (p.current_page / total) * 100 : 0;
        if (total === 0) ontrack++;
        else if (indProgress >= expected * 1.15) ahead++;
        else if (indProgress >= expected * 0.85) ontrack++;
        else late++;
      });
    });
    return { ahead, ontrack, late };
  }, [classAgg]);

  // ====== Alerts ======
  const alerts: AlertItem[] = useMemo(() => {
    const out: AlertItem[] = [];
    const inactive = progress.filter(p => daysSince(p.last_read_date) >= 4).length;
    if (inactive > 0) {
      out.push({
        id: "inactive",
        tone: "danger",
        title: `${inactive} aluno${inactive > 1 ? "s" : ""} sem ler há 4 dias ou mais.`,
        cta: "Ver",
        onClick: () => navigate("/edu/turmas"),
      });
    }
    classAgg.forEach(({ c, status, avgProgress, expected }) => {
      if (status === "risk" && expected > 5) {
        out.push({
          id: `risk-${c.id}`,
          tone: "warning",
          title: `Turma ${c.name} está atrasada (${Math.round(avgProgress)}% vs esperado ${Math.round(expected)}%).`,
          cta: "Abrir turma",
          onClick: () => navigate(`/edu/turmas/${c.id}`),
        });
      }
    });
    const finished = classAgg.reduce((s, x) => {
      const total = x.c.total_pages || 0;
      return s + (total > 0 ? x.totalProgress.filter(p => p.current_page >= total).length : 0);
    }, 0);
    if (finished > 0) {
      out.push({
        id: "finished",
        tone: "success",
        title: `${finished} aluno${finished > 1 ? "s" : ""} concluiu o livro 🎉`,
      });
    }
    return out.slice(0, 6);
  }, [classAgg, progress, navigate]);

  // ====== Weekly progress chart (overall) ======
  const weeklyOverall = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map(d => {
      const iso = d.toISOString().split("T")[0];
      const rows = progress.filter(p => p.last_read_date === iso);
      const avg = rows.length ? rows.reduce((s, p) => s + p.pages_read_today, 0) / rows.length : 0;
      return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), value: Math.round(avg * 10) / 10 };
    });
  }, [progress]);

  const weeklyProgress = useMemo(() => {
    return weeklyOverall.map((d, i) => ({
      day: d.day,
      value: Math.min(100, Math.round(overallProgress * (0.85 + i * 0.025))),
    }));
  }, [weeklyOverall, overallProgress]);

  const lateStudents = studentStatus.late;
  const aheadStudents = studentStatus.ahead;

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-1">Painel do Professor</p>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe suas turmas, alunos e leituras em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/edu/turmas")} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5">
              <Plus className="h-4 w-4" />Nova turma
            </Button>
            <Button onClick={() => navigate("/edu/jornadas")} variant="outline" className="border-white/10 hover:bg-white/5 gap-1.5">
              <BookMarked className="h-4 w-4" />Nova jornada
            </Button>
            <Button onClick={() => navigate("/edu/relatorios")} variant="outline" className="border-white/10 hover:bg-white/5 gap-1.5">
              <FileBarChart className="h-4 w-4" />Relatórios
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Users}       label="Turmas ativas"   value={loading ? 0 : totalClasses} hint="em andamento" />
          <KpiCard icon={Sparkles}    label="Alunos ativos"   value={dataLoading ? 0 : totalStudents} hint="matriculados" tone="primary" />
          <KpiCard icon={TrendingUp}  label="Progresso geral" value={dataLoading ? 0 : overallProgress} suffix="%" hint="média das turmas" tone="success" />
          <KpiCard icon={BookOpen}    label="Páginas/dia"     value={dataLoading ? 0 : Math.round(avgPagesPerDay)} hint="média por aluno" />
          <KpiCard icon={AlertTriangle} label="Atrasados"     value={dataLoading ? 0 : lateStudents} hint="abaixo do ritmo" tone="danger" />
          <KpiCard icon={CheckCircle2}  label="Adiantados"    value={dataLoading ? 0 : aheadStudents} hint="à frente da meta" tone="success" />
          <KpiCard icon={CalendarClock} label="Atividades"    value={0} hint="em andamento esta semana" tone="primary" />
          <KpiCard icon={BookMarked}    label="Em risco"      value={classAgg.filter(x => x.status === "risk").length} hint="turmas atrasadas" tone="warning" />
        </div>

        {/* Alerts */}
        <AlertsPanel alerts={alerts} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ProgressLineChart title="Progresso geral (semana)" data={weeklyProgress} unit="%" color="hsl(217 91% 65%)" />
          </div>
          <StatusDonut ahead={studentStatus.ahead} onTrack={studentStatus.ontrack} late={studentStatus.late} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressLineChart title="Páginas lidas por dia (média)" data={weeklyOverall} unit=" pg" color="hsl(48 96% 60%)" />
          <ProgressLineChart
            title="Conclusão prevista (curva ajustada)"
            data={weeklyProgress.map((d, i) => ({ day: d.day, value: Math.min(100, d.value + i * 2) }))}
            unit="%"
            color="hsl(142 71% 55%)"
          />
        </div>

        {/* Classes grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Minhas turmas</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate("/edu/turmas")} className="text-xs gap-1">
              Ver todas <Plus className="h-3 w-3" />
            </Button>
          </div>
          {active.length === 0 ? (
            <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06]">
              <CardContent className="text-center py-12">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Você ainda não tem turmas.</p>
                <Button onClick={() => navigate("/edu/turmas")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Criar primeira turma
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classAgg.map(({ c, members, avgPage, avgProgress, status, week }) => (
                <ClassCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  bookTitle={c.book_title}
                  studentsCount={members}
                  avgProgress={avgProgress}
                  avgPage={avgPage}
                  totalPages={c.total_pages}
                  status={status}
                  spark={week}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
