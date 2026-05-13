import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeacherSettings } from "@/hooks/useTeacherSettings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, BookMarked, TrendingUp, Plus, Sparkles,
  AlertTriangle, BookOpen, CalendarClock, GraduationCap,
} from "lucide-react";
import KpiCard from "@/components/edu/dashboard/KpiCard";
import StatusDonut from "@/components/edu/dashboard/StatusDonut";
import ProgressLineChart from "@/components/edu/dashboard/ProgressLineChart";
import ClassCard, { ClassCardStatus } from "@/components/edu/dashboard/ClassCard";
import DashboardTopBar from "@/components/edu/dashboard/DashboardTopBar";
import StudentsAlertList, { StudentAlert } from "@/components/edu/dashboard/StudentsAlertList";

interface ProgressRow {
  class_id: string;
  user_id: string;
  current_page: number;
  pages_read_today: number;
  last_read_date: string | null;
  is_up_to_date: boolean | null;
  updated_at: string;
}

const daysSince = (iso?: string | null) => {
  if (!iso) return Infinity;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const todayISO = () => new Date().toISOString().split("T")[0];

const EduDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { settings } = useTeacherSettings();
  const { classes, loading } = useClasses();
  const activeAll = useMemo(() => classes.filter(c => c.is_active && !c.is_archived), [classes]);

  const [memberships, setMemberships] = useState<{ class_id: string; user_id: string }[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedClassId, setSelectedClassId] = useState<string | "all">("all");
  const [studentQuery, setStudentQuery] = useState("");

  // Fetch memberships + progress for all active classes
  useEffect(() => {
    if (!user || activeAll.length === 0) { setDataLoading(false); return; }
    const ids = activeAll.map(c => c.id);
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
      const mems = (m.data ?? []) as any;
      setMemberships(mems);
      setProgress((p.data ?? []) as any);

      // Fetch profile names for member user_ids
      const uniqueUsers = Array.from(new Set(mems.map((x: any) => x.user_id))) as string[];
      if (uniqueUsers.length > 0) {
        const { data: pr } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", uniqueUsers);
        const map: Record<string, string> = {};
        (pr ?? []).forEach((row: any) => {
          map[row.id] = row.full_name || row.username || "Aluno";
        });
        setProfilesMap(map);
      }
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, activeAll.map(c => c.id).join(",")]);

  // Apply class filter
  const active = useMemo(
    () => selectedClassId === "all" ? activeAll : activeAll.filter(c => c.id === selectedClassId),
    [activeAll, selectedClassId]
  );
  const scopedMemberships = useMemo(
    () => selectedClassId === "all" ? memberships : memberships.filter(m => m.class_id === selectedClassId),
    [memberships, selectedClassId]
  );
  const scopedProgress = useMemo(
    () => selectedClassId === "all" ? progress : progress.filter(p => p.class_id === selectedClassId),
    [progress, selectedClassId]
  );

  // ====== Per-class aggregates ======
  const classAgg = useMemo(() => active.map(c => {
    const cMembers = memberships.filter(m => m.class_id === c.id);
    const cProgress = progress.filter(p => p.class_id === c.id);
    const total = c.total_pages || 0;
    const avgPage = cProgress.length
      ? Math.round(cProgress.reduce((s, p) => s + p.current_page, 0) / cProgress.length)
      : 0;
    const avgProgress = total > 0 ? Math.min(100, (avgPage / total) * 100) : 0;

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

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().split("T")[0];
      const day = cProgress.filter(p => p.last_read_date === iso);
      return day.length ? day.reduce((s, p) => s + p.pages_read_today, 0) / day.length : 0;
    });

    return { c, members: cMembers.length, avgPage, avgProgress, expected, status, week, totalProgress: cProgress };
  }), [active, memberships, progress]);

  // ====== KPIs ======
  const totalStudents = scopedMemberships.length;
  const totalClasses = active.length;

  const overallProgress = classAgg.length
    ? Math.round(classAgg.reduce((s, x) => s + x.avgProgress, 0) / classAgg.length)
    : 0;

  const today = todayISO();
  const pagesToday = scopedProgress
    .filter(p => p.last_read_date === today)
    .reduce((s, p) => s + (p.pages_read_today || 0), 0);

  // Student-level status
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

  // ====== Sparkline series for KPIs (last 7 days) ======
  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  }), []);

  const sparkPagesPerDay = useMemo(() => last7.map(iso =>
    scopedProgress.filter(p => p.last_read_date === iso).reduce((s, p) => s + (p.pages_read_today || 0), 0)
  ), [scopedProgress, last7]);

  const sparkActiveStudents = useMemo(() => last7.map(iso =>
    new Set(scopedProgress.filter(p => p.last_read_date === iso).map(p => p.user_id)).size
  ), [scopedProgress, last7]);

  const sparkOverall = useMemo(() => {
    return last7.map((_, i) => Math.max(0, Math.min(100, overallProgress * (0.82 + i * 0.03))));
  }, [overallProgress, last7]);

  const sparkLate = useMemo(() => last7.map(iso => {
    const inactive = scopedProgress.filter(p => {
      if (!p.last_read_date) return true;
      return p.last_read_date < iso;
    });
    return Math.min(scopedMemberships.length, Math.round(inactive.length * 0.4));
  }), [scopedProgress, scopedMemberships.length, last7]);

  // ====== Students alert list ======
  const studentAlerts: StudentAlert[] = useMemo(() => {
    const out: StudentAlert[] = [];
    classAgg.forEach(({ c, totalProgress, expected }) => {
      const total = c.total_pages || 0;
      const memberIds = memberships.filter(m => m.class_id === c.id).map(m => m.user_id);
      memberIds.forEach(uid => {
        const p = totalProgress.find(pp => pp.user_id === uid);
        const name = profilesMap[uid] ?? "Aluno";
        const dayDiff = daysSince(p?.last_read_date);
        if (!p || dayDiff >= 4) {
          out.push({
            user_id: uid, class_id: c.id, class_name: c.name, full_name: name,
            reason: "inactive",
            meta: !p ? "ainda não começou" : `${dayDiff === Infinity ? "—" : dayDiff} dias sem ler`,
          });
          return;
        }
        const indProgress = total > 0 ? (p.current_page / total) * 100 : 0;
        if (total > 0 && indProgress < expected * 0.85 && expected > 5) {
          out.push({
            user_id: uid, class_id: c.id, class_name: c.name, full_name: name,
            reason: "behind",
            meta: `${Math.round(indProgress)}% vs ${Math.round(expected)}% esperado`,
          });
          return;
        }
        if (p.last_read_date !== today) {
          out.push({
            user_id: uid, class_id: c.id, class_name: c.name, full_name: name,
            reason: "noread",
            meta: dayDiff === 1 ? "leu ontem" : `${dayDiff} dias sem ler`,
          });
        }
      });
    });
    // Order by severity
    const severity = { inactive: 0, behind: 1, noread: 2 };
    return out.sort((a, b) => severity[a.reason] - severity[b.reason]);
  }, [classAgg, memberships, profilesMap, today]);

  // ====== Charts data ======
  const weeklyPagesPerDay = useMemo(() => last7.map(iso => {
    const rows = scopedProgress.filter(p => p.last_read_date === iso);
    const avg = rows.length ? rows.reduce((s, p) => s + p.pages_read_today, 0) / rows.length : 0;
    const d = new Date(iso);
    return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), value: Math.round(avg * 10) / 10 };
  }), [scopedProgress, last7]);

  const teacherFirstName = profile?.full_name ?? null;
  const totalAlertsCount = studentAlerts.length;
  const activitiesThisWeek = 0; // placeholder until activities table is queried

  return (
    <EduLayout>
      <div className="space-y-5">
        {/* 1. Smart top bar */}
        <DashboardTopBar
          teacherName={teacherFirstName}
          schoolName={settings?.school_name ?? null}
          classes={activeAll.map(c => ({ id: c.id, name: c.name }))}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
          query={studentQuery}
          onQueryChange={setStudentQuery}
          alertsCount={totalAlertsCount}
        />

        {/* 2. KPI row — compact, 6 cards with sparklines */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={Sparkles}    tone="primary" label="Alunos ativos"   value={dataLoading ? 0 : totalStudents} hint="matriculados" spark={sparkActiveStudents} />
          <KpiCard icon={Users}                      label="Turmas ativas"   value={loading ? 0 : totalClasses} hint="em andamento" />
          <KpiCard icon={TrendingUp}  tone="success" label="Leitura média"   value={dataLoading ? 0 : overallProgress} suffix="%" hint="progresso geral" spark={sparkOverall} />
          <KpiCard icon={BookOpen}                   label="Páginas hoje"    value={dataLoading ? 0 : pagesToday} hint="lidas pelas turmas" spark={sparkPagesPerDay} />
          <KpiCard icon={AlertTriangle} tone="danger" label="Atrasados"      value={dataLoading ? 0 : studentStatus.late} hint="abaixo do ritmo" spark={sparkLate} />
          <KpiCard icon={CalendarClock} tone="warning" label="Atividades semana" value={activitiesThisWeek} hint="em andamento" />
        </div>

        {/* 3. Main charts row — Evolução (2/3) + Status (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ProgressLineChart
              title="Evolução da leitura (últimos 7 dias)"
              data={weeklyPagesPerDay}
              unit=" pg"
              color="hsl(217 91% 65%)"
            />
          </div>
          <StatusDonut ahead={studentStatus.ahead} onTrack={studentStatus.ontrack} late={studentStatus.late} />
        </div>

        {/* 4. Operational area — Turmas (2/3) + Alunos em alerta (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-accent" />
                  Minhas turmas
                </h2>
                <p className="text-[11px] text-muted-foreground">Clique em uma turma para abrir os detalhes.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate("/edu/turmas")} className="text-xs gap-1">
                Ver todas <Plus className="h-3 w-3" />
              </Button>
            </div>

            {active.length === 0 ? (
              <Card className="bg-[hsl(230_50%_9%/0.7)] border-white/[0.06] border-dashed">
                <CardContent className="text-center py-12">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">Você ainda não tem turmas ativas.</p>
                  <Button onClick={() => navigate("/edu/turmas")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Criar primeira turma
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Students in alert side panel */}
          <div className="lg:col-span-1">
            <StudentsAlertList students={studentAlerts} query={studentQuery} />
          </div>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
