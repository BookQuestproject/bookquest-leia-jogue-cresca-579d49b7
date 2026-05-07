import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { useEduEngagement } from "@/hooks/useEduEngagement";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Users, Trophy, ArrowLeft, LogOut,
  CheckCircle2, Plus, Loader2, GraduationCap, Target,
  Medal, Megaphone, HelpCircle,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
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

const EDU_TUTORIAL_KEY = "bookquest_edu_tutorial_done";

const tutorialSteps = [
  {
    title: "Bem-vindo ao BookQuest EDU! 📚",
    description: "Aqui você vai acompanhar a leitura do livro da sua turma, competir com colegas e ganhar conquistas. Vamos te mostrar como funciona!",
    icon: "🎉",
  },
  {
    title: "Trilha do Livro 📖",
    description: "Na seção 'Progresso', você atualiza a página em que está. Basta digitar o número da página atual e clicar em 'Atualizar'. O sistema calcula automaticamente quantas páginas por dia você precisa ler.",
    icon: "📖",
  },
  {
    title: "Ranking da Turma 🏆",
    description: "Na aba 'Ranking', você vê sua posição em relação aos colegas. Quanto mais você lê, mais sobe! A competição saudável motiva todo mundo.",
    icon: "🏆",
  },
  {
    title: "Desafios Semanais 🎯",
    description: "Na aba 'Desafios', o professor cria metas semanais como 'Ler 50 páginas' ou 'Terminar o livro primeiro'. Complete os desafios para ganhar medalhas!",
    icon: "🎯",
  },
  {
    title: "Conquistas e Medalhas 🏅",
    description: "Na aba 'Conquistas', você desbloqueia medalhas automaticamente ao atingir marcos: 25%, 50%, 75% e 100% do livro. Quanto mais lê, mais medalhas coleciona!",
    icon: "🏅",
  },
  {
    title: "Avisos do Professor 📢",
    description: "Fique de olho nos avisos! O professor pode enviar mensagens e dicas para toda a turma. Você encontra na aba 'Avisos'.",
    icon: "📢",
  },
  {
    title: "Tudo pronto! 🚀",
    description: "Agora é com você! Atualize seu progresso diariamente, suba no ranking e conquiste todas as medalhas. Boa leitura!",
    icon: "🚀",
  },
];

const EduAluno = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studentClasses, fetchStudentClasses } = useEduRole();
  const { progressData, fetchProgress, updateProgress } = useClassReadingProgress();
  const { toast } = useToast();

  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classRanking, setClassRanking] = useState<any[]>([]);
  const [myProgress, setMyProgress] = useState<any>(null);
  const [updatingPage, setUpdatingPage] = useState("");
  const [activeTab, setActiveTab] = useState("progress");

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Engagement
  const {
    challenges, achievements, announcements,
    fetchChallenges, fetchAchievements, fetchAnnouncements,
    checkAndAwardAchievements,
  } = useEduEngagement(selectedClass?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/edu/aluno");
    }
  }, [authLoading, user, navigate]);

  // Auto-select first class
  useEffect(() => {
    if (studentClasses.length > 0 && !selectedClass) {
      setSelectedClass(studentClasses[0] as ClassInfo);
    }
  }, [studentClasses, selectedClass]);

  // Show tutorial on first visit
  useEffect(() => {
    if (selectedClass && !localStorage.getItem(EDU_TUTORIAL_KEY)) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedClass]);

  // Fetch progress when class selected
  useEffect(() => {
    if (selectedClass?.id) {
      fetchProgress(selectedClass.id);
      fetchRanking(selectedClass.id);
    }
  }, [selectedClass?.id]);

  // Get my progress from progressData
  useEffect(() => {
    if (user && progressData.length > 0) {
      const mine = progressData.find(p => p.user_id === user.id);
      setMyProgress(mine || null);
    }
  }, [progressData, user]);

  const fetchRanking = async (classId: string) => {
    const { data: members } = await supabase
      .from('class_members')
      .select('user_id')
      .eq('class_id', classId);

    if (!members) return;

    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles_public' as any)
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);

    const { data: progress } = await supabase
      .from('class_reading_progress')
      .select('user_id, current_page')
      .eq('class_id', classId);

    const ranked = userIds.map(uid => {
      const profile = (profiles as any[])?.find(p => p.id === uid);
      const prog = (progress as any[])?.find(p => p.user_id === uid);
      return {
        user_id: uid,
        name: profile?.full_name || profile?.username || "Aluno",
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        pages: prog?.current_page || 0,
      };
    }).sort((a, b) => b.pages - a.pages);

    setClassRanking(ranked);
  };

  const handleJoinClass = async () => {
    if (!user || !joinCode.trim()) return;
    setJoining(true);

    const { data: classRow, error: findError } = await supabase
      .rpc('find_class_by_code' as any, { _code: joinCode.toUpperCase() })
      .maybeSingle();
    const classData = classRow as { id: string; name: string } | null;

    if (findError || !classData) {
      toast({ title: 'Código inválido', description: 'Nenhuma turma encontrada.', variant: 'destructive' });
      setJoining(false);
      return;
    }

    const { error: joinError } = await supabase
      .from('class_members')
      .insert({ class_id: (classData as any).id, user_id: user.id });

    if (joinError) {
      if (joinError.code === '23505') {
        toast({ title: 'Já inscrito', description: 'Você já faz parte dessa turma.' });
      } else {
        toast({ title: 'Erro', description: 'Falha ao entrar na turma.', variant: 'destructive' });
      }
      setJoining(false);
      return;
    }

    toast({ title: '🎉 Bem-vindo!', description: `Você entrou na turma "${(classData as any).name}".` });
    setJoinCode("");
    setShowJoinDialog(false);
    setJoining(false);
    await fetchStudentClasses();
  };

  const handleUpdatePage = async () => {
    if (!selectedClass || !updatingPage) return;
    const page = parseInt(updatingPage);
    if (isNaN(page) || page < 0) return;
    await updateProgress(selectedClass.id, page);
    setUpdatingPage("");
    await fetchRanking(selectedClass.id);
    // Check achievements
    await checkAndAwardAchievements(page, selectedClass.total_pages || 0);
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    localStorage.setItem(EDU_TUTORIAL_KEY, "true");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = selectedClass?.total_pages || 0;
  const currentPage = myProgress?.current_page || 0;
  const progressPercent = totalPages > 0 ? Math.min((currentPage / totalPages) * 100, 100) : 0;
  const myRankPosition = classRanking.findIndex(r => r.user_id === user?.id) + 1;

  const deadline = selectedClass?.reading_deadline ? new Date(selectedClass.reading_deadline) : null;
  const today = new Date();
  const daysRemaining = deadline ? Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const pagesRemaining = Math.max(0, totalPages - currentPage);
  const dailyGoal = daysRemaining > 0 ? Math.ceil(pagesRemaining / daysRemaining) : 0;

  const activeChallenges = challenges.filter(c => c.is_active && new Date(c.end_date) >= today);
  const myAchievements = achievements.filter(a => a.user_id === user?.id);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/edu")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
            <span className="font-bold text-foreground text-sm">BookQuest EDU</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { setTutorialStep(0); setShowTutorial(true); }} title="Ver tutorial">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowJoinDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Turma
            </Button>
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut().then(() => navigate("/edu"))}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-20">
        {/* No classes state */}
        {studentClasses.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Entre na sua primeira turma!</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Peça o código da turma ao seu professor e comece sua jornada de leitura.
            </p>
            <Button size="lg" onClick={() => setShowJoinDialog(true)}>
              <Users className="h-5 w-5 mr-2" />
              Entrar com Código
            </Button>
          </div>
        )}

        {/* Class selector */}
        {studentClasses.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {studentClasses.map((c: any) => (
              <Button
                key={c.id}
                variant={selectedClass?.id === c.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass(c as ClassInfo)}
                className="whitespace-nowrap"
              >
                {c.name}
              </Button>
            ))}
          </div>
        )}

        {selectedClass && (
          <>
            {/* Book info */}
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">{selectedClass.name}</p>
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {selectedClass.book_title || "Livro não definido"}
                    </h2>
                    {selectedClass.author && (
                      <p className="text-sm text-muted-foreground">{selectedClass.author}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2">
              <Card className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{myRankPosition > 0 ? `#${myRankPosition}` : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Posição</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{currentPage}</p>
                  <p className="text-[10px] text-muted-foreground">Páginas</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <Medal className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{myAchievements.length}</p>
                  <p className="text-[10px] text-muted-foreground">Medalhas</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 text-center">
                  <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{activeChallenges.length}</p>
                  <p className="text-[10px] text-muted-foreground">Desafios</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="progress" className="text-xs">Progresso</TabsTrigger>
                <TabsTrigger value="ranking" className="text-xs">Ranking</TabsTrigger>
                <TabsTrigger value="challenges" className="text-xs">Desafios</TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs">Medalhas</TabsTrigger>
                <TabsTrigger value="announcements" className="text-xs">Avisos</TabsTrigger>
              </TabsList>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Meu Progresso</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {currentPage}/{totalPages} páginas
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progressPercent} className="h-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{progressPercent.toFixed(0)}% concluído</span>
                      {dailyGoal > 0 && (
                        <span className="text-accent font-medium">Meta: {dailyGoal} págs/dia</span>
                      )}
                    </div>
                    {deadline && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {deadline.toLocaleDateString("pt-BR")} ({daysRemaining} dias restantes)
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Input
                        type="number"
                        value={updatingPage}
                        onChange={(e) => setUpdatingPage(e.target.value)}
                        placeholder="Página atual"
                        min={0}
                        max={totalPages}
                        className="flex-1"
                      />
                      <Button onClick={handleUpdatePage} disabled={!updatingPage}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Atualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ranking Tab */}
              <TabsContent value="ranking" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      Ranking da Turma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {classRanking.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Nenhum aluno iniciou a leitura ainda
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {classRanking.map((r, idx) => {
                          const isMe = r.user_id === user?.id;
                          const pct = totalPages > 0 ? (r.pages / totalPages) * 100 : 0;
                          return (
                            <div
                              key={r.user_id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                              }`}
                            >
                              <div className="text-lg font-bold w-8 text-center">
                                {idx === 0 && "🥇"}
                                {idx === 1 && "🥈"}
                                {idx === 2 && "🥉"}
                                {idx > 2 && <span className="text-muted-foreground text-sm">#{idx + 1}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                                  {r.name} {isMe && "(Você)"}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={pct} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {r.pages}/{totalPages}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges" className="space-y-4">
                {activeChallenges.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum desafio ativo no momento</p>
                      <p className="text-xs text-muted-foreground mt-1">O professor pode criar desafios semanais</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeChallenges.map(ch => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(ch.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                    return (
                      <Card key={ch.id} className="bg-card border-border border-l-4 border-l-accent">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-foreground">{ch.title}</h3>
                              {ch.description && (
                                <p className="text-sm text-muted-foreground mt-1">{ch.description}</p>
                              )}
                            </div>
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                              {daysLeft}d restantes
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            Meta: {ch.goal_value} páginas
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Medal className="h-5 w-5 text-accent" />
                      Minhas Conquistas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myAchievements.length === 0 ? (
                      <div className="text-center py-8">
                        <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Nenhuma conquista ainda</p>
                        <p className="text-xs text-muted-foreground mt-1">Leia para desbloquear medalhas!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {myAchievements.map(a => (
                          <div key={a.id} className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
                            <p className="text-2xl mb-1">{a.achievement_label.split(' ')[0]}</p>
                            <p className="text-xs font-medium text-foreground">
                              {a.achievement_label.split(' ').slice(1).join(' ')}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(a.awarded_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Available achievements */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Conquistas Disponíveis</p>
                      <div className="space-y-2">
                        {[
                          { type: 'first_read', label: '🌟 Primeira Leitura', desc: 'Atualize seu progresso pela primeira vez' },
                          { type: 'progress_25', label: '📖 25% do Livro', desc: 'Leia 25% do livro' },
                          { type: 'progress_50', label: '📚 Metade do Livro', desc: 'Leia 50% do livro' },
                          { type: 'progress_75', label: '🔥 75% Concluído', desc: 'Leia 75% do livro' },
                          { type: 'progress_100', label: '🏆 Livro Completo!', desc: 'Termine o livro inteiro' },
                        ].map(a => {
                          const earned = myAchievements.some(ma => ma.achievement_type === a.type);
                          return (
                            <div key={a.type} className={`flex items-center gap-3 p-2 rounded-lg ${earned ? 'bg-accent/10' : 'bg-muted/30 opacity-50'}`}>
                              <span className="text-lg">{a.label.split(' ')[0]}</span>
                              <div className="flex-1">
                                <p className={`text-xs font-medium ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {a.label.split(' ').slice(1).join(' ')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                              </div>
                              {earned && <CheckCircle2 className="h-4 w-4 text-accent" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements" className="space-y-4">
                {announcements.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="text-center py-12">
                      <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum aviso do professor</p>
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map(a => (
                    <Card key={a.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Megaphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-foreground">{a.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(a.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-accent" />
              Entrar em uma Turma
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Digite o código fornecido pelo seu professor.
            </p>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ex: A3B7K2"
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowJoinDialog(false)}>Cancelar</Button>
            <Button onClick={handleJoinClass} disabled={joinCode.trim().length < 4 || joining}>
              {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Entrar na Turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={(open) => { if (!open) dismissTutorial(); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl">{tutorialSteps[tutorialStep].icon}</span>
            <h2 className="text-lg font-bold text-foreground">{tutorialSteps[tutorialStep].title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tutorialSteps[tutorialStep].description}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-2">
              {tutorialSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === tutorialStep ? "bg-primary" : idx < tutorialStep ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="ghost" size="sm" onClick={dismissTutorial}>
              Pular
            </Button>
            <div className="flex gap-2">
              {tutorialStep > 0 && (
                <Button variant="outline" size="sm" onClick={() => setTutorialStep(s => s - 1)}>
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (tutorialStep < tutorialSteps.length - 1) {
                    setTutorialStep(s => s + 1);
                  } else {
                    dismissTutorial();
                  }
                }}
              >
                {tutorialStep < tutorialSteps.length - 1 ? "Próximo" : "Começar!"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EduAluno;
