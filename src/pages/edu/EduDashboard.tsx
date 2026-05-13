import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeacherSettings } from "@/hooks/useTeacherSettings";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, BookMarked, TrendingUp, Plus, Sparkles, AlertTriangle, BookOpen,
  ClipboardList, GraduationCap, Flame, Trophy, ArrowRight, Lightbulb, ChevronRight, Clock, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

interface ProgressRow {
  class_id: string;
  user_id: string;
  current_page: number;
  pages_read_today: number;
  last_read_date: string | null;
  is_up_to_date: boolean | null;
  updated_at: string;
}

const todayISO = () => new Date().toISOString().split("T")[0];
const daysSince = (iso?: string | null) => {
  if (!iso) return Infinity;
  const d = new Date(iso);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

// === Brand tokens (BookQuest EDU palette, used inline where exact hex is required) ===
const C = {
  cardBg:      "hsl(220 70% 14%)",      // ~ #122F73
  cardHover:   "hsl(220 71% 19%)",      // ~ #163A8C
  border:      "rgba(255,255,255,0.08)",
  gold:        "hsl(45 100% 58%)",       // ~ #FFC72C
  goldHover:   "hsl(45 100% 70%)",       // ~ #FFD95E
  green:       "hsl(142 71% 45%)",       // #22C55E
  amber:       "hsl(38 92% 50%)",        // #F59E0B
  red:         "hsl(0 84% 60%)",         // #EF4444
  purple:      "hsl(258 90% 66%)",       // #8B5CF6
  textSoft:    "hsl(228 38% 80%)",       // #B8C2E0
  textMuted:   "hsl(225 20% 60%)",       // #7F8DB3
};

// =================== Atomic UI bits (file-local) ===================

const MetricCard = ({
  emoji, label, value, suffix, accent, hint,
}: {
  emoji: string; label: string; value: number | string; suffix?: string;
  accent: string; hint?: string;
}) => (
  <div
    className="relative overflow-hidden rounded-2xl p-4 border transition-all hover:-translate-y-0.5 hover:shadow-lg"
    style={{ background: C.cardBg, borderColor: C.border }}
  >
    <div
      className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-30 pointer-events-none"
      style={{ background: accent }}
    />
    <div className="relative flex items-start justify-between mb-3">
      <span className="text-2xl">{emoji}</span>
      <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
    </div>
    <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: C.textMuted }}>{label}</p>
    <p className="text-3xl font-bold tabular-nums mt-1 text-foreground">
      {value}{suffix && <span className="text-base font-semibold ml-0.5" style={{ color: C.textSoft }}>{suffix}</span>}
    </p>
    {hint && <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>{hint}</p>}
  </div>
);

const SectionTitle = ({ icon: Icon, title, action, onAction }: { icon: any; title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-end justify-between mb-3">
    <h2 className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
      <Icon className="w-4 h-4 text-accent" />
      {title}
    </h2>
    {action && (
      <Button variant="ghost" size="sm" onClick={onAction} className="text-[12px] gap-1 text-muted-foreground hover:text-accent">
        {action} <ArrowRight className="w-3 h-3" />
      </Button>
    )}
  </div>
);

// =================== Page ===================

const EduDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { settings } = useTeacherSettings();
  const { classes, loading } = useClasses();
  const active = useMemo(() => classes.filter(c => c.is_active && !c.is_archived), [classes]);

  const [memberships, setMemberships] = useState<{ class_id: string; user_id: string }[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, { name: string; avatar?: string | null }>>({});
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
      const mems = (m.data ?? []) as any;
      setMemberships(mems);
      setProgress((p.data ?? []) as any);

      const uniqueUsers = Array.from(new Set(mems.map((x: any) => x.user_id))) as string[];
      if (uniqueUsers.length > 0) {
        const { data: pr } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", uniqueUsers);
        const map: Record<string, { name: string; avatar?: string | null }> = {};
        (pr ?? []).forEach((row: any) => {
          map[row.id] = { name: row.full_name || row.username || "Aluno", avatar: row.avatar_url };
        });
        setProfilesMap(map);
      }
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, active.map(c => c.id).join(",")]);

  // ====== Aggregates ======
  const today = todayISO();
  const totalStudents = memberships.length;
  const totalClasses = active.length;
  const activeReadersToday = new Set(progress.filter(p => p.last_read_date === today).map(p => p.user_id)).size;

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
    return { c, members: cMembers, cProgress, total, avgPage, avgProgress, expected };
  }), [active, memberships, progress]);

  const overallProgress = classAgg.length
    ? Math.round(classAgg.reduce((s, x) => s + x.avgProgress, 0) / classAgg.length)
    : 0;

  // Status buckets at student level
  const studentBuckets = useMemo(() => {
    const ahead: any[] = [], ontrack: any[] = [], late: any[] = [];
    classAgg.forEach(({ c, members, cProgress, total, expected }) => {
      members.forEach(m => {
        const p = cProgress.find(pp => pp.user_id === m.user_id);
        const indProgress = total > 0 && p ? (p.current_page / total) * 100 : 0;
        const item = {
          user_id: m.user_id,
          class_id: c.id,
          class_name: c.name,
          name: profilesMap[m.user_id]?.name ?? "Aluno",
          page: p?.current_page ?? 0,
          totalPages: total,
          progress: Math.round(indProgress),
        };
        if (total === 0 || !p) ontrack.push(item);
        else if (indProgress >= expected * 1.15) ahead.push(item);
        else if (indProgress >= expected * 0.85) ontrack.push(item);
        else late.push(item);
      });
    });
    return { ahead, ontrack, late };
  }, [classAgg, profilesMap]);

  const lateStudents = studentBuckets.late.length;

  // ====== Chart: pages read per day (last 7d) ======
  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d;
  }), []);

  const chartData = useMemo(() => last7.map(d => {
    const iso = d.toISOString().split("T")[0];
    const rows = progress.filter(p => p.last_read_date === iso);
    const total = rows.reduce((s, p) => s + (p.pages_read_today || 0), 0);
    return {
      day: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      pages: total,
    };
  }), [progress, last7]);

  // ====== Ranking — top readers of the week ======
  const ranking = useMemo(() => {
    const byUser: Record<string, { user_id: string; pages: number; class_name: string }> = {};
    progress.forEach(p => {
      const cls = active.find(c => c.id === p.class_id);
      if (!cls) return;
      if (!byUser[p.user_id]) byUser[p.user_id] = { user_id: p.user_id, pages: 0, class_name: cls.name };
      byUser[p.user_id].pages += p.current_page || 0;
    });
    return Object.values(byUser)
      .map(r => ({ ...r, name: profilesMap[r.user_id]?.name ?? "Aluno", avatar: profilesMap[r.user_id]?.avatar }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 5);
  }, [progress, active, profilesMap]);

  // ====== AI insights (rule-based heuristics) ======
  const insights = useMemo(() => {
    const out: { tone: "danger" | "warning" | "success" | "info"; text: string }[] = [];
    const slowing = progress.filter(p => daysSince(p.last_read_date) >= 3 && daysSince(p.last_read_date) < 7).length;
    if (slowing > 0) out.push({ tone: "warning", text: `${slowing} aluno${slowing > 1 ? "s estão" : " está"} desacelerando a leitura nos últimos dias.` });
    classAgg.forEach(({ c, avgProgress, expected }) => {
      if (expected > 20 && avgProgress < expected * 0.75) {
        out.push({ tone: "danger", text: `A turma ${c.name} pode atrasar o prazo final de leitura.` });
      }
    });
    if (studentBuckets.ahead.length >= 3) {
      out.push({ tone: "success", text: `${studentBuckets.ahead.length} alunos com desempenho excelente — considere desafios extras.` });
    }
    if (out.length === 0) out.push({ tone: "info", text: "Nenhum padrão de risco detectado. Suas turmas estão saudáveis ✨" });
    return out.slice(0, 4);
  }, [progress, classAgg, studentBuckets.ahead.length]);

  const insightToneCfg = {
    danger:  { color: C.red,    icon: AlertTriangle },
    warning: { color: C.amber,  icon: Clock },
    success: { color: C.green,  icon: CheckCircle2 },
    info:    { color: C.purple, icon: Sparkles },
  } as const;

  // ====== Activities (placeholder until full activities pipeline) ======
  const recentActivities = useMemo(() => active.slice(0, 4).map(c => ({
    class_id: c.id,
    class_name: c.name,
    title: c.book_title ? `Leitura — ${c.book_title}` : "Leitura semanal",
    type: "Leitura",
    completion: Math.round(classAgg.find(x => x.c.id === c.id)?.avgProgress ?? 0),
    pending: Math.max(0, (classAgg.find(x => x.c.id === c.id)?.members.length ?? 0) - (classAgg.find(x => x.c.id === c.id)?.cProgress.length ?? 0)),
  })), [active, classAgg]);

  const teacherFirstName = (profile?.full_name ?? "").split(" ")[0];

  return (
    <EduLayout>
      <div className="space-y-6">

        {/* ═══════════ HERO ═══════════ */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8 border"
          style={{
            background: `linear-gradient(140deg, ${C.cardBg} 0%, ${C.cardBg} 50%, hsl(220 80% 10%) 100%)`,
            borderColor: C.border,
          }}
        >
          {/* Gold radial glow */}
          <div
            className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${C.gold}33, transparent 65%)` }}
          />
          {/* Subtle starfield */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 60%, white, transparent), radial-gradient(1.5px 1.5px at 40% 80%, white, transparent), radial-gradient(1px 1px at 85% 20%, white, transparent)`,
              backgroundSize: "300px 300px",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent mb-3 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Painel pedagógico {teacherFirstName ? `· Olá, ${teacherFirstName}` : ""}
              </p>
              <h1 className="text-2xl lg:text-[34px] leading-tight font-serif font-bold text-foreground mb-2">
                Acompanhe a jornada de leitura<br className="hidden lg:block" /> das suas turmas
              </h1>
              <p className="text-sm lg:text-[15px] max-w-xl" style={{ color: C.textSoft }}>
                Veja quem está avançando, quem precisa de ajuda e mantenha seus alunos engajados diariamente.
              </p>
              {settings?.school_name && (
                <p className="text-[12px] mt-2" style={{ color: C.textMuted }}>{settings.school_name}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                size="lg"
                onClick={() => navigate("/edu/jornadas")}
                className="bg-accent hover:bg-[hsl(var(--accent)/0.9)] text-accent-foreground font-bold gap-2 rounded-xl shadow-[0_0_28px_hsl(var(--accent)/0.45)]"
              >
                <ClipboardList className="w-4 h-4" />
                Criar atividade
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/edu/turmas")}
                className="gap-2 rounded-xl border-white/10 hover:bg-white/5"
              >
                <Plus className="w-4 h-4" />
                Nova turma
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════ SEÇÃO 1 — KPIs gamificados ═══════════ */}
        <section>
          <SectionTitle icon={Sparkles} title="Sua sala em números" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard emoji="👩‍🎓" label="Total de alunos"   value={dataLoading ? 0 : totalStudents}      accent={C.gold}   hint="matriculados" />
            <MetricCard emoji="📚" label="Turmas ativas"     value={loading ? 0 : totalClasses}           accent={C.purple} hint="em andamento" />
            <MetricCard emoji="🔥" label="Leitores hoje"     value={dataLoading ? 0 : activeReadersToday} accent={C.amber}  hint={`de ${totalStudents}`} />
            <MetricCard emoji="⚠️" label="Atrasados"         value={dataLoading ? 0 : lateStudents}       accent={C.red}    hint="abaixo do ritmo" />
            <MetricCard emoji="📈" label="Progresso médio"   value={dataLoading ? 0 : overallProgress} suffix="%" accent={C.green} hint="média geral" />
            <MetricCard emoji="📝" label="Atividades pend."  value={recentActivities.reduce((s, a) => s + a.pending, 0)} accent={C.gold} hint="aguardando alunos" />
          </div>
        </section>

        {/* ═══════════ SEÇÃO 2 — Progresso geral (gráfico grande) ═══════════ */}
        <section>
          <Card className="border" style={{ background: C.cardBg, borderColor: C.border }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Progresso geral das turmas
                <span className="ml-auto text-[11px] font-medium" style={{ color: C.textMuted }}>últimos 7 dias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.gold} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip
                      contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, color: "white" }}
                      formatter={(v: any) => [`${v} pg`, "Páginas lidas"]}
                    />
                    <Area type="monotone" dataKey="pages" stroke={C.gold} strokeWidth={2.5} fill="url(#goldArea)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══════════ SEÇÃO 3 — Status dos alunos (3 colunas) ═══════════ */}
        <section>
          <SectionTitle
            icon={Users}
            title="Status dos alunos"
            action="Ver todos os alunos"
            onAction={() => navigate("/edu/turmas")}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatusColumn
              title="Adiantados"
              emoji="🟢"
              color={C.green}
              students={studentBuckets.ahead}
              empty="Ninguém na frente do ritmo ainda."
            />
            <StatusColumn
              title="No prazo"
              emoji="🟡"
              color={C.amber}
              students={studentBuckets.ontrack}
              empty="Ninguém ainda no ritmo esperado."
            />
            <StatusColumn
              title="Atrasados"
              emoji="🔴"
              color={C.red}
              students={studentBuckets.late}
              empty="Ótimo! Nenhum aluno atrasado."
            />
          </div>
        </section>

        {/* ═══════════ SEÇÃO 4 + 5 — Ranking + Atividades ═══════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranking */}
          <Card className="border" style={{ background: C.cardBg, borderColor: C.border }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Top leitores da semana
                <Button size="sm" variant="ghost" onClick={() => navigate("/edu/relatorios")} className="ml-auto h-7 text-[11px] gap-1 text-muted-foreground hover:text-accent">
                  Ranking completo <ArrowRight className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {ranking.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Sem dados de leitura ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {ranking.map((r, i) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const isMedalist = i < 3;
                    return (
                      <li
                        key={r.user_id}
                        className="flex items-center gap-3 p-2.5 rounded-xl border transition-colors hover:bg-white/[0.03]"
                        style={{ borderColor: C.border, background: isMedalist ? `${C.gold}0D` : "transparent" }}
                      >
                        <div className="w-8 text-center text-lg">
                          {isMedalist ? medals[i] : <span className="text-[12px] font-bold" style={{ color: C.textMuted }}>{i + 1}º</span>}
                        </div>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] grid place-items-center text-[11px] font-bold text-foreground/80 shrink-0 overflow-hidden">
                          {r.avatar
                            ? <img src={r.avatar} alt={r.name} className="w-full h-full object-cover" />
                            : r.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-foreground truncate">{r.name}</p>
                          <p className="text-[11px] truncate" style={{ color: C.textMuted }}>{r.class_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums text-accent">{r.pages}</p>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>páginas</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Atividades */}
          <Card className="border" style={{ background: C.cardBg, borderColor: C.border }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-accent" />
                Atividades da semana
                <Button size="sm" variant="ghost" onClick={() => navigate("/edu/jornadas")} className="ml-auto h-7 text-[11px] gap-1 text-muted-foreground hover:text-accent">
                  Criar nova <Plus className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Sem atividades cadastradas.</p>
              ) : (
                <ul className="space-y-2">
                  {recentActivities.map(a => (
                    <li
                      key={a.class_id}
                      onClick={() => navigate(`/edu/turmas/${a.class_id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-white/[0.03] transition-colors"
                      style={{ borderColor: C.border }}
                    >
                      <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0" style={{ background: `${C.purple}1A`, color: C.purple }}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                        <p className="text-[11px] truncate" style={{ color: C.textMuted }}>{a.class_name} · {a.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${a.completion}%`, background: C.green }} />
                          </div>
                          <span className="text-[11px] font-bold tabular-nums text-foreground">{a.completion}%</span>
                        </div>
                        <p className="text-[10px] mt-0.5" style={{ color: a.pending > 0 ? C.amber : C.textMuted }}>
                          {a.pending > 0 ? `${a.pending} pendente${a.pending > 1 ? "s" : ""}` : "tudo ok"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: C.textMuted }} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══════════ SEÇÃO 6 — Insights de IA (roxo) ═══════════ */}
        <section>
          <Card
            className="border relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${C.cardBg} 0%, hsl(258 50% 16%) 100%)`, borderColor: `${C.purple}33` }}
          >
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: `radial-gradient(circle, ${C.purple}40, transparent 65%)` }}
            />
            <CardHeader className="pb-3 relative">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: `${C.purple}26`, color: C.purple }}>
                  <Lightbulb className="w-4 h-4" />
                </div>
                Insights inteligentes
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: `${C.purple}26`, color: C.purple }}>
                  IA
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 relative">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {insights.map((ins, i) => {
                  const cfg = insightToneCfg[ins.tone];
                  const Icon = cfg.icon;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border"
                      style={{ borderColor: C.border, background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: `${cfg.color}1A`, color: cfg.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-[13px] leading-snug text-foreground/90">{ins.text}</p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Empty state if no classes at all */}
        {!loading && active.length === 0 && (
          <Card className="border-dashed" style={{ background: C.cardBg, borderColor: C.border }}>
            <CardContent className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Você ainda não tem turmas ativas.</p>
              <Button onClick={() => navigate("/edu/turmas")} className="bg-accent hover:bg-[hsl(var(--accent)/0.9)] text-accent-foreground font-bold">
                Criar primeira turma
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </EduLayout>
  );
};

// =================== Status column ===================
const StatusColumn = ({
  title, emoji, color, students, empty,
}: {
  title: string; emoji: string; color: string; empty: string;
  students: { user_id: string; class_name: string; name: string; page: number; totalPages: number; progress: number }[];
}) => (
  <Card className="border" style={{ background: C.cardBg, borderColor: C.border }}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        {title}
        <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${color}1A`, color }}>
          {students.length}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {students.length === 0 ? (
        <p className="text-[11px] text-center py-6" style={{ color: C.textMuted }}>{empty}</p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {students.slice(0, 6).map(s => (
            <li
              key={`${s.class_id}-${s.user_id}`}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] grid place-items-center text-[10px] font-bold text-foreground/80 shrink-0">
                {s.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-foreground truncate">{s.name}</p>
                <p className="text-[10.5px] truncate" style={{ color: C.textMuted }}>
                  {s.class_name} · pg {s.page}{s.totalPages ? `/${s.totalPages}` : ""}
                </p>
              </div>
              <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
                {s.progress}%
              </span>
            </li>
          ))}
          {students.length > 6 && (
            <li className="text-center text-[11px] pt-1" style={{ color: C.textMuted }}>
              + {students.length - 6} aluno{students.length - 6 > 1 ? "s" : ""}
            </li>
          )}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default EduDashboard;
