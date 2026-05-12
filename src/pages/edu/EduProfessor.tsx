import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, Users, BarChart3, LogOut,
  TrendingUp, Trophy, Target, Megaphone, Clock, ArrowUpRight,
  Search, FileCheck, BookOpen, Plus, Copy, Loader2, Send,
  Check, MessageSquare, Pencil, Download, FileText,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 as LoaderIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useClasses, ClassData, ClassMember } from "@/hooks/useClasses";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { useEduEngagement } from "@/hooks/useEduEngagement";
import { useClassQuestions } from "@/hooks/useClassQuestions";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { downloadReportPDF } from "@/lib/edu/generateReportPDF";
import { useTeacherSettings } from "@/hooks/useTeacherSettings";
import TeacherProfileGate from "@/components/edu/TeacherProfileGate";

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

const navItems = [
  { icon: LayoutDashboard, label: "Painel", tab: "overview" },
  { icon: Users, label: "Turma", tab: "students" },
  { icon: FileCheck, label: "Atividades", tab: "reviews" },
  { icon: BarChart3, label: "Relatórios", tab: "reports" },
];

const EduProfessorInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { classes, loading: loadingClasses, fetchClassMembers, setBookForClass, fetchClasses } = useClasses();
  const { settings } = useTeacherSettings();

  const tabFromUrl = new URLSearchParams(location.search).get("tab") || "overview";
  const classFromUrl = new URLSearchParams(location.search).get("class");
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Book dialog
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [bookForm, setBookForm] = useState({ book_title: "", author: "", total_pages: "", reading_start_date: "", reading_deadline: "" });
  const [savingBook, setSavingBook] = useState(false);

  // Review feedback per response (id -> text)
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const activeClasses = useMemo(() => classes.filter(c => c.is_active && !c.is_archived), [classes]);

  // Pick initial class
  useEffect(() => {
    if (selectedClassId) return;
    if (classFromUrl && activeClasses.find(c => c.id === classFromUrl)) {
      setSelectedClassId(classFromUrl);
    } else if (activeClasses[0]) {
      setSelectedClassId(activeClasses[0].id);
    }
  }, [activeClasses, selectedClassId, classFromUrl]);

  const selectedClass: ClassData | undefined = activeClasses.find(c => c.id === selectedClassId);

  const { progressData, fetchProgress } = useClassReadingProgress();
  const { announcements, createAnnouncement } = useEduEngagement(selectedClassId || undefined);
  const { questions, responses, fetchQuestions, reviewResponse } = useClassQuestions();

  useEffect(() => {
    if (!selectedClassId) return;
    fetchClassMembers(selectedClassId).then(setMembers);
    fetchProgress(selectedClassId);
    fetchQuestions(selectedClassId);
  }, [selectedClassId]);

  const openBookDialog = () => {
    if (!selectedClass) return;
    setBookForm({
      book_title: selectedClass.book_title || "",
      author: selectedClass.author || "",
      total_pages: selectedClass.total_pages ? String(selectedClass.total_pages) : "",
      reading_start_date: selectedClass.reading_start_date || "",
      reading_deadline: selectedClass.reading_deadline || "",
    });
    setShowBookDialog(true);
  };

  const handleSaveBook = async () => {
    if (!selectedClass || !bookForm.book_title.trim()) {
      toast({ title: "Título obrigatório", description: "Informe o nome do livro.", variant: "destructive" });
      return;
    }
    setSavingBook(true);
    const ok = await setBookForClass(selectedClass.id, {
      book_title: bookForm.book_title.trim(),
      author: bookForm.author.trim() || null,
      total_pages: bookForm.total_pages ? parseInt(bookForm.total_pages, 10) : null,
      reading_start_date: bookForm.reading_start_date || null,
      reading_deadline: bookForm.reading_deadline || null,
    });
    setSavingBook(false);
    if (ok) {
      setShowBookDialog(false);
      // refresh progress to reflect new seeded rows
      fetchProgress(selectedClass.id);
    }
  };

  // Stats derivation
  const totalPages = selectedClass?.total_pages || 0;
  const ranked = useMemo(() => {
    return members
      .map(m => {
        const p = progressData.find(pr => pr.user_id === m.user_id);
        return {
          ...m,
          current_page: p?.current_page || 0,
          last_read_date: p?.last_read_date || null,
          pages_today: p?.pages_read_today || 0,
          progress_percent: totalPages > 0 ? Math.round(((p?.current_page || 0) / totalPages) * 100) : 0,
        };
      })
      .sort((a, b) => b.current_page - a.current_page);
  }, [members, progressData, totalPages]);

  const avgProgress = ranked.length > 0
    ? Math.round(ranked.reduce((s, r) => s + r.progress_percent, 0) / ranked.length)
    : 0;
  const today = new Date().toISOString().split("T")[0];
  const activeToday = ranked.filter(r => r.last_read_date === today).length;
  const aheadCount = ranked.filter(r => r.progress_percent >= avgProgress + 10).length;
  const onTrackCount = ranked.filter(r => Math.abs(r.progress_percent - avgProgress) < 10).length;
  const behindCount = ranked.filter(r => r.progress_percent <= avgProgress - 10).length;

  // Pending reviews = responses with no reviewed_at
  const pendingReviewCount = responses.filter(r => !r.reviewed_at).length;

  // Chart data
  const progressChartData = useMemo(() => ranked.map(r => ({
    name: (r.profile?.full_name || "Aluno").split(" ")[0].slice(0, 12),
    progresso: r.progress_percent,
  })), [ranked]);

  const exportCSV = () => {
    if (!selectedClass) return;
    const rows = [
      ["Aluno", "Página atual", "Total de páginas", "Progresso (%)", "Páginas hoje", "Última leitura", "Status"],
      ...ranked.map(r => [
        (r.profile?.full_name || "Aluno").replace(/;/g, ","),
        r.current_page,
        totalPages,
        r.progress_percent,
        r.pages_today,
        r.last_read_date || "",
        r.progress_percent >= avgProgress + 10 ? "Adiantado"
          : r.progress_percent <= avgProgress - 10 ? "Atrasado" : "No prazo",
      ]),
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${selectedClass.name.replace(/ /g, "_")}-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportClassPDF = () => {
    if (!selectedClass) return;
    const summary = ranked
      .map(r => `${r.profile?.full_name || "Aluno"} — ${r.current_page}/${totalPages || "?"} págs (${r.progress_percent}%)`)
      .join("\n");
    downloadReportPDF({
      studentName: `Turma ${selectedClass.name}`,
      className: selectedClass.name,
      bookTitle: selectedClass.book_title,
      schoolName: settings?.school_name,
      teacherName: profile?.full_name,
      periodLabel: new Date().toLocaleDateString("pt-BR"),
      metrics: {
        progress: avgProgress,
        chapters: 0,
        frequency: activeToday,
        reflections: responses.length,
        current_page: 0,
        total_pages: totalPages,
      },
      analysisText:
        `A turma ${selectedClass.name} está com progresso médio de ${avgProgress}% no livro "${selectedClass.book_title || "—"}". ` +
        `${activeToday} aluno(s) leram hoje. ${aheadCount} adiantado(s), ${onTrackCount} no prazo, ${behindCount} atrasado(s). ` +
        `Total de respostas em atividades: ${responses.length}.\n\nDetalhamento:\n${summary}`,
      teacherNote: undefined,
      signature: settings?.signature,
    });
  };

  const filteredStudents = ranked.filter(r =>
    (r.profile?.full_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const copyCode = () => {
    if (!selectedClass) return;
    navigator.clipboard.writeText(selectedClass.access_code);
    toast({ title: "Código copiado!", description: selectedClass.access_code });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) return;
    await createAnnouncement(announcementText.trim());
    setAnnouncementText("");
    setShowAnnouncementDialog(false);
  };

  const initials = (profile?.full_name ?? "P").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const setTab = (t: string) => {
    setActiveTab(t);
    const params = new URLSearchParams(location.search);
    params.set("tab", t);
    if (selectedClassId) params.set("class", selectedClassId);
    navigate(`/edu/professor?${params.toString()}`, { replace: true });
  };

  if (loadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No classes yet → CTA to onboarding/turmas
  if (activeClasses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-10 space-y-4">
            <Users className="h-14 w-14 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">Você ainda não tem turmas</h2>
            <p className="text-sm text-muted-foreground">Crie sua primeira turma para começar a acompanhar seus alunos.</p>
            <Button onClick={() => navigate("/edu/onboarding")} className="gap-2">
              <Plus className="h-4 w-4" /> Criar primeira turma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card sticky top-0 h-screen z-30">
          <div className="p-4 flex items-center gap-2 border-b border-border">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <div>
              <span className="font-bold text-foreground text-sm">BookQuest</span>
              <span className="ml-1 text-xs font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">EDU</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => {
              const active = activeTab === item.tab;
              return (
                <button
                  key={item.label}
                  onClick={() => setTab(item.tab)}
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

            <div className="pt-4 mt-2 border-t border-border space-y-1">
              <button
                onClick={() => navigate("/edu/turmas")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" /> Nova turma
              </button>
              <button
                onClick={() => navigate("/edu/jornadas")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <BookOpen className="h-4 w-4" /> Jornadas
              </button>
              <button
                onClick={() => navigate("/edu/configuracoes")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Target className="h-4 w-4" /> Configurações
              </button>
            </div>
          </nav>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Avatar className="h-9 w-9">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{profile?.full_name ?? "Professor"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{(profile as any)?.school_name ?? "Educador"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-2">
          {navItems.map(item => {
            const active = activeTab === item.tab;
            return (
              <button
                key={item.label}
                onClick={() => setTab(item.tab)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${active ? "text-accent" : "text-muted-foreground"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <main className="flex-1 min-h-screen pb-24 lg:pb-6">
          <div className="p-4 lg:px-8 lg:py-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-7 w-7 text-accent" />
                  Painel do Professor
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {(profile as any)?.school_name ? `${(profile as any).school_name} · ` : ""}{selectedClass?.name ?? "Selecione uma turma"}
                </p>
              </div>
              {selectedClass && (
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 text-xs font-mono bg-accent/10 text-accent px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Código: {selectedClass.access_code}
                </button>
              )}
            </div>

            {/* Class selector */}
            {activeClasses.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeClasses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassId(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      c.id === selectedClassId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="overview">Visão geral</TabsTrigger>
                <TabsTrigger value="students">Alunos</TabsTrigger>
                <TabsTrigger value="reviews">Atividades</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Alunos" value={members.length} color="text-primary" />
                  <StatCard icon={TrendingUp} label="Progresso médio" value={`${avgProgress}%`} color="text-accent" />
                  <StatCard icon={Clock} label="Ativos hoje" value={activeToday} color="text-success" />
                  <StatCard icon={FileCheck} label="Respostas" value={pendingReviewCount} color="text-destructive" />
                </div>

                {/* Book / Class progress */}
                <Card className="bg-card border-border overflow-hidden">
                  <div className="grid md:grid-cols-[180px_1fr] gap-0">
                    <div className="bg-muted/40 p-4 flex items-center justify-center">
                      <div className="w-28 h-40 bg-primary/10 rounded-md flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/60" />
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Livro atual da turma</p>
                        <h2 className="text-xl font-bold text-foreground">
                          {selectedClass?.book_title ?? "Sem livro definido"}
                        </h2>
                        {selectedClass?.author && (
                          <p className="text-sm text-muted-foreground">{selectedClass.author}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progresso médio</span>
                          <span className="font-semibold text-foreground">{avgProgress}%</span>
                        </div>
                        <Progress value={avgProgress} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {selectedClass?.reading_start_date && (
                          <span>📅 Início: {new Date(selectedClass.reading_start_date).toLocaleDateString("pt-BR")}</span>
                        )}
                        {selectedClass?.reading_deadline && (
                          <span>🎯 Prazo: {new Date(selectedClass.reading_deadline).toLocaleDateString("pt-BR")}</span>
                        )}
                        {totalPages > 0 && <span>📖 {totalPages} páginas</span>}
                      </div>
                      <Button size="sm" variant={selectedClass?.book_title ? "outline" : "default"} onClick={openBookDialog}>
                        <Pencil className="h-4 w-4 mr-1.5" />
                        {selectedClass?.book_title ? "Alterar livro" : "Definir livro"}
                      </Button>
                    </CardContent>
                  </div>
                </Card>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Top 5 ranking */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-accent" />
                        Top 5 da turma
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {ranked.slice(0, 5).map((s, i) => (
                        <div key={s.user_id} className="flex items-center gap-3">
                          <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                            {i + 1}º
                          </span>
                          <Avatar className="h-8 w-8">
                            {s.profile?.avatar_url && <AvatarImage src={s.profile.avatar_url} alt={s.profile.full_name || ""} />}
                            <AvatarFallback>{(s.profile?.full_name?.[0] || "A").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {s.profile?.full_name || "Aluno"}
                            </p>
                            <Progress value={s.progress_percent} className="h-1 mt-0.5" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{s.current_page}p</span>
                        </div>
                      ))}
                      {ranked.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          Nenhum aluno inscrito ainda. Compartilhe o código com a turma.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent activity */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-accent" />
                        Atividade recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ranked
                        .filter(r => r.last_read_date)
                        .slice(0, 5)
                        .map(r => (
                          <div key={r.user_id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground">
                                <span className="font-medium">{r.profile?.full_name || "Aluno"}</span>{" "}
                                <span className="text-muted-foreground">
                                  está na página {r.current_page}
                                  {r.pages_today > 0 ? ` (+${r.pages_today} hoje)` : ""}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {r.last_read_date ? new Date(r.last_read_date).toLocaleDateString("pt-BR") : ""}
                              </p>
                            </div>
                          </div>
                        ))}
                      {ranked.filter(r => r.last_read_date).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          Aguardando primeira leitura dos alunos.
                        </p>
                      )}
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
                    <Button size="sm" variant="outline" onClick={() => setShowAnnouncementDialog(true)}>
                      Novo aviso
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Nenhum aviso enviado ainda.
                      </p>
                    ) : (
                      announcements.slice(0, 5).map(a => (
                        <div key={a.id} className="p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-sm text-foreground">{a.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(a.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* STUDENTS */}
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
                          onChange={e => setSearch(e.target.value)}
                          className="pl-9 w-full sm:w-60"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredStudents.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        {ranked.length === 0
                          ? "Nenhum aluno entrou na turma ainda."
                          : "Nenhum aluno encontrado para essa busca."}
                      </p>
                    )}
                    {filteredStudents.map((s, i) => {
                      const status = s.progress_percent >= avgProgress + 10
                        ? { label: "Adiantado", cls: "text-success bg-success/10" }
                        : s.progress_percent <= Math.max(0, avgProgress - 10)
                        ? { label: "Atrasado", cls: "text-destructive bg-destructive/10" }
                        : { label: "No prazo", cls: "text-primary bg-primary/10" };
                      return (
                        <div
                          key={s.user_id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                        >
                          <span className="w-8 text-center text-sm font-bold text-muted-foreground">{i + 1}º</span>
                          <Avatar className="h-10 w-10">
                            {s.profile?.avatar_url && <AvatarImage src={s.profile.avatar_url} alt={s.profile.full_name || ""} />}
                            <AvatarFallback>{(s.profile?.full_name?.[0] || "A").toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {s.profile?.full_name || "Aluno"}
                              </p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${status.cls}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={s.progress_percent} className="h-1.5 flex-1" />
                              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                                {s.current_page}/{totalPages || "?"}
                              </span>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right text-xs text-muted-foreground">
                            <p>{s.pages_today} págs/hoje</p>
                            <p>{s.last_read_date ? new Date(s.last_read_date).toLocaleDateString("pt-BR") : "—"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* REVIEWS */}
              <TabsContent value="reviews" className="space-y-4 mt-6">
                {questions.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-12 space-y-3">
                      <FileCheck className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground text-sm">Nenhuma pergunta criada ainda.</p>
                      <p className="text-xs text-muted-foreground">
                        Crie perguntas de reflexão para a turma na seção de jornadas.
                      </p>
                      <Button size="sm" variant="outline" onClick={() => navigate("/edu/perguntas")}>
                        <Plus className="h-4 w-4 mr-1.5" /> Criar pergunta
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  questions.map(q => {
                    const qResponses = responses.filter(r => r.question_id === q.id);
                    return (
                      <Card key={q.id} className="bg-card border-border">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                Capítulo {q.chapter_number ?? "—"}
                              </p>
                              <CardTitle className="text-sm mt-0.5">{q.question_text}</CardTitle>
                            </div>
                            <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded-full whitespace-nowrap">
                              {qResponses.length} resposta{qResponses.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {qResponses.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Sem respostas ainda.</p>
                          ) : (
                            qResponses.map(r => {
                              const m = members.find(mm => mm.user_id === r.user_id);
                              const reviewed = !!r.reviewed_at;
                              const draft = feedbackDrafts[r.id] ?? r.teacher_feedback ?? "";
                              return (
                                <div key={r.id} className={`p-3 rounded-lg border space-y-2 ${reviewed ? "bg-success/5 border-success/30" : "bg-muted/40 border-border"}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground">
                                      {m?.profile?.full_name || "Aluno"}
                                    </p>
                                    {reviewed ? (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 font-semibold flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Revisada
                                      </span>
                                    ) : (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30 font-semibold">
                                        Pendente
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground/90">{r.response_text}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(r.created_at).toLocaleString("pt-BR")}
                                  </p>

                                  <div className="pt-2 border-t border-border space-y-2">
                                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                      <MessageSquare className="h-3 w-3" /> Feedback do professor
                                    </div>
                                    <Textarea
                                      rows={2}
                                      placeholder="Escreva um feedback para o aluno..."
                                      value={draft}
                                      onChange={e => setFeedbackDrafts(s => ({ ...s, [r.id]: e.target.value }))}
                                      className="text-sm"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                          if (!selectedClassId) return;
                                          await reviewResponse(r.id, selectedClassId, draft.trim());
                                        }}
                                      >
                                        <Check className="h-3.5 w-3.5 mr-1" /> Marcar como revisada
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* REPORTS */}
              <TabsContent value="reports" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total de alunos" value={members.length} color="text-primary" />
                  <StatCard icon={TrendingUp} label="Progresso médio" value={`${avgProgress}%`} color="text-accent" />
                  <StatCard icon={Target} label="No prazo" value={onTrackCount} color="text-success" />
                  <StatCard icon={Clock} label="Ativos hoje" value={activeToday} color="text-primary" />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Adiantados</p>
                      <p className="text-2xl font-bold text-success">{aheadCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">No prazo</p>
                      <p className="text-2xl font-bold text-primary">{onTrackCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Atrasados</p>
                      <p className="text-2xl font-bold text-destructive">{behindCount}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-accent" /> Progresso por aluno
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={exportCSV} disabled={ranked.length === 0}>
                        <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={exportClassPDF} disabled={ranked.length === 0}>
                        <FileText className="h-3.5 w-3.5 mr-1.5" /> PDF da turma
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate("/edu/relatorios")}>
                        Por aluno →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {progressChartData.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Sem dados de leitura ainda.
                      </p>
                    ) : (
                      <div className="w-full h-72">
                        <ResponsiveContainer>
                          <BarChart data={progressChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                            <Tooltip
                              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                              formatter={(v: any) => [`${v}%`, "Progresso"]}
                            />
                            <Bar dataKey="progresso" radius={[6, 6, 0, 0]}>
                              {progressChartData.map((d, i) => (
                                <Cell key={i} fill={
                                  d.progresso >= avgProgress + 10 ? "hsl(var(--success))"
                                  : d.progresso <= avgProgress - 10 ? "hsl(var(--destructive))"
                                  : "hsl(var(--primary))"
                                } />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Announcement dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-accent" />
              Novo aviso para a turma
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            placeholder="Escreva o aviso que será enviado a todos os alunos..."
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncementDialog(false)}>Cancelar</Button>
            <Button onClick={handleSendAnnouncement} disabled={!announcementText.trim()}>
              <Send className="h-4 w-4 mr-2" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              {selectedClass?.book_title ? "Alterar livro da turma" : "Definir livro da turma"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Título *</label>
              <Input value={bookForm.book_title} onChange={e => setBookForm(s => ({ ...s, book_title: e.target.value }))} placeholder="Ex.: Dom Casmurro" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Autor</label>
              <Input value={bookForm.author} onChange={e => setBookForm(s => ({ ...s, author: e.target.value }))} placeholder="Ex.: Machado de Assis" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Páginas</label>
                <Input type="number" value={bookForm.total_pages} onChange={e => setBookForm(s => ({ ...s, total_pages: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Início</label>
                <Input type="date" value={bookForm.reading_start_date} onChange={e => setBookForm(s => ({ ...s, reading_start_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Prazo</label>
                <Input type="date" value={bookForm.reading_deadline} onChange={e => setBookForm(s => ({ ...s, reading_deadline: e.target.value }))} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ao salvar, o progresso inicial dos alunos da turma será criado automaticamente em 0 páginas.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveBook} disabled={savingBook || !bookForm.book_title.trim()}>
              {savingBook ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EduProfessor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      if (authLoading || roleLoading) return;
      if (!user) { navigate("/auth?redirect=/edu", { replace: true }); return; }
      if (!isTeacher) { navigate("/edu", { replace: true }); return; }

      const { data } = await supabase
        .from("edu_teachers" as any)
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if ((data as any)?.onboarding_completed === false) {
        // Self-heal: if the teacher already has at least one class, treat onboarding as complete
        const { count } = await supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .eq("teacher_id", user.id);

        if ((count ?? 0) > 0) {
          await supabase
            .from("edu_teachers" as any)
            .update({ onboarding_completed: true } as any)
            .eq("user_id", user.id);
        } else {
          navigate("/edu/onboarding", { replace: true });
          return;
        }
      }
      setChecking(false);
    })();
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isTeacher) return null;

  return (
    <TeacherProfileGate>
      <EduProfessorInner />
    </TeacherProfileGate>
  );
};

export default EduProfessor;
