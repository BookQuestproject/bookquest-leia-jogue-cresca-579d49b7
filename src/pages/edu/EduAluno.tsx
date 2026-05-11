import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Trophy, Target, Megaphone, LogOut, CheckCircle2,
  Flame, Sparkles, LayoutDashboard, ClipboardList, BarChart3,
  Send, HelpCircle, Loader2, Users, Medal, TrendingUp, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { useEduEngagement } from "@/hooks/useEduEngagement";
import { useClassQuestions } from "@/hooks/useClassQuestions";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useToast } from "@/hooks/use-toast";

interface ClassInfo {
  id: string;
  name: string;
  book_title: string | null;
  author: string | null;
  total_pages: number | null;
  reading_deadline: string | null;
  reading_start_date: string | null;
  access_code: string;
}

type Section = "dashboard" | "book" | "ranking" | "activities" | "announcements" | "stats";

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "book", label: "Livro", icon: BookOpen },
  { id: "activities", label: "Atividades", icon: ClipboardList },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "announcements", label: "Avisos", icon: Megaphone },
  { id: "stats", label: "Progresso", icon: BarChart3 },
];

const MiniStat = ({ icon: Icon, value, label, tone }: { icon: any; value: string | number; label: string; tone: "primary" | "accent" | "destructive" }) => {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border min-w-0">
      <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${colorMap[tone]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground leading-none truncate">{value}</p>
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
};

const InfoSquare = ({ icon: Icon, title, value, subtitle, tone, onClick }: {
  icon: any; title: string; value: string | number; subtitle: string;
  tone: "primary" | "accent" | "destructive"; onClick?: () => void;
}) => {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20 hover:border-primary/40",
    accent: "text-accent bg-accent/10 border-accent/20 hover:border-accent/40",
    destructive: "text-destructive bg-destructive/10 border-destructive/20 hover:border-destructive/40",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left rounded-lg border-2 bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md ${colorMap[tone]}`}
    >
      <div className={`h-9 w-9 rounded-md flex items-center justify-center mb-2 ${colorMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</p>
      <p className="text-xl font-bold text-foreground mt-0.5 leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
    </button>
  );
};

const EduAluno = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studentClasses } = useEduRole();
  const { progressData, fetchProgress, updateProgress } = useClassReadingProgress();
  const { profile } = useProfile();
  const { essencia, streak } = useUserStats();
  const { toast } = useToast();

  const [section, setSection] = useState<Section>("dashboard");
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classRanking, setClassRanking] = useState<any[]>([]);
  const [updatingPage, setUpdatingPage] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/edu/aluno");
  }, [authLoading, user, navigate]);

  // Auto-select first class
  useEffect(() => {
    if (studentClasses.length > 0 && !selectedClass) {
      setSelectedClass(studentClasses[0] as ClassInfo);
    }
  }, [studentClasses, selectedClass]);

  const { announcements } = useEduEngagement(selectedClass?.id);
  const { questions, responses, fetchQuestions, createResponse } = useClassQuestions();

  useEffect(() => {
    if (selectedClass?.id) {
      fetchProgress(selectedClass.id);
      fetchQuestions(selectedClass.id);
      fetchRanking(selectedClass.id);
    }
  }, [selectedClass?.id]);

  const fetchRanking = async (classId: string) => {
    const { data: members } = await supabase.from("class_members").select("user_id").eq("class_id", classId);
    if (!members) return;
    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles_public" as any)
      .select("id, full_name, username, avatar_url")
      .in("id", userIds);
    const { data: progress } = await supabase
      .from("class_reading_progress")
      .select("user_id, current_page")
      .eq("class_id", classId);

    const ranked = userIds.map(uid => {
      const p = (profiles as any[])?.find(x => x.id === uid);
      const pr = (progress as any[])?.find(x => x.user_id === uid);
      return {
        user_id: uid,
        name: p?.full_name || p?.username || "Aluno",
        avatar_url: p?.avatar_url,
        pages: pr?.current_page || 0,
      };
    }).sort((a, b) => b.pages - a.pages);
    setClassRanking(ranked);
  };

  const totalPages = selectedClass?.total_pages || 0;
  const myProgress = progressData.find(p => p.user_id === user?.id);
  const currentPage = myProgress?.current_page || 0;
  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const myRank = classRanking.findIndex(r => r.user_id === user?.id) + 1;

  const myResponseIds = useMemo(
    () => new Set(responses.filter(r => r.user_id === user?.id).map(r => r.question_id)),
    [responses, user?.id],
  );
  const pendingQuestions = questions.filter(q => !myResponseIds.has(q.id));
  const submittedQuestions = questions.filter(q => myResponseIds.has(q.id));

  const deadline = selectedClass?.reading_deadline ? new Date(selectedClass.reading_deadline) : null;
  const today = new Date();
  const daysRemaining = deadline ? Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / 86400000)) : 0;
  const dailyGoal = daysRemaining > 0 ? Math.ceil(Math.max(0, totalPages - currentPage) / daysRemaining) : 0;

  const handleUpdatePage = async () => {
    if (!selectedClass) return;
    const page = parseInt(updatingPage);
    if (isNaN(page) || page < 0 || page > totalPages) {
      toast({ title: "Página inválida", description: `Digite entre 0 e ${totalPages}.`, variant: "destructive" });
      return;
    }
    await updateProgress(selectedClass.id, page);
    setUpdatingPage("");
    fetchRanking(selectedClass.id);
  };

  const handleSubmitResponse = async () => {
    if (!activeQuestion || responseText.trim().length < 10) {
      toast({ title: "Resposta muito curta", description: "Escreva pelo menos 10 caracteres.", variant: "destructive" });
      return;
    }
    await createResponse(activeQuestion.id, responseText.trim());
    setResponseText("");
    setActiveQuestion(null);
  };

  const initials = (profile?.full_name || "A").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const studentName = profile?.full_name || "Aluno";

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // No classes
  if (!selectedClass) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-10 space-y-4">
            <Users className="h-14 w-14 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">Entre na sua primeira turma</h2>
            <p className="text-sm text-muted-foreground">Peça o código da turma ao seu professor.</p>
            <Button onClick={() => navigate("/edu")} className="gap-2">
              <Users className="h-4 w-4" /> Entrar com código
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card fixed h-screen top-0 z-20">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-bold text-foreground text-sm">BookQuest</div>
              <div className="text-[10px] font-semibold text-accent uppercase tracking-wider">EDU · Aluno</div>
            </div>
          </div>

          {/* Profile */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={studentName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{studentName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{selectedClass.name}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-center">
              <div className="rounded-md bg-accent/10 py-1.5">
                <p className="text-[9px] uppercase text-muted-foreground">✦</p>
                <p className="text-sm font-bold text-accent">{essencia}</p>
              </div>
              <div className="rounded-md bg-destructive/5 py-1.5">
                <p className="text-[9px] uppercase text-muted-foreground">🔥</p>
                <p className="text-sm font-bold text-destructive">{streak}</p>
              </div>
            </div>
          </div>

          {/* Class switcher */}
          {studentClasses.length > 1 && (
            <div className="p-3 border-b border-border space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-2">Suas turmas</p>
              {studentClasses.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClass(c as ClassInfo)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md ${
                    c.id === selectedClass.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV.map(item => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
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
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoCrown} alt="" className="h-7 w-7" />
            <span className="font-bold text-foreground text-sm">BookQuest EDU</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-1.5 overflow-x-auto">
          {NAV.slice(0, 5).map(item => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] min-w-[56px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0 pb-24 lg:pb-6">
          <main className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
            {section === "dashboard" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                      Olá, {studentName.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong className="text-foreground">{selectedClass.name}</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <MiniStat icon={Sparkles} value={essencia} label="Essência" tone="primary" />
                    <MiniStat icon={Flame} value={streak} label="Sequência" tone="destructive" />
                    <MiniStat icon={Trophy} value={myRank > 0 ? `#${myRank}` : "—"} label="Ranking" tone="accent" />
                    <MiniStat icon={BookOpen} value={`${currentPage}p`} label="Página" tone="primary" />
                  </div>
                </div>

                {/* Book card */}
                <Card className="border-2 border-primary/20 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 via-card to-accent/5 p-5 lg:p-6 border-b border-border">
                    <div className="flex items-start gap-4 flex-wrap">
                      <div className="w-20 h-28 lg:w-24 lg:h-32 rounded-md shadow-md flex-shrink-0 bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary/60" />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Livro da Turma</p>
                        <h2 className="text-xl lg:text-2xl font-bold text-foreground mt-1 leading-tight">
                          {selectedClass.book_title ?? "Aguardando o livro"}
                        </h2>
                        {selectedClass.author && <p className="text-sm text-muted-foreground">{selectedClass.author}</p>}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                            {progressPercent}% concluído
                          </span>
                          {totalPages > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Página {currentPage} de {totalPages}
                            </span>
                          )}
                        </div>
                        <Progress value={progressPercent} className="h-2 mt-3" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {dailyGoal > 0
                        ? <>Meta diária: <strong className="text-accent">{dailyGoal} pág/dia</strong> ({daysRemaining} dias restantes)</>
                        : "Sem meta diária definida"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setSection("stats")} className="gap-2">
                        <BookOpen className="h-4 w-4" /> Continuar leitura
                      </Button>
                      {totalPages > 0 && (
                        <Button
                          variant="outline"
                          onClick={async () => {
                            const next = Math.min(totalPages, currentPage + Math.max(1, Math.ceil(totalPages / 20)));
                            await updateProgress(selectedClass.id, next);
                            fetchRanking(selectedClass.id);
                          }}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Próximo capítulo
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => setSection("activities")} className="gap-2">
                        <ClipboardList className="h-4 w-4" /> Atividades {pendingQuestions.length > 0 && <span className="ml-1 text-[10px] bg-accent text-accent-foreground rounded-full px-1.5 py-0.5">{pendingQuestions.length}</span>}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Info squares */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <InfoSquare icon={ClipboardList} title="Atividades" value={pendingQuestions.length} subtitle="pendentes" tone="accent" onClick={() => setSection("activities")} />
                  <InfoSquare icon={Trophy} title="Ranking" value={myRank > 0 ? `#${myRank}` : "—"} subtitle="na turma" tone="accent" onClick={() => setSection("ranking")} />
                  <InfoSquare icon={Megaphone} title="Avisos" value={announcements.length} subtitle="do professor" tone="primary" onClick={() => setSection("announcements")} />
                  <InfoSquare icon={Flame} title="Sequência" value={`${streak}d`} subtitle="lendo seguidos" tone="destructive" onClick={() => setSection("stats")} />
                </div>

                {/* Pending activities */}
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Atividades pendentes
                  </h3>
                  {pendingQuestions.length === 0 ? (
                    <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhuma atividade pendente.</CardContent></Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingQuestions.slice(0, 4).map(q => (
                        <Card key={q.id} className="border-accent/30 hover:border-accent/60 transition-colors cursor-pointer" onClick={() => setActiveQuestion(q)}>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full text-accent border border-accent/40 font-semibold">Pendente</span>
                              <span className="text-[10px] text-muted-foreground">Cap. {q.chapter_number ?? "—"}</span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-3">{q.question_text}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Announcements preview */}
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <Megaphone className="h-4 w-4 text-primary" />
                    Avisos do professor
                  </h3>
                  {announcements.length === 0 ? (
                    <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso ainda.</CardContent></Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {announcements.slice(0, 2).map(a => (
                        <Card key={a.id}>
                          <CardContent className="p-4 space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(a.created_at).toLocaleString("pt-BR")}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed line-clamp-3">{a.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {section === "book" && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" /> Livro da Turma
                  </h1>
                </div>
                <Card>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
                    <div className="w-40 h-56 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <BookOpen className="h-14 w-14 text-primary/60" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{selectedClass.book_title ?? "Aguardando livro"}</h2>
                        {selectedClass.author && <p className="text-muted-foreground">{selectedClass.author}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-xs text-muted-foreground">Total de páginas</p><p className="font-semibold">{totalPages || "—"}</p></div>
                        <div><p className="text-xs text-muted-foreground">Sua página</p><p className="font-semibold">{currentPage}</p></div>
                        <div><p className="text-xs text-muted-foreground">Início</p><p className="font-semibold">{selectedClass.reading_start_date ? new Date(selectedClass.reading_start_date).toLocaleDateString("pt-BR") : "—"}</p></div>
                        <div><p className="text-xs text-muted-foreground">Prazo</p><p className="font-semibold">{deadline ? deadline.toLocaleDateString("pt-BR") : "—"}</p></div>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground">{progressPercent}% concluído</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {section === "activities" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-primary" /> Atividades
                </h1>
                {questions.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhuma atividade disponível.</CardContent></Card>
                ) : (
                  <>
                    {pendingQuestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2">Pendentes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pendingQuestions.map(q => (
                            <Card key={q.id} className="border-accent/30 hover:border-accent/60 cursor-pointer" onClick={() => setActiveQuestion(q)}>
                              <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full text-accent border border-accent/40 font-semibold">Pendente</span>
                                  <span className="text-[10px] text-muted-foreground">Cap. {q.chapter_number ?? "—"}</span>
                                </div>
                                <p className="text-sm text-foreground">{q.question_text}</p>
                                <Button size="sm" variant="outline" className="w-full mt-2"><Send className="h-3.5 w-3.5 mr-1.5" /> Responder</Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    {submittedQuestions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-2 mt-6">Respondidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {submittedQuestions.map(q => {
                            const myR = responses.find(r => r.question_id === q.id && r.user_id === user?.id);
                            return (
                              <Card key={q.id} className="border-success/30">
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full text-success border border-success/40 font-semibold">Respondida</span>
                                    <span className="text-[10px] text-muted-foreground">Cap. {q.chapter_number ?? "—"}</span>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{q.question_text}</p>
                                  {myR && <p className="text-xs text-muted-foreground italic line-clamp-3">"{myR.response_text}"</p>}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {section === "ranking" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-accent" /> Ranking da Turma
                </h1>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {classRanking.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Nenhum aluno começou a leitura ainda.</p>
                    ) : (
                      classRanking.map((r, i) => {
                        const isMe = r.user_id === user?.id;
                        return (
                          <div key={r.user_id} className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
                            <span className={`w-8 text-center text-sm font-bold ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>{i + 1}º</span>
                            <Avatar className="h-9 w-9">
                              {r.avatar_url && <AvatarImage src={r.avatar_url} alt={r.name} />}
                              <AvatarFallback>{r.name[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {r.name} {isMe && <span className="text-[10px] text-primary font-bold">(você)</span>}
                              </p>
                              <Progress value={totalPages > 0 ? (r.pages / totalPages) * 100 : 0} className="h-1 mt-1" />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{r.pages}p</span>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === "announcements" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-accent" /> Avisos
                </h1>
                {announcements.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum aviso publicado.</CardContent></Card>
                ) : (
                  announcements.map(a => (
                    <Card key={a.id}>
                      <CardContent className="p-4 space-y-2">
                        <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</p>
                        <p className="text-sm text-foreground leading-relaxed">{a.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {section === "stats" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" /> Meu Progresso
                </h1>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Atualize sua página atual</span>
                      <span className="text-sm font-normal text-muted-foreground">{currentPage}/{totalPages || "?"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progressPercent} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{progressPercent}% concluído</span>
                      {dailyGoal > 0 && <span className="text-accent font-medium">Meta: {dailyGoal} pág/dia</span>}
                    </div>
                    {deadline && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {deadline.toLocaleDateString("pt-BR")} ({daysRemaining} dias restantes)
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={updatingPage}
                        onChange={e => setUpdatingPage(e.target.value)}
                        placeholder="Página atual"
                        min={0}
                        max={totalPages}
                        className="flex-1"
                      />
                      <Button onClick={handleUpdatePage} disabled={!updatingPage}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Atualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card><CardContent className="p-4 text-center">
                    <Sparkles className="h-5 w-5 text-accent mx-auto mb-1" />
                    <p className="text-xl font-bold">{essencia}</p>
                    <p className="text-[10px] text-muted-foreground">Essência</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <Flame className="h-5 w-5 text-destructive mx-auto mb-1" />
                    <p className="text-xl font-bold">{streak}</p>
                    <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                    <p className="text-xl font-bold">{myRank > 0 ? `#${myRank}` : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Posição</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold">{submittedQuestions.length}</p>
                    <p className="text-[10px] text-muted-foreground">Atividades feitas</p>
                  </CardContent></Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Activity response dialog */}
      <Dialog open={!!activeQuestion} onOpenChange={o => !o && setActiveQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Atividade — Capítulo {activeQuestion?.chapter_number ?? "—"}
            </DialogTitle>
          </DialogHeader>
          {activeQuestion && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Pergunta</p>
                <p className="text-sm text-foreground italic">"{activeQuestion.question_text}"</p>
              </div>
              <Textarea
                rows={6}
                placeholder="Escreva sua resposta (mín. 10 caracteres)..."
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveQuestion(null)}>Cancelar</Button>
            <Button onClick={handleSubmitResponse}>
              <Send className="h-4 w-4 mr-2" /> Enviar resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EduAluno;
