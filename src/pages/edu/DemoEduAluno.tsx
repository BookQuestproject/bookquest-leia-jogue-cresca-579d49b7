import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Trophy, Target, Medal, Megaphone, ArrowLeft, LogOut,
  CheckCircle2, Flame, Sparkles, Lock, Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoCrown from "@/assets/logo-crown-transparent.png";
import DemoBanner from "@/components/demo/DemoBanner";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  DEMO_STUDENT, DEMO_CLASS, DEMO_STUDENTS, DEMO_LUCAS_PROGRESS,
  DEMO_CHAPTERS, DEMO_MISSIONS, DEMO_ACHIEVEMENTS_STUDENT,
  DEMO_ANNOUNCEMENTS, DEMO_CHALLENGES,
} from "@/data/demoData";
import { useToast } from "@/hooks/use-toast";

const DemoEduAluno = () => {
  const navigate = useNavigate();
  const { isDemo, endDemo } = useDemoMode();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(DEMO_LUCAS_PROGRESS.current_page);
  const [pageInput, setPageInput] = useState("");
  const [response, setResponse] = useState("");

  if (!isDemo) {
    navigate("/edu", { replace: true });
    return null;
  }

  const totalPages = DEMO_CLASS.total_pages;
  const progressPercent = Math.round((currentPage / totalPages) * 100);
  const myRank = DEMO_STUDENTS.findIndex((s) => s.id === DEMO_STUDENT.id) + 1;

  const handleUpdatePage = () => {
    const page = parseInt(pageInput);
    if (isNaN(page) || page < 0 || page > totalPages) {
      toast({ title: "Página inválida", description: `Digite um valor entre 0 e ${totalPages}.`, variant: "destructive" });
      return;
    }
    setCurrentPage(page);
    setPageInput("");
    toast({
      title: "📖 Progresso atualizado!",
      description: `Você está na página ${page}. +10 ✦ Essência (demo).`,
    });
  };

  const handleSubmitResponse = () => {
    if (response.trim().length < 10) {
      toast({ title: "Resposta muito curta", description: "Escreva pelo menos 10 caracteres.", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Resposta enviada (demo)", description: "Em produção, sua professora receberia para correção." });
    setResponse("");
  };

  const handleExit = () => {
    endDemo();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />

      {/* Header */}
      <header className="sticky top-[40px] z-30 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/edu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
            <span className="font-bold text-foreground text-sm">BookQuest EDU</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={DEMO_STUDENT.avatar} alt={DEMO_STUDENT.name} />
              <AvatarFallback>{DEMO_STUDENT.name[0]}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleExit} title="Sair do demo">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Olá, {DEMO_STUDENT.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {DEMO_CLASS.name} · {DEMO_CLASS.school}
          </p>
        </div>

        {/* Book card */}
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-[100px_1fr] gap-0">
              <div className="bg-muted/40 p-3 flex items-center justify-center">
                <img
                  src={DEMO_CLASS.book_cover}
                  alt={DEMO_CLASS.book_title}
                  className="w-20 h-28 object-cover rounded shadow-md"
                />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Livro da turma
                </p>
                <h2 className="text-base font-bold text-foreground leading-tight">
                  {DEMO_CLASS.book_title}
                </h2>
                <p className="text-xs text-muted-foreground">{DEMO_CLASS.book_author}</p>
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Seu progresso</span>
                    <span className="font-semibold text-foreground">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2">
          <StatMini icon={Trophy} value={`#${myRank}`} label="Posição" color="text-accent" />
          <StatMini icon={Sparkles} value={DEMO_STUDENT.essencia} label="Essência" color="text-primary" />
          <StatMini icon={Flame} value={DEMO_STUDENT.streak} label="Sequência" color="text-destructive" />
          <StatMini icon={Medal} value={DEMO_ACHIEVEMENTS_STUDENT.filter(a => a.earned).length} label="Medalhas" color="text-accent" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="progress">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="progress" className="text-xs">Leitura</TabsTrigger>
            <TabsTrigger value="missions" className="text-xs">Missões</TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs">Ranking</TabsTrigger>
            <TabsTrigger value="chapters" className="text-xs">Capítulos</TabsTrigger>
            <TabsTrigger value="news" className="text-xs">Avisos</TabsTrigger>
          </TabsList>

          {/* Progress / activity */}
          <TabsContent value="progress" className="space-y-4 mt-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Atualizar progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Você está na página <strong className="text-foreground">{currentPage}</strong> de {totalPages}.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Nova página"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    min={0}
                    max={totalPages}
                  />
                  <Button onClick={handleUpdatePage} disabled={!pageInput}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Responder atividade do capítulo 12</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  "O que o Pequeno Príncipe quis dizer com 'o essencial é invisível aos olhos'?
                  Comente em pelo menos 3 frases."
                </p>
                <Textarea
                  rows={4}
                  placeholder="Escreva sua resposta..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
                <Button onClick={handleSubmitResponse} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar resposta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions */}
          <TabsContent value="missions" className="space-y-3 mt-4">
            {DEMO_MISSIONS.map((m) => {
              const pct = Math.round((m.progress / m.goal) * 100);
              return (
                <Card key={m.id} className="bg-card border-border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.title}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {m.type === "daily" ? "Diária" : "Semanal"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-accent">+{m.reward} ✦</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{m.progress}/{m.goal}</p>
                  </CardContent>
                </Card>
              );
            })}
            {DEMO_CHALLENGES.map((c) => (
              <Card key={c.id} className="bg-card border-accent/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  <Progress value={(c.progress / c.goal) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{c.progress}/{c.goal} · termina {c.end_date}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-accent" />
                  Ranking da turma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DEMO_STUDENTS.map((s, i) => {
                  const isMe = s.id === DEMO_STUDENT.id;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? "bg-accent/10 border border-accent/30" : ""}`}
                    >
                      <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                        {i + 1}º
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={s.avatar} alt={s.name} />
                        <AvatarFallback>{s.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isMe ? "font-bold text-accent" : "text-foreground"}`}>
                          {s.name} {isMe && "(Você)"}
                        </p>
                        <Progress value={s.progress_percent} className="h-1 mt-0.5" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{s.current_page}p</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapters */}
          <TabsContent value="chapters" className="space-y-2 mt-4">
            {DEMO_CHAPTERS.map((ch) => (
              <Card
                key={ch.number}
                className={`bg-card border-border ${ch.status === "current" ? "border-accent/50" : ""}`}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    ch.status === "done" ? "bg-success/15 text-success" :
                    ch.status === "current" ? "bg-accent/15 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ch.status === "locked" ? <Lock className="h-4 w-4" /> : ch.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ch.title}</p>
                    <p className="text-xs text-muted-foreground">{ch.pages} páginas</p>
                  </div>
                  {ch.status === "done" && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {ch.status === "current" && (
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Modo demo", description: "A leitura do capítulo está disponível na versão completa." })}>
                      Ler
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* News */}
          <TabsContent value="news" className="space-y-3 mt-4">
            {DEMO_ANNOUNCEMENTS.map((a) => (
              <Card key={a.id} className="bg-card border-border">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Megaphone className="h-3 w-3 text-accent" />
                    {a.teacher} · {a.created_at}
                  </div>
                  <p className="text-sm text-foreground">{a.content}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Medal className="h-4 w-4 text-accent" />
                  Suas medalhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACHIEVEMENTS_STUDENT.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-lg text-center border ${
                        a.earned
                          ? "border-accent/40 bg-accent/5"
                          : "border-border bg-muted/30 opacity-50"
                      }`}
                    >
                      <div className="text-2xl">{a.icon}</div>
                      <p className="text-[10px] mt-1 text-foreground">{a.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatMini = ({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) => (
  <Card className="bg-card border-border">
    <CardContent className="p-2.5 text-center">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
      <p className="text-base font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </CardContent>
  </Card>
);

export default DemoEduAluno;
