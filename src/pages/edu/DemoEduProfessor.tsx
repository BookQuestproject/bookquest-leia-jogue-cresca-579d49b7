import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, Users, BarChart3, LogOut,
  BookOpen, TrendingUp, Trophy, Target, Megaphone, CheckCircle2,
  Clock, ArrowUpRight, Search, Filter, FileCheck,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DemoBanner from "@/components/demo/DemoBanner";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  DEMO_TEACHER, DEMO_CLASS, DEMO_STUDENTS,
  DEMO_RECENT_ACTIVITIES, DEMO_PENDING_REVIEWS, DEMO_REPORTS, DEMO_ANNOUNCEMENTS,
} from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Painel", path: "/edu/demo/professor" },
  { icon: Users, label: "Turma", path: "/edu/demo/professor?tab=students" },
  { icon: FileCheck, label: "Atividades", path: "/edu/demo/professor?tab=reviews" },
  { icon: BarChart3, label: "Relatórios", path: "/edu/demo/professor?tab=reports" },
];

const statusColors: Record<string, string> = {
  ahead: "text-success bg-success/10",
  on_track: "text-primary bg-primary/10",
  behind: "text-destructive bg-destructive/10",
};
const statusLabels: Record<string, string> = {
  ahead: "Adiantado",
  on_track: "No prazo",
  behind: "Atrasado",
};

const DemoEduProfessor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { endDemo, isDemo } = useDemoMode();
  const { toast } = useToast();
  const tabFromUrl = new URLSearchParams(location.search).get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [search, setSearch] = useState("");

  if (!isDemo) {
    navigate("/edu", { replace: true });
    return null;
  }

  const filteredStudents = DEMO_STUDENTS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (studentName: string) => {
    toast({
      title: "✅ Aprovado (demo)",
      description: `Atividade de ${studentName} aprovada. Nenhum dado real foi alterado.`,
    });
  };

  const handleSignOut = () => {
    endDemo();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card sticky top-[40px] h-[calc(100vh-40px)] z-30">
          <div className="p-4 flex items-center gap-2 border-b border-border">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <div>
              <span className="font-bold text-foreground text-sm">BookQuest</span>
              <span className="ml-1 text-xs font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">EDU</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const itemTab = new URLSearchParams(item.path.split("?")[1] || "").get("tab") || "overview";
              const active = activeTab === itemTab;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(itemTab);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={DEMO_TEACHER.avatar} alt={DEMO_TEACHER.name} />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{DEMO_TEACHER.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{DEMO_CLASS.school}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair do demo
            </Button>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-2">
          {navItems.map((item) => {
            const itemTab = new URLSearchParams(item.path.split("?")[1] || "").get("tab") || "overview";
            const active = activeTab === itemTab;
            return (
              <button
                key={item.label}
                onClick={() => { setActiveTab(itemTab); navigate(item.path); }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${active ? "text-accent" : "text-muted-foreground"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-6">
          <div className="p-4 lg:px-8 lg:py-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-7 w-7 text-accent" />
                  Painel do Professor
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {DEMO_CLASS.school} · {DEMO_CLASS.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-accent/10 text-accent px-3 py-1.5 rounded-full">
                  Código: {DEMO_CLASS.access_code}
                </span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); navigate(`/edu/demo/professor?tab=${v}`); }}>
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="overview">Visão geral</TabsTrigger>
                <TabsTrigger value="students">Alunos</TabsTrigger>
                <TabsTrigger value="reviews">Atividades</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Alunos" value={DEMO_CLASS.members_count} color="text-primary" />
                  <StatCard icon={TrendingUp} label="Progresso médio" value={`${DEMO_CLASS.avg_progress}%`} color="text-accent" />
                  <StatCard icon={Clock} label="Ativos hoje" value={DEMO_REPORTS.active_today} color="text-success" />
                  <StatCard icon={FileCheck} label="A corrigir" value={DEMO_PENDING_REVIEWS.length} color="text-destructive" />
                </div>

                {/* Book + class progress */}
                <Card className="bg-card border-border overflow-hidden">
                  <div className="grid md:grid-cols-[180px_1fr] gap-0">
                    <div className="bg-muted/40 p-4 flex items-center justify-center">
                      <img
                        src={DEMO_CLASS.book_cover}
                        alt={DEMO_CLASS.book_title}
                        className="w-28 h-40 object-cover rounded-md shadow-md"
                      />
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Livro atual da turma</p>
                        <h2 className="text-xl font-bold text-foreground">{DEMO_CLASS.book_title}</h2>
                        <p className="text-sm text-muted-foreground">{DEMO_CLASS.book_author}</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso médio da turma</span>
                          <span className="font-semibold text-foreground">{DEMO_CLASS.avg_progress}%</span>
                        </div>
                        <Progress value={DEMO_CLASS.avg_progress} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>📅 Início: {new Date(DEMO_CLASS.reading_start_date).toLocaleDateString("pt-BR")}</span>
                        <span>🎯 Prazo: {new Date(DEMO_CLASS.reading_deadline).toLocaleDateString("pt-BR")}</span>
                        <span>📖 {DEMO_CLASS.total_pages} páginas</span>
                      </div>
                    </CardContent>
                  </div>
                </Card>

                {/* Recent activities + ranking */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-accent" />
                        Atividades recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {DEMO_RECENT_ACTIVITIES.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground">
                              <span className="font-medium">{a.student}</span>{" "}
                              <span className="text-muted-foreground">{a.action}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-accent" />
                        Top 5 da turma
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {DEMO_STUDENTS.slice(0, 5).map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3">
                          <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                            {i + 1}º
                          </span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={s.avatar} alt={s.name} />
                            <AvatarFallback>{s.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <Progress value={s.progress_percent} className="h-1 mt-0.5" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{s.current_page}p</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Announcements */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-accent" />
                      Avisos da turma
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Aviso criado (demo)", description: "Em produção, esse aviso seria enviado para todos os alunos." })}>
                      Novo aviso
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DEMO_ANNOUNCEMENTS.map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-muted/40 border border-border">
                        <p className="text-sm text-foreground">{a.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{a.created_at}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students */}
              <TabsContent value="students" className="space-y-4 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Lista de alunos ({filteredStudents.length})
                      </CardTitle>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Buscar aluno..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 w-full sm:w-60"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredStudents.map((s, i) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                      >
                        <span className="w-8 text-center text-sm font-bold text-muted-foreground">{i + 1}º</span>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={s.avatar} alt={s.name} />
                          <AvatarFallback>{s.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[s.status]}`}>
                              {statusLabels[s.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={s.progress_percent} className="h-1.5 flex-1" />
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {s.current_page}/{DEMO_CLASS.total_pages}
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right text-xs text-muted-foreground">
                          <p>{s.pages_today} págs/hoje</p>
                          <p>{s.last_active}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="space-y-4 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-destructive" />
                      Entregas e correções pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DEMO_PENDING_REVIEWS.map((r) => (
                      <div key={r.id} className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{r.student}</p>
                            <p className="text-xs text-muted-foreground">{r.chapter} · {r.type}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{r.submitted}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(r.student)}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast({ title: "Devolvido (demo)", description: "Aluno seria notificado para refazer." })}>
                            Devolver
                          </Button>
                          <Button size="sm" variant="ghost">Ver entrega</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports */}
              <TabsContent value="reports" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total de alunos" value={DEMO_REPORTS.total_students} color="text-primary" />
                  <StatCard icon={TrendingUp} label="Páginas/dia (média)" value={DEMO_REPORTS.avg_pages_per_day} color="text-accent" />
                  <StatCard icon={Target} label="No prazo" value={DEMO_REPORTS.on_track_count} color="text-success" />
                  <StatCard icon={Clock} label="Conclusão prevista" value={DEMO_REPORTS.completion_forecast} color="text-primary" />
                </div>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-accent" />
                      Atividade da semana (páginas lidas)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-2 h-48">
                      {DEMO_REPORTS.weekly_activity.map((d) => {
                        const max = Math.max(...DEMO_REPORTS.weekly_activity.map((x) => x.pages));
                        const h = (d.pages / max) * 100;
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground font-mono">{d.pages}</span>
                            <div
                              className="w-full bg-gradient-to-t from-primary to-accent rounded-t-md transition-all"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Adiantados</p>
                      <p className="text-2xl font-bold text-success">{DEMO_REPORTS.ahead_count}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">No prazo</p>
                      <p className="text-2xl font-bold text-primary">{DEMO_REPORTS.on_track_count}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Atrasados</p>
                      <p className="text-2xl font-bold text-destructive">{DEMO_REPORTS.behind_count}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <Card className="bg-card border-border">
    <CardContent className="flex items-center gap-3 p-4">
      <div className={`p-2.5 rounded-xl bg-muted ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export default DemoEduProfessor;
