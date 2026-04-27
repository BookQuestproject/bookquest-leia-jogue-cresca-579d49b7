import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Trophy, Target, Medal, Megaphone, LogOut, CheckCircle2,
  Flame, Sparkles, Lock, Send, LayoutDashboard, ScrollText, ClipboardList,
  BarChart3, Bell, Clock, ChevronRight, TrendingUp, Calendar, Award,
  PlayCircle, BookMarked, Star, HelpCircle, Compass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import logoCrown from "@/assets/logo-crown-transparent.png";
import DemoBanner from "@/components/demo/DemoBanner";
import ReadingPrepGuide from "@/components/demo/ReadingPrepGuide";
import DemoReadingMode from "@/components/demo/DemoReadingMode";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useDemoReadingPrep } from "@/hooks/useDemoReadingPrep";
import {
  DEMO_STUDENT, DEMO_CLASS, DEMO_STUDENTS, DEMO_LUCAS_PROGRESS,
  DEMO_CHAPTERS, DEMO_MISSIONS, DEMO_ACHIEVEMENTS_STUDENT,
  DEMO_ANNOUNCEMENTS, DEMO_CHALLENGES,
} from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";

type Section =
  | "dashboard" | "book" | "trail" | "activities" | "ranking"
  | "missions" | "achievements" | "stats" | "guide";

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "book", label: "Livro da Turma", icon: BookOpen },
  { id: "trail", label: "Trilha Literária", icon: ScrollText },
  { id: "activities", label: "Atividades", icon: ClipboardList },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "missions", label: "Missões", icon: Target },
  { id: "achievements", label: "Conquistas", icon: Medal },
  { id: "stats", label: "Progresso", icon: BarChart3 },
  { id: "guide", label: "Guia de Leitura", icon: Compass },
];

// Atividades pendentes simuladas
const PENDING_ACTIVITIES = [
  {
    id: "act1",
    title: "Reflexão do capítulo 12",
    chapter: 12,
    deadline: "Amanhã, 23:59",
    prompt: "O que o Pequeno Príncipe quis dizer com 'o essencial é invisível aos olhos'? Comente em pelo menos 3 frases.",
    status: "pending" as const,
  },
  {
    id: "act2",
    title: "Resposta — A Raposa",
    chapter: 10,
    deadline: "Sex, 18:00",
    prompt: "Qual a importância do laço criado entre o Principezinho e a Raposa?",
    status: "pending" as const,
  },
];

const SUBMITTED_ACTIVITIES = [
  { id: "s1", title: "Reflexão do capítulo 9", chapter: 9, submitted: "Há 2 dias", grade: "Excelente" },
  { id: "s2", title: "Resposta — Os Baobás", chapter: 5, submitted: "Há 1 semana", grade: "Muito bom" },
  { id: "s3", title: "Reflexão capítulo 1", chapter: 1, submitted: "Há 2 semanas", grade: "Bom" },
];

const DemoEduAluno = () => {
  const navigate = useNavigate();
  const { isDemo, endDemo } = useDemoMode();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("dashboard");
  const [currentPage, setCurrentPage] = useState(DEMO_LUCAS_PROGRESS.current_page);
  const [pageInput, setPageInput] = useState("");
  const [activeActivity, setActiveActivity] = useState<typeof PENDING_ACTIVITIES[0] | null>(null);
  const [response, setResponse] = useState("");
  const [readingChapter, setReadingChapter] = useState<typeof DEMO_CHAPTERS[0] | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const prep = useDemoReadingPrep();
  const [forceShowGuide, setForceShowGuide] = useState(false);

  if (!isDemo) {
    navigate("/edu", { replace: true });
    return null;
  }

  // Gate inicial obrigatório: Guia de Preparação no primeiro acesso
  const showGuide = forceShowGuide || (!prep.completed && section !== "guide");
  if (showGuide) {
    return (
      <ReadingPrepGuide
        onFinish={() => { setForceShowGuide(false); setSection("dashboard"); }}
        onClose={forceShowGuide ? () => setForceShowGuide(false) : undefined}
        reviewMode={forceShowGuide}
      />
    );
  }

  // Modo leitura com cronômetro + palavras difíceis
  if (readingChapter) {
    return (
      <DemoReadingMode
        bookTitle={DEMO_CLASS.book_title}
        chapterNumber={readingChapter.number}
        chapterTitle={readingChapter.title}
        pages={readingChapter.pages}
        onExit={() => setReadingChapter(null)}
        onComplete={(ess) => {
          toast({ title: `🎉 +${ess} ✦ Essência`, description: "Capítulo concluído no demo." });
          setReadingChapter(null);
        }}
      />
    );
  }

  const totalPages = DEMO_CLASS.total_pages;
  const progressPercent = Math.round((currentPage / totalPages) * 100);
  const myRank = DEMO_STUDENTS.findIndex((s) => s.id === DEMO_STUDENT.id) + 1;
  const earnedMedals = DEMO_ACHIEVEMENTS_STUDENT.filter(a => a.earned).length;
  const currentChapter = DEMO_CHAPTERS.find(c => c.status === "current");
  const lastDoneChapter = [...DEMO_CHAPTERS].reverse().find(c => c.status === "done");

  // Estatísticas extras
  const weeklyMinutes = 184;
  const weeklyGoal = 240;
  const weeklyPct = Math.round((weeklyMinutes / weeklyGoal) * 100);

  const handleUpdatePage = () => {
    const page = parseInt(pageInput);
    if (isNaN(page) || page < 0 || page > totalPages) {
      toast({ title: "Página inválida", description: `Digite um valor entre 0 e ${totalPages}.`, variant: "destructive" });
      return;
    }
    setCurrentPage(page);
    setPageInput("");
    toast({ title: "📖 Progresso atualizado!", description: `Você está na página ${page}. +10 ✦ Essência (demo).` });
  };

  const handleSubmitResponse = () => {
    if (response.trim().length < 10) {
      toast({ title: "Resposta muito curta", description: "Escreva pelo menos 10 caracteres.", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Resposta enviada (demo)", description: "Em produção, sua professora receberia para correção." });
    setResponse("");
    setActiveActivity(null);
  };

  const handleExit = () => {
    endDemo();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />

      <div className="flex">
        {/* ===== Sidebar Esquerda ===== */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card fixed h-[calc(100vh-40px)] top-[40px] z-20">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-bold text-foreground text-sm">BookQuest</div>
              <div className="text-[10px] font-semibold text-accent uppercase tracking-wider">EDU · Aluno</div>
            </div>
          </div>

          {/* Perfil compacto */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={DEMO_STUDENT.avatar} alt={DEMO_STUDENT.name} />
                <AvatarFallback>{DEMO_STUDENT.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{DEMO_STUDENT.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{DEMO_CLASS.name}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="rounded-md bg-primary/5 py-1.5">
                <p className="text-[9px] uppercase text-muted-foreground">Nível</p>
                <p className="text-sm font-bold text-primary">{DEMO_STUDENT.level}</p>
              </div>
              <div className="rounded-md bg-accent/10 py-1.5">
                <p className="text-[9px] uppercase text-muted-foreground">✦</p>
                <p className="text-sm font-bold text-accent">{DEMO_STUDENT.essencia}</p>
              </div>
              <div className="rounded-md bg-destructive/5 py-1.5">
                <p className="text-[9px] uppercase text-muted-foreground">🔥</p>
                <p className="text-sm font-bold text-destructive">{DEMO_STUDENT.streak}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV.map((item) => {
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
              onClick={handleExit}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair do demo
            </Button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-[40px] left-0 right-0 z-20 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoCrown} alt="" className="h-7 w-7" />
            <span className="font-bold text-foreground text-sm">BookQuest EDU</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile bottom nav (compactada) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-1.5 overflow-x-auto">
          {NAV.slice(0, 5).map((item) => {
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

        {/* ===== Conteúdo principal + painel direito ===== */}
        <div className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0 pb-20 lg:pb-0">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
            {/* Área central */}
            <main className="px-4 lg:px-8 py-6 max-w-5xl w-full mx-auto xl:mx-0">
              {section === "dashboard" && (
                <DashboardSection
                  studentName={DEMO_STUDENT.name}
                  className_={DEMO_CLASS.name}
                  school={DEMO_CLASS.school}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  progressPercent={progressPercent}
                  myRank={myRank}
                  earnedMedals={earnedMedals}
                  currentChapter={currentChapter}
                  lastDoneChapter={lastDoneChapter}
                  weeklyMinutes={weeklyMinutes}
                  weeklyGoal={weeklyGoal}
                  weeklyPct={weeklyPct}
                  onGo={setSection}
                  onContinueChapter={() => toast({ title: "Modo demo", description: "A leitura completa está disponível na versão final." })}
                />
              )}

              {section === "book" && <BookSection />}
              {section === "trail" && <TrailSection onContinue={() => toast({ title: "Modo demo", description: "A leitura completa está disponível na versão final." })} />}

              {section === "activities" && (
                <ActivitiesSection
                  onOpen={(a) => setActiveActivity(a)}
                />
              )}

              {section === "ranking" && <RankingSection />}

              {section === "missions" && <MissionsSection />}

              {section === "achievements" && <AchievementsSection />}

              {section === "stats" && (
                <StatsSection
                  currentPage={currentPage}
                  totalPages={totalPages}
                  progressPercent={progressPercent}
                  pageInput={pageInput}
                  setPageInput={setPageInput}
                  onUpdate={handleUpdatePage}
                  weeklyMinutes={weeklyMinutes}
                  weeklyGoal={weeklyGoal}
                />
              )}
            </main>

            {/* Painel direito */}
            <aside className="hidden xl:block border-l border-border bg-muted/20 px-5 py-6 space-y-5 sticky top-[40px] h-[calc(100vh-40px)] overflow-y-auto">
              <RightPanel
                onOpenActivity={(a) => setActiveActivity(a)}
                onGo={setSection}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* Dialog de resposta de atividade */}
      <Dialog open={!!activeActivity} onOpenChange={(o) => !o && setActiveActivity(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {activeActivity?.title}
            </DialogTitle>
          </DialogHeader>
          {activeActivity && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Entregar até <strong className="text-foreground">{activeActivity.deadline}</strong>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Pergunta</p>
                <p className="text-sm text-foreground italic">"{activeActivity.prompt}"</p>
              </div>
              <Textarea
                rows={6}
                placeholder="Escreva sua resposta..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveActivity(null)}>Cancelar</Button>
            <Button onClick={handleSubmitResponse}>
              <Send className="h-4 w-4 mr-2" />
              Enviar resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* =================== Sub-seções =================== */

const DashboardSection = ({
  studentName, className_, school, currentPage, totalPages, progressPercent,
  myRank, earnedMedals, currentChapter, lastDoneChapter, weeklyMinutes, weeklyGoal,
  weeklyPct, onGo, onContinueChapter,
}: any) => (
  <div className="space-y-6">
    {/* Saudação */}
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
        Olá, {studentName.split(" ")[0]}! 👋
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {className_} · {school}
      </p>
    </div>

    {/* Quick stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard icon={Trophy} value={`#${myRank}`} label="Posição" tone="accent" />
      <StatCard icon={Sparkles} value={DEMO_STUDENT.essencia} label="Essência" tone="primary" />
      <StatCard icon={Flame} value={`${DEMO_STUDENT.streak} dias`} label="Sequência" tone="destructive" />
      <StatCard icon={Medal} value={earnedMedals} label="Medalhas" tone="accent" />
    </div>

    {/* TRILHA LITERÁRIA — destaque principal */}
    <Card className="border-2 border-primary/20 overflow-hidden bg-gradient-to-br from-primary/5 via-card to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Trilha Literária</p>
            <CardTitle className="text-xl mt-1">{DEMO_CLASS.book_title}</CardTitle>
            <p className="text-sm text-muted-foreground">{DEMO_CLASS.book_author}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {progressPercent}% concluído
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Trilha visual */}
        <div className="relative">
          <div className="flex items-stretch gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
            {DEMO_CHAPTERS.map((ch) => {
              const tone =
                ch.status === "done" ? "bg-success/15 border-success/40 text-success" :
                ch.status === "current" ? "bg-accent/20 border-accent text-accent ring-2 ring-accent/30" :
                "bg-muted border-border text-muted-foreground";
              return (
                <div
                  key={ch.number}
                  className={`flex-shrink-0 w-20 h-24 rounded-xl border-2 ${tone} flex flex-col items-center justify-center gap-1 snap-start transition-transform hover:scale-105`}
                  title={ch.title}
                >
                  {ch.status === "locked" ? (
                    <Lock className="h-4 w-4" />
                  ) : ch.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <PlayCircle className="h-5 w-5" />
                  )}
                  <span className="text-[11px] font-bold">Cap. {ch.number}</span>
                  <span className="text-[9px] opacity-70">{ch.pages}p</span>
                </div>
              );
            })}
          </div>
        </div>

        <Progress value={progressPercent} className="h-2" />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">
            Página <strong className="text-foreground">{currentPage}</strong> de {totalPages}
          </div>
          <Button onClick={onContinueChapter} className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Continuar capítulo {currentChapter?.number ?? "—"}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Cards complementares */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <BookMarked className="h-4 w-4" />
            Último capítulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold text-foreground">Cap. {lastDoneChapter?.number}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{lastDoneChapter?.title}</p>
          <Badge variant="outline" className="mt-2 text-success border-success/40">Concluído</Badge>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            Próxima atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold text-foreground">{PENDING_ACTIVITIES[0].title}</p>
          <p className="text-xs text-muted-foreground">Prazo: {PENDING_ACTIVITIES[0].deadline}</p>
          <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => onGo("activities")}>
            Ver atividades
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Meta semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-foreground">{weeklyMinutes}min</span>
            <span className="text-xs text-muted-foreground">de {weeklyGoal}min</span>
          </div>
          <Progress value={weeklyPct} className="h-1.5 mt-2" />
          <p className="text-[11px] text-muted-foreground mt-1">{weeklyPct}% da meta</p>
        </CardContent>
      </Card>
    </div>

    {/* Recomendação */}
    <Card className="bg-gradient-to-r from-accent/10 via-card to-primary/5 border-accent/30">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Star className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-accent font-bold">Recomendação para você</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Releia o capítulo da Raposa antes da próxima discussão em sala
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vai te ajudar a responder a reflexão pendente do capítulo 12.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onGo("trail")} className="hidden md:inline-flex">
          Ver trilha
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  </div>
);

const BookSection = () => (
  <div className="space-y-6">
    <SectionHeader title="Livro da Turma" subtitle="Tudo sobre a obra que vocês estão lendo" icon={BookOpen} />
    <Card>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
        <img src={DEMO_CLASS.book_cover} alt={DEMO_CLASS.book_title} className="w-40 h-56 object-cover rounded-lg shadow-lg mx-auto" />
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{DEMO_CLASS.book_title}</h2>
            <p className="text-muted-foreground">{DEMO_CLASS.book_author}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Total de páginas" value={`${DEMO_CLASS.total_pages}`} />
            <Info label="Capítulos" value={`${DEMO_CLASS.total_chapters}`} />
            <Info label="Início" value={DEMO_CLASS.reading_start_date} />
            <Info label="Prazo final" value={DEMO_CLASS.reading_deadline} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            Uma das obras mais lidas do mundo, "O Pequeno Príncipe" é uma fábula sobre amizade,
            amor e o sentido da vida — perfeita para discutir em turma.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const TrailSection = ({ onContinue }: { onContinue: () => void }) => (
  <div className="space-y-4">
    <SectionHeader title="Trilha Literária" subtitle="Capítulos do livro da turma" icon={ScrollText} />
    <div className="grid gap-2">
      {DEMO_CHAPTERS.map((ch) => (
        <Card key={ch.number} className={ch.status === "current" ? "border-accent/50" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              ch.status === "done" ? "bg-success/15 text-success" :
              ch.status === "current" ? "bg-accent/15 text-accent" :
              "bg-muted text-muted-foreground"
            }`}>
              {ch.status === "locked" ? <Lock className="h-5 w-5" /> : ch.number}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{ch.title}</p>
              <p className="text-xs text-muted-foreground">{ch.pages} páginas</p>
            </div>
            {ch.status === "done" && <Badge variant="outline" className="text-success border-success/40">Concluído</Badge>}
            {ch.status === "current" && <Button size="sm" onClick={onContinue}>Continuar</Button>}
            {ch.status === "locked" && <span className="text-xs text-muted-foreground">Bloqueado</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const ActivitiesSection = ({ onOpen }: { onOpen: (a: typeof PENDING_ACTIVITIES[0]) => void }) => (
  <div className="space-y-6">
    <SectionHeader title="Atividades do Professor" subtitle="Responda às propostas e veja o histórico" icon={ClipboardList} />

    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-accent" />
        Pendentes ({PENDING_ACTIVITIES.length})
      </h3>
      <div className="space-y-2">
        {PENDING_ACTIVITIES.map((a) => (
          <Card key={a.id} className="border-accent/30">
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.prompt}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {a.deadline}
                </div>
              </div>
              <Button onClick={() => onOpen(a)}>
                <Send className="h-4 w-4 mr-2" />
                Responder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" />
        Histórico
      </h3>
      <div className="space-y-2">
        {SUBMITTED_ACTIVITIES.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">Enviada {a.submitted}</p>
              </div>
              <Badge variant="outline" className="text-success border-success/40">{a.grade}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const RankingSection = () => (
  <div className="space-y-4">
    <SectionHeader title="Ranking da Turma" subtitle="Quem está liderando a leitura" icon={Trophy} />
    <Card>
      <CardContent className="p-3 space-y-1">
        {DEMO_STUDENTS.map((s, i) => {
          const isMe = s.id === DEMO_STUDENT.id;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${isMe ? "bg-accent/10 border border-accent/30" : "hover:bg-muted/40"}`}
            >
              <span className={`w-7 text-center text-sm font-bold ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>
                {i + 1}º
              </span>
              <Avatar className="h-9 w-9">
                <AvatarImage src={s.avatar} alt={s.name} />
                <AvatarFallback>{s.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${isMe ? "font-bold text-accent" : "text-foreground"}`}>
                  {s.name} {isMe && "(Você)"}
                </p>
                <Progress value={s.progress_percent} className="h-1 mt-1" />
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-foreground">{s.current_page}p</p>
                <p className="text-[10px] text-muted-foreground">{s.progress_percent}%</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </div>
);

const MissionsSection = () => (
  <div className="space-y-4">
    <SectionHeader title="Missões e Sequências" subtitle="Complete missões diárias e ganhe Essência" icon={Target} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {DEMO_MISSIONS.map((m) => {
        const pct = Math.round((m.progress / m.goal) * 100);
        return (
          <Card key={m.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {m.type === "daily" ? "Diária" : "Semanal"}
                  </p>
                </div>
                <span className="text-xs font-bold text-accent whitespace-nowrap">+{m.reward} ✦</span>
              </div>
              <Progress value={pct} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{m.progress}/{m.goal}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
    <h3 className="text-sm font-semibold text-foreground mt-6">Desafios</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {DEMO_CHALLENGES.map((c) => (
        <Card key={c.id} className="border-accent/30">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.description}</p>
            <Progress value={(c.progress / c.goal) * 100} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{c.progress}/{c.goal} · termina {c.end_date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const AchievementsSection = () => (
  <div className="space-y-4">
    <SectionHeader title="Medalhas e Conquistas" subtitle="Suas vitórias na jornada literária" icon={Award} />
    <Card>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DEMO_ACHIEVEMENTS_STUDENT.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl text-center border-2 transition ${
                a.earned
                  ? "border-accent/40 bg-accent/5"
                  : "border-border bg-muted/30 opacity-50"
              }`}
            >
              <div className="text-4xl">{a.icon}</div>
              <p className="text-xs mt-2 text-foreground font-medium">{a.label}</p>
              {a.earned && <Badge variant="outline" className="mt-2 text-[10px] text-accent border-accent/40">Desbloqueada</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const StatsSection = ({ currentPage, totalPages, progressPercent, pageInput, setPageInput, onUpdate, weeklyMinutes, weeklyGoal }: any) => (
  <div className="space-y-6">
    <SectionHeader title="Progresso e Estatísticas" subtitle="Acompanhe seu desempenho de leitura" icon={BarChart3} />

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard icon={BookOpen} value={`${currentPage}/${totalPages}`} label="Páginas" tone="primary" />
      <StatCard icon={Flame} value={`${DEMO_STUDENT.streak} dias`} label="Streak" tone="destructive" />
      <StatCard icon={Clock} value={`${weeklyMinutes}min`} label="Esta semana" tone="primary" />
      <StatCard icon={Calendar} value={`${Math.round((weeklyMinutes/weeklyGoal)*100)}%`} label="Meta semanal" tone="accent" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atualizar página atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Você está na página <strong className="text-foreground">{currentPage}</strong> de {totalPages} ({progressPercent}%)
        </p>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Nova página"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            min={0}
            max={totalPages}
          />
          <Button onClick={onUpdate} disabled={!pageInput}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resumo recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <SummaryRow label="Páginas lidas hoje" value="8" />
        <SummaryRow label="Capítulos esta semana" value="3" />
        <SummaryRow label="Tempo médio por sessão" value="22 min" />
        <SummaryRow label="Melhor dia" value="Quinta — 35 min" />
      </CardContent>
    </Card>
  </div>
);

/* =================== Painel Direito =================== */

const RightPanel = ({ onOpenActivity, onGo }: { onOpenActivity: (a: typeof PENDING_ACTIVITIES[0]) => void; onGo: (s: Section) => void }) => (
  <>
    {/* Avisos */}
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Megaphone className="h-3.5 w-3.5" />
        Avisos do Professor
      </h3>
      <div className="space-y-2">
        {DEMO_ANNOUNCEMENTS.map((a) => (
          <Card key={a.id} className="bg-card">
            <CardContent className="p-3 space-y-1">
              <p className="text-[11px] text-muted-foreground">{a.teacher} · {a.created_at}</p>
              <p className="text-xs text-foreground leading-snug">{a.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Atividades pendentes */}
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <ClipboardList className="h-3.5 w-3.5" />
        Pendentes
      </h3>
      <div className="space-y-2">
        {PENDING_ACTIVITIES.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpenActivity(a)}
            className="w-full text-left rounded-lg border border-border bg-card p-3 hover:border-accent/40 hover:bg-accent/5 transition"
          >
            <p className="text-xs font-semibold text-foreground line-clamp-1">{a.title}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" /> {a.deadline}
            </p>
            <p className="text-[11px] text-accent font-medium mt-1.5">Responder agora →</p>
          </button>
        ))}
      </div>
    </div>

    {/* Próximas tarefas/prazos */}
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5" />
        Próximos prazos
      </h3>
      <Card className="bg-card">
        <CardContent className="p-3 space-y-2.5 text-xs">
          <DeadlineRow label="Discussão cap. 10–12" date="Amanhã" />
          <DeadlineRow label="Reflexão capítulo 12" date="Amanhã, 23:59" />
          <DeadlineRow label="Maratona da semana" date="Domingo" />
          <DeadlineRow label="Fim da leitura" date="15/05" highlight />
        </CardContent>
      </Card>
    </div>

    {/* Últimas conquistas */}
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Medal className="h-3.5 w-3.5" />
        Conquistas recentes
      </h3>
      <Card className="bg-card">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACHIEVEMENTS_STUDENT.filter(a => a.earned).slice(-3).map((a) => (
              <div key={a.id} className="text-center p-2 rounded-lg bg-accent/5 border border-accent/20">
                <div className="text-2xl">{a.icon}</div>
                <p className="text-[10px] mt-1 text-foreground line-clamp-1">{a.label}</p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-8" onClick={() => onGo("achievements")}>
            Ver todas
          </Button>
        </CardContent>
      </Card>
    </div>
  </>
);

/* =================== Helpers =================== */

const StatCard = ({ icon: Icon, value, label, tone }: { icon: any; value: string | number; label: string; tone: "primary" | "accent" | "destructive" }) => {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    destructive: "text-destructive bg-destructive/10",
  };
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-foreground leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) => (
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

const DeadlineRow = ({ label, date, highlight }: { label: string; date: string; highlight?: boolean }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-foreground line-clamp-1">{label}</span>
    <span className={`text-[11px] font-semibold whitespace-nowrap ${highlight ? "text-destructive" : "text-muted-foreground"}`}>{date}</span>
  </div>
);

export default DemoEduAluno;
