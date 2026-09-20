import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Trophy, Target, Megaphone, LogOut, CheckCircle2,
  Flame, Sparkles, LayoutDashboard, ClipboardList, BarChart3,
  Send, HelpCircle, Loader2, Users, Medal, TrendingUp, Clock,
  PanelLeftClose, PanelLeftOpen,
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
import EduStudentHome from "@/components/edu/EduStudentHome";
import { bookTrails, expandChapters } from "@/pages/Trilhas";
import BookQuestTrailMap from "@/components/BookQuestTrailMap";

interface ClassInfo {
  id: string;
  name: string;
  book_id: string | null;
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classRanking, setClassRanking] = useState<any[]>([]);
  const [chapterMap, setChapterMap] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [bookTheme, setBookTheme] = useState<string | undefined>(undefined);
  const [bookCoverUrl, setBookCoverUrl] = useState<string | null>(null);
  const [classChallenge, setClassChallenge] = useState<any | null>(null);
  const [studentPreferences, setStudentPreferences] = useState<any | null>(null);
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
  const totalPages = selectedClass?.total_pages || 0;

  useEffect(() => {
    if (!selectedClass?.id || !user?.id) return;
    fetchProgress(selectedClass.id);
    fetchQuestions(selectedClass.id);
    fetchRanking(selectedClass.id);

    (async () => {
      const [{ data: link }, { data: enrichment }, { data: challenge }, { data: preferences }] = await Promise.all([
        supabase.from("edu_journey_classes" as any).select("journey_id").eq("class_id", selectedClass.id).limit(1).maybeSingle(),
        selectedClass.book_id
          ? supabase.from("book_trail_enrichments" as any).select("cover_url,theme_color,chapters").eq("book_id", selectedClass.book_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("edu_class_challenges" as any).select("title,description,goal_value,challenge_type").eq("class_id", selectedClass.id).eq("is_active", true).order("end_date", { ascending: true }).limit(1).maybeSingle(),
        supabase.from("edu_student_preferences" as any).select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setStudentPreferences((preferences as any) || null);

      setBookTheme((enrichment as any)?.theme_color || undefined);
      setBookCoverUrl((enrichment as any)?.cover_url || null);
      setClassChallenge((challenge as any) || null);

      const normalTrail = selectedClass.book_id
        ? bookTrails.find((trail) => trail.id === selectedClass.book_id)
        : undefined;
      let enrichedChapters: any[] = [];
      try {
        const raw = typeof (enrichment as any)?.chapters === "string"
          ? JSON.parse((enrichment as any).chapters)
          : (enrichment as any)?.chapters;
        enrichedChapters = Array.isArray(raw) ? raw : [];
      } catch {}

      const sharedTrailChapters = enrichedChapters.length
        ? enrichedChapters.map((chapter: any, index: number) => ({
            id: chapter.id || index + 1,
            title: chapter.title || `Capítulo ${index + 1}`,
            status: index === 0 ? "current" : "locked",
            icon: chapter.icon || "📖",
            totalPages: chapter.totalPages || undefined,
          }))
        : normalTrail
          ? expandChapters(normalTrail.chapters, normalTrail.totalChapters).map((chapter: any) => ({
              id: chapter.id,
              title: chapter.title || `Capítulo ${chapter.id}`,
              status: chapter.status,
              icon: chapter.icon || "📖",
              totalPages: chapter.totalPages,
            }))
          : [];

      setBookTheme((enrichment as any)?.theme_color || normalTrail?.themeColor || undefined);
      setBookCoverUrl((enrichment as any)?.cover_url || normalTrail?.coverImage || null);

      const journeyId = (link as any)?.journey_id;
      if (journeyId) {
        const { data: chapters } = await supabase
          .from("edu_journey_chapters" as any)
          .select("chapter_number,title,start_page,end_page")
          .eq("journey_id", journeyId)
          .order("chapter_number", { ascending: true });

        if ((chapters as any[])?.length) {
          const journeyById = new Map((chapters as any[]).map((c) => [c.chapter_number, c]));
          const count = Math.max(sharedTrailChapters.length, (chapters as any[]).length);
          const pagesPerChapter = totalPages > 0 ? Math.ceil(totalPages / count) : 1;
          const merged = Array.from({ length: count }, (_, i) => {
            const id = i + 1;
            const journeyChapter = journeyById.get(id);
            const shared = sharedTrailChapters.find((chapter) => chapter.id === id);
            return {
              id,
              title: shared?.title || journeyChapter?.title || `Capítulo ${id}`,
              startPage: journeyChapter?.start_page || (i === 0 ? 1 : i * pagesPerChapter + 1),
              endPage: journeyChapter?.end_page || (totalPages ? Math.min(totalPages, (i + 1) * pagesPerChapter) : (i + 1) * pagesPerChapter),
              totalPages: journeyChapter ? Math.max(1, journeyChapter.end_page - journeyChapter.start_page + 1) : (shared?.totalPages || pagesPerChapter),
              icon: shared?.icon || "📖",
              status: "locked",
            };
          });
          setChapterMap(merged);
          return;
        }
      }

      const fallbackCount = Math.max(
        1,
        Math.min(
          25,
          Math.max(
            sharedTrailChapters.length,
            Number(normalTrail?.totalChapters || 0),
            Number(selectedClass.total_pages || 0) ? Math.ceil(Number(selectedClass.total_pages || 0) / 20) : 1,
          ),
        ),
      );
      const pagesPerChapter = totalPages > 0 ? Math.ceil(totalPages / fallbackCount) : 1;
      const baseTrail = sharedTrailChapters.length ? sharedTrailChapters : [];
      setChapterMap(Array.from({ length: fallbackCount }, (_, i) => {
        const shared = baseTrail.find((chapter: any) => chapter.id === i + 1);
        return {
          id: i + 1,
          title: shared?.title || `Capítulo ${i + 1}`,
          startPage: i === 0 ? 1 : i * pagesPerChapter + 1,
          endPage: totalPages ? Math.min(totalPages, (i + 1) * pagesPerChapter) : (i + 1) * pagesPerChapter,
          icon: shared?.icon || "📖",
          totalPages: pagesPerChapter,
          status: "locked",
        };
      }));
    })();
  }, [selectedClass?.id, user?.id, totalPages]);

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

  const myProgress = progressData.find(p => p.user_id === user?.id);
  const currentPage = myProgress?.current_page || 0;
  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const myRank = classRanking.findIndex(r => r.user_id === user?.id) + 1;
  const rankedStudents = classRanking.map((row) => ({ ...row, isMe: row.user_id === user?.id }));
  const normalizedChapters = chapterMap.map((chapter) => ({
    ...chapter,
    id: chapter.id ?? chapter.number,
    status: chapter.endPage <= currentPage
      ? "completed"
      : chapter.startPage <= Math.max(currentPage + 1, 1)
        ? "current"
        : "locked",
  }));
  const activeChapter = normalizedChapters.find((chapter) => chapter.number === selectedChapter)
    || normalizedChapters.find((chapter) => chapter.status === "current")
    || normalizedChapters[0];
  useEffect(() => {
    if (!normalizedChapters.length) return;
    const current = normalizedChapters.find((chapter) => chapter.status === "current");
    setSelectedChapter(current?.number || normalizedChapters[0].number);
  }, [currentPage, chapterMap.length]);

  const myResponseIds = useMemo(
    () => new Set(responses.filter(r => r.user_id === user?.id).map(r => r.question_id)),
    [responses, user?.id],
  );
  const pendingQuestions = questions.filter(q => !myResponseIds.has(q.id));
  const submittedQuestions = questions.filter(q => myResponseIds.has(q.id));

  const deadline = selectedClass?.reading_deadline ? new Date(selectedClass.reading_deadline) : null;
  const today = new Date();
  const daysRemaining = deadline ? Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / 86400000)) : 0;
  const deadlineGoal = daysRemaining > 0 ? Math.ceil(Math.max(0, totalPages - currentPage) / daysRemaining) : 0;
  const dailyGoal = studentPreferences?.daily_goal_pages
    ? Number(studentPreferences.daily_goal_pages)
    : deadlineGoal;

  const handleStartChapter = (chapterNumber: number) => {
    if (!selectedClass) return;
    const chapter = normalizedChapters.find((item) => item.number === chapterNumber);
    if (!chapter || chapter.status === "locked") return;

    if (selectedClass.book_id) {
      navigate(`/ler/${selectedClass.book_id}/${chapterNumber}?edu=1`);
      return;
    }

    navigate(`/edu/jornada/${selectedClass.id}?chapter=${chapterNumber}`);
  };

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
            <Button onClick={() => navigate("/edu?join=1")} className="gap-2">
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
        {/* Symbolic / expandable left rail */}
        <aside className={`hidden lg:flex flex-col border-r border-border bg-card/95 backdrop-blur-sm fixed h-screen top-0 z-20 transition-[width] duration-200 ${sidebarExpanded ? "w-[220px]" : "w-[76px]"}`}>
          <div className="h-16 border-b border-border flex items-center justify-between px-2">
            <div className={`flex items-center ${sidebarExpanded ? "gap-2 px-2" : "justify-center w-full"}`}>
              <img src={logoCrown} alt="BookQuest" className="h-9 w-9" />
              {sidebarExpanded && (
                <div className="leading-tight min-w-0">
                  <p className="font-bold text-sm truncate">BookQuest</p>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-[0.18em]">EDU · Aluno</p>
                </div>
              )}
            </div>
            {sidebarExpanded && (
              <button type="button" onClick={() => setSidebarExpanded(false)} className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Recolher navegação">
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className={`px-2 py-4 border-b border-border ${sidebarExpanded ? "px-3" : ""}`}>
            {sidebarExpanded ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={studentName} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{studentName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{selectedClass.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl bg-accent/10 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Essência</p>
                    <p className="text-sm font-bold text-accent">{essencia}</p>
                  </div>
                  <div className="rounded-xl bg-orange-500/10 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Sequência</p>
                    <p className="text-sm font-bold text-orange-500">{streak} dias</p>
                  </div>
                </div>
              </>
            ) : (
              <Avatar className="h-10 w-10 mx-auto">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={studentName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            )}
          </div>

          <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
            {NAV.map((item) => {
              const active = section === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setSection(item.id)} title={sidebarExpanded ? undefined : item.label} aria-label={item.label}
                  className={`w-full h-11 rounded-2xl flex items-center transition-all ${sidebarExpanded ? "gap-3 px-3 justify-start" : "justify-center"} ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarExpanded && <span className="text-sm font-medium truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-2 border-t border-border space-y-1">
            {sidebarExpanded && studentClasses.length > 1 && (
              <div className="px-2 py-1.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Turmas</p>
                {studentClasses.map((c: any) => (
                  <button key={c.id} onClick={() => setSelectedClass(c as ClassInfo)} className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg ${c.id === selectedClass.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setSidebarExpanded((value) => !value)} className="w-full h-10 rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={sidebarExpanded ? "Recolher navegação" : "Ampliar navegação"} title={sidebarExpanded ? "Recolher navegação" : "Ampliar navegação"}>
              {sidebarExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              {sidebarExpanded && <span className="text-xs ml-2">Modo compacto</span>}
            </button>
            <button type="button" title="Sair" aria-label="Sair" onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
              className={`h-10 rounded-2xl flex items-center text-muted-foreground hover:bg-muted hover:text-foreground w-full ${sidebarExpanded ? "gap-3 px-3 justify-start" : "justify-center"}`}>
              <LogOut className="h-4 w-4" />
              {sidebarExpanded && <span className="text-sm">Sair</span>}
            </button>
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
        <div className={`flex-1 min-h-screen transition-[margin] duration-200 ${sidebarExpanded ? "lg:ml-[220px]" : "lg:ml-[76px]"}` pt-14 lg:pt-0 pb-24 lg:pb-6">
          <main className="px-4 lg:px-8 py-6 max-w-6xl mx-auto">
            {section === "dashboard" && (
              <EduStudentHome
                studentName={studentName}
                className={selectedClass.name}
                bookTitle={selectedClass.book_title}
                author={selectedClass.author}
                bookCoverUrl={bookCoverUrl}
                themeColor={bookTheme}
                currentPage={currentPage}
                totalPages={totalPages}
                progressPercent={progressPercent}
                pendingActivities={pendingQuestions.length}
                essencia={essencia}
                streak={streak}
                rank={myRank}
                dailyPagesRead={myProgress?.pages_read_today || 0}
                dailyGoal={dailyGoal}
                daysRemaining={daysRemaining}
                routineMinutes={Number(studentPreferences?.routine_minutes || 20)}
                readingBarrier={studentPreferences?.reading_barrier || ""}
                preferredSupport={studentPreferences?.preferred_support || ""}
                chapters={normalizedChapters}
                selectedChapter={activeChapter?.number || 1}
                ranking={rankedStudents}
                onSelectChapter={(chapterNumber) => {
                  const chapter = normalizedChapters.find((item) => item.number === chapterNumber);
                  if (!chapter || chapter.status === "locked") return;
                  setSelectedChapter(chapterNumber);
                }}
                onStartChapter={handleStartChapter}
                onActivities={() => setSection("activities")}
                onStats={() => setSection("stats")}
                onAnnouncements={() => setSection("announcements")}
              />
            )}

            {section === "book" && (
              <div className="space-y-6">
                <section className="rounded-[30px] border border-border bg-card overflow-hidden shadow-sm">
                  <div
                    className="h-2"
                    style={{ background: `linear-gradient(90deg, hsl(${bookTheme || "210 55% 30%"}), hsl(45 82% 48%), hsl(274 72% 58%))` }}
                  />
                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-7 items-center">
                      <div
                        className="w-40 h-56 mx-auto rounded-2xl overflow-hidden shadow-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: `hsl(${bookTheme || "210 55% 30%"})` }}
                      >
                        {bookCoverUrl ? <img src={bookCoverUrl} alt={selectedClass.book_title || "Livro"} className="h-full w-full object-cover" /> : <BookOpen className="h-16 w-16 opacity-80" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground">Livro da turma</p>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-2">{selectedClass.book_title || "Aguardando livro"}</h1>
                        {selectedClass.author && <p className="text-base text-muted-foreground mt-2">{selectedClass.author}</p>}
                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold">Página {currentPage}{totalPages ? ` / ${totalPages}` : ""}</span>
                          <span className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold">{progressPercent}% concluído</span>
                          {deadline && <span className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold">{daysRemaining} dias restantes</span>}
                        </div>
                        <div className="mt-6">
                          <Progress value={progressPercent} className="h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-[30px] border border-border bg-card shadow-sm overflow-hidden">
                  <div className="p-6 lg:p-8 pb-3 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] font-bold text-muted-foreground">A mesma trilha do BookQuest</p>
                    <h2 className="text-2xl font-bold mt-2">Sua história, capítulo por capítulo.</h2>
                  </div>
                  <div className="overflow-x-auto px-3 sm:px-8 pb-8">
                    <div className="min-w-[540px]">
                      <BookQuestTrailMap
                        chapters={normalizedChapters as any}
                        themeColor={bookTheme || "210 55% 30%"}
                        onChapterClick={(chapter) => {
                          setSelectedChapter(chapter.id);
                          handleStartChapter(chapter.id);
                        }}
                        className="max-w-[540px]"
                        endLabel="🏁 Fim da trilha"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {section === "activities" && (
              <div className="space-y-6">
                <section className="rounded-[30px] border border-border bg-card p-6 lg:p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary">Experiências de capítulo</p>
                      <h1 className="text-3xl sm:text-4xl font-bold mt-2">Explore o que você percebeu.</h1>
                      <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Suas atividades aparecem como experiências da história — não como uma sequência de perguntas iguais.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3 text-center">
                        <p className="text-2xl font-black">{questions.length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">total</p>
                      </div>
                      <div className="rounded-2xl bg-accent/5 border border-accent/10 px-4 py-3 text-center">
                        <p className="text-2xl font-black">{pendingQuestions.length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">abertas</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 text-center">
                        <p className="text-2xl font-black">{submittedQuestions.length}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">feitas</p>
                      </div>
                    </div>
                  </div>
                </section>

                {questions.length === 0 ? (
                  <section className="min-h-[420px] rounded-[30px] border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-16 w-16 rounded-3xl bg-accent/10 text-accent flex items-center justify-center"><Sparkles className="h-7 w-7" /></div>
                    <h2 className="text-xl font-bold mt-5">Nenhuma experiência ainda.</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">Quando o professor liberar uma experiência de capítulo, ela aparecerá aqui.</p>
                  </section>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...pendingQuestions, ...submittedQuestions].map((q) => {
                      const done = myResponseIds.has(q.id);
                      const myR = responses.find((r) => r.question_id === q.id && r.user_id === user?.id);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => !done && setActiveQuestion(q)}
                          className={`group text-left rounded-[26px] border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${done ? "border-emerald-500/20" : "border-border hover:border-accent/40"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${done ? "bg-emerald-500/10 text-emerald-600" : "bg-accent/10 text-accent"}`}>
                              {done ? (myR?.reviewed_at ? "Revisada" : "Respondida") : "Disponível"}
                            </span>
                            <span className="text-xs text-muted-foreground">Cap. {q.chapter_number ?? "—"}</span>
                          </div>
                          <p className="text-lg font-bold leading-snug mt-5">{q.question_text}</p>
                          {done ? (
                            <div className="mt-5 rounded-2xl bg-muted/20 p-4">
                              <p className="text-xs text-muted-foreground italic line-clamp-3">"{myR?.response_text || "Resposta registrada"}"</p>
                              {myR?.teacher_feedback && <p className="text-xs text-primary font-semibold mt-3">Feedback do professor recebido.</p>}
                            </div>
                          ) : (
                            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-accent">
                              <Sparkles className="h-4 w-4" /> Abrir experiência
                              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {section === "ranking" && (
              <div className="space-y-6">
                <section className="rounded-[30px] border border-border bg-card p-6 lg:p-8 shadow-sm overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.18em] font-bold text-amber-500">Ranking da turma</p>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">Seu lugar na jornada.</h1>
                        <p className="text-sm text-muted-foreground mt-2">Compare o avanço de leitura da turma de forma clara e sem esconder o seu próprio progresso.</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground">Sua posição</p>
                        <p className="text-5xl font-black text-amber-500">{myRank > 0 ? `#${myRank}` : "—"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {classRanking.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {[1, 0, 2].map((rankIndex, slot) => {
                      const person = classRanking[rankIndex];
                      if (!person) return <div key={slot} className="hidden md:block" />;
                      const podium = slot === 1 ? "md:-translate-y-3" : "";
                      const tone = slot === 1 ? "border-amber-400/50 bg-amber-400/5" : slot === 0 ? "border-slate-300/40 bg-muted/20" : "border-orange-300/40 bg-orange-500/5";
                      return (
                        <div key={person.user_id} className={`rounded-[28px] border p-6 text-center shadow-sm ${podium} ${tone}`}>
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{rankIndex + 1}º lugar</div>
                          <Avatar className="h-20 w-20 mx-auto mt-4 border-4 border-background shadow-md">
                            {person.avatar_url && <AvatarImage src={person.avatar_url} alt={person.name} />}
                            <AvatarFallback className="text-xl font-bold">{person.name.slice(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <p className="text-lg font-bold mt-4">{person.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{person.pages} páginas</p>
                          <Progress value={totalPages > 0 ? Math.min(100, (person.pages / totalPages) * 100) : 0} className="h-2 mt-4" />
                        </div>
                      );
                    })}
                  </div>
                )}

                <section className="rounded-[30px] border border-border bg-card shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Classificação completa</p>
                      <p className="text-sm text-muted-foreground mt-1">{classRanking.length} participante{classRanking.length === 1 ? "" : "s"}</p>
                    </div>
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="divide-y divide-border">
                    {classRanking.length === 0 ? (
                      <div className="p-12 text-center text-sm text-muted-foreground">Ainda não há dados de leitura para mostrar.</div>
                    ) : (
                      classRanking.map((person, i) => {
                        const isMe = person.user_id === user?.id;
                        return (
                          <div key={person.user_id} className={`grid grid-cols-[42px_48px_1fr_auto] items-center gap-3 px-5 py-4 ${isMe ? "bg-primary/[0.05]" : ""}`}>
                            <span className={`text-center font-black ${i < 3 ? "text-amber-500" : "text-muted-foreground"}`}>{i + 1}</span>
                            <Avatar className="h-11 w-11">
                              {person.avatar_url && <AvatarImage src={person.avatar_url} alt={person.name} />}
                              <AvatarFallback>{person.name.slice(0,1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">{person.name}</p>
                                {isMe && <span className="text-[9px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold uppercase">você</span>}
                              </div>
                              <Progress value={totalPages > 0 ? Math.min(100, (person.pages / totalPages) * 100) : 0} className="h-1.5 mt-2" />
                            </div>
                            <span className="font-bold text-sm">{person.pages}p</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>
            )}

            {section === "announcements" && (
              <div className="space-y-6">
                <section className="rounded-[30px] border border-border bg-card p-6 lg:p-8 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] font-bold text-accent">Comunicação da turma</p>
                  <h1 className="text-3xl sm:text-4xl font-bold mt-2">O que está acontecendo?</h1>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Recados, combinados e sinais importantes ficam organizados aqui para você voltar quando precisar.</p>
                </section>

                {announcements.length === 0 ? (
                  <section className="min-h-[420px] rounded-[30px] border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center text-center p-8">
                    <Megaphone className="h-14 w-14 text-muted-foreground/50" />
                    <h2 className="text-xl font-bold mt-5">Tudo tranquilo por aqui.</h2>
                    <p className="text-sm text-muted-foreground mt-2">Novos avisos da turma aparecerão nesta linha do tempo.</p>
                  </section>
                ) : (
                  <section className="rounded-[30px] border border-border bg-card shadow-sm p-6 lg:p-8">
                    <div className="relative max-w-3xl mx-auto">
                      <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
                      <div className="space-y-7">
                        {announcements.map((a, index) => (
                          <article key={a.id} className="relative flex gap-5">
                            <div className={`relative z-10 h-8 w-8 rounded-full border-4 border-card flex items-center justify-center shrink-0 ${index === 0 ? "bg-accent" : "bg-muted-foreground/40"}`}>
                              {index === 0 && <Sparkles className="h-3.5 w-3.5 text-white" />}
                            </div>
                            <div className="flex-1 rounded-2xl border border-border bg-muted/15 p-5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                                {index === 0 && <span className="text-[10px] rounded-full bg-accent/10 text-accent px-2 py-1 font-bold">Novo</span>}
                              </div>
                              <p className="text-base leading-relaxed mt-3">{a.content}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {section === "stats" && (
              <div className="space-y-6">
                <section className="rounded-[30px] border border-border bg-card p-6 lg:p-8 shadow-sm overflow-hidden relative">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                  <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary">Seu progresso</p>
                      <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-2">{progressPercent}%</h1>
                      <p className="text-lg font-semibold mt-2">{currentPage} de {totalPages || "?"} páginas lidas</p>
                      <p className="text-sm text-muted-foreground mt-2">{deadline ? `${daysRemaining} dias restantes até o prazo.` : "Continue registrando seu avanço para acompanhar o ritmo."}</p>
                      <Progress value={progressPercent} className="h-4 mt-6 max-w-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-3xl border border-border bg-muted/15 p-5">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <p className="text-3xl font-black mt-4">{essencia}</p>
                        <p className="text-xs text-muted-foreground mt-1">Essência</p>
                      </div>
                      <div className="rounded-3xl border border-border bg-muted/15 p-5">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <p className="text-3xl font-black mt-4">{streak}</p>
                        <p className="text-xs text-muted-foreground mt-1">dias de sequência</p>
                      </div>
                      <div className="rounded-3xl border border-border bg-muted/15 p-5">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <p className="text-3xl font-black mt-4">{myRank > 0 ? `#${myRank}` : "—"}</p>
                        <p className="text-xs text-muted-foreground mt-1">na turma</p>
                      </div>
                      <div className="rounded-3xl border border-border bg-muted/15 p-5">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <p className="text-3xl font-black mt-4">{submittedQuestions.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">experiências feitas</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-[30px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground">Meta de hoje</p>
                    <div className="flex items-end justify-between gap-3 mt-3">
                      <div>
                        <p className="text-4xl font-black">{dailyPagesRead}</p>
                        <p className="text-sm text-muted-foreground mt-1">páginas lidas</p>
                      </div>
                      <p className="text-sm font-bold text-accent">{dailyGoal > 0 ? `${dailyGoal} pág.` : "sem meta"}</p>
                    </div>
                    <Progress value={dailyGoal > 0 ? Math.min(100, (dailyPagesRead / dailyGoal) * 100) : 0} className="h-3 mt-6" />
                  </div>

                  <div className="rounded-[30px] border border-border bg-card p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground">Registrar página</p>
                    <div className="flex items-center gap-3 mt-4">
                      <Input type="number" value={updatingPage} onChange={e => setUpdatingPage(e.target.value)} placeholder={String(currentPage)} min={0} max={totalPages} className="h-12 text-lg" />
                      <Button onClick={handleUpdatePage} disabled={!updatingPage} className="h-12 px-5">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Salvar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Use isso quando você estiver lendo fora da sessão guiada.</p>
                  </div>
                </section>

                <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground">Evolução da sequência</p>
                      <h2 className="text-xl font-bold mt-1">O fogo muda com você.</h2>
                    </div>
                    <p className="text-sm font-semibold text-accent">{streak} dias de sequência</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
                    {[
                      ["2", "Laranja", "hsl(24 90% 52%)"],
                      ["5", "Vermelho", "hsl(4 78% 52%)"],
                      ["10", "Azul", "hsl(198 85% 52%)"],
                      ["20", "Verde", "hsl(150 62% 44%)"],
                      ["30", "Roxo", "hsl(274 72% 58%)"],
                      ["∞", "Continuidade", "hsl(45 82% 48%)"],
                    ].map(([days, label, color]) => (
                      <div key={days} className="rounded-2xl border border-border p-4 text-center" style={{ backgroundColor: `${color}08` }}>
                        <Flame className="h-5 w-5 mx-auto" style={{ color }} />
                        <p className="text-lg font-black mt-2">{days}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </section>
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
