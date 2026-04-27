import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useClassDiscussions } from "@/hooks/useClassDiscussions";
import { useClassQuestions } from "@/hooks/useClassQuestions";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { useEduEngagement } from "@/hooks/useEduEngagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Users, BookOpen, Calendar, Copy, Send, HelpCircle,
  BarChart3, Trophy, Target, Megaphone, Medal, Trash2, TrendingUp,
  UserCheck, Clock, Flame,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const EduTurmaDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { classes, loading, fetchClassMembers } = useClasses();
  const { discussions, loading: loadingDiscussions, fetchDiscussions, createDiscussion } = useClassDiscussions();
  const { questions, responses, loading: loadingQuestions, fetchQuestions, createQuestion, createResponse } = useClassQuestions();
  const { progressData, fetchProgress } = useClassReadingProgress();
  const {
    challenges, achievements, announcements,
    createChallenge, deleteChallenge, createAnnouncement,
  } = useEduEngagement(classId);

  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [discussionText, setDiscussionText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    challenge_type: "pages",
    goal_value: "50",
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const classData = classes.find(c => c.id === classId);

  useEffect(() => {
    if (classId) {
      fetchClassMembers(classId).then(setMembers);
      fetchDiscussions(classId);
      fetchQuestions(classId);
      fetchProgress(classId);
    }
  }, [classId]);

  if (loading) {
    return (
      <EduLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </EduLayout>
    );
  }

  if (!classData) {
    return (
      <EduLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Turma não encontrada</p>
          <Button onClick={() => navigate("/edu/turmas")}>Voltar</Button>
        </div>
      </EduLayout>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(classData.access_code);
    toast({ title: "Código copiado!", description: classData.access_code });
  };

  const totalPages = classData.total_pages || 0;
  const startDate = classData.reading_start_date ? new Date(classData.reading_start_date) : null;
  const deadline = classData.reading_deadline ? new Date(classData.reading_deadline) : null;
  const daysTotal = startDate && deadline ? Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const pagesPerDay = daysTotal > 0 ? Math.ceil(totalPages / daysTotal) : 0;

  const rankedMembers = members
    .map(m => {
      const progress = progressData.find(p => p.user_id === m.user_id);
      return { ...m, xp: progress?.current_page || 0 };
    })
    .sort((a, b) => b.xp - a.xp);

  const chapterDiscussions = discussions.filter(d => d.chapter_number === selectedChapter);
  const chapterQuestions = questions.filter(q => q.chapter_number === selectedChapter);

  // Pilot Metrics
  const studentsStarted = progressData.filter(p => p.current_page > 0).length;
  const studentsFinished = progressData.filter(p => totalPages > 0 && p.current_page >= totalPages).length;
  const avgPages = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + p.current_page, 0) / progressData.length)
    : 0;
  const pctStarted = members.length > 0 ? Math.round((studentsStarted / members.length) * 100) : 0;
  const pctFinished = members.length > 0 ? Math.round((studentsFinished / members.length) * 100) : 0;
  const studentsUpToDate = progressData.filter(p => p.is_up_to_date).length;
  const studentsLate = members.length - studentsUpToDate;
  const topReader = rankedMembers[0];

  const handlePostDiscussion = async () => {
    if (!discussionText.trim() || !classId) return;
    await createDiscussion(classId, selectedChapter, discussionText, `Capítulo ${selectedChapter}`);
    setDiscussionText("");
  };

  const handleCreateQuestion = async () => {
    if (!questionText.trim() || !classId) return;
    await createQuestion(classId, questionText, selectedChapter);
    setQuestionText("");
    setShowQuestionDialog(false);
  };

  const handlePostResponse = async (questionId: string) => {
    const text = responseTexts[questionId];
    if (!text?.trim()) return;
    await createResponse(questionId, text);
    setResponseTexts({ ...responseTexts, [questionId]: "" });
  };

  const handleCreateChallenge = async () => {
    if (!challengeForm.title.trim()) return;
    await createChallenge({
      title: challengeForm.title,
      description: challengeForm.description || undefined,
      challenge_type: challengeForm.challenge_type,
      goal_value: parseInt(challengeForm.goal_value) || 50,
      start_date: new Date().toISOString().split("T")[0],
      end_date: challengeForm.end_date,
    });
    setChallengeForm({ title: "", description: "", challenge_type: "pages", goal_value: "50", end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] });
    setShowChallengeDialog(false);
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) return;
    await createAnnouncement(announcementText);
    setAnnouncementText("");
    setShowAnnouncementDialog(false);
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/edu/turmas")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{classData.name}</h1>
            {classData.grade && <p className="text-sm text-muted-foreground">{classData.grade}</p>}
          </div>
          <button onClick={copyCode} className="flex items-center gap-2 text-sm font-mono bg-accent/10 text-accent px-3 py-2 rounded-lg hover:bg-accent/20 transition-colors">
            <Copy className="h-4 w-4" />
            {classData.access_code}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Alunos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xl font-bold">{pctStarted}%</p>
                <p className="text-xs text-muted-foreground">Iniciaram</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xl font-bold">{pctFinished}%</p>
                <p className="text-xs text-muted-foreground">Finalizaram</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{avgPages}</p>
                <p className="text-xs text-muted-foreground">Páginas/média</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {pagesPerDay > 0 && (
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <p className="text-sm font-medium">
                📖 Meta de leitura: <span className="text-accent font-bold">{pagesPerDay} páginas/dia</span>
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 text-xs">
            <TabsTrigger value="overview">Geral</TabsTrigger>
            <TabsTrigger value="books">Livros</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="challenges">Desafios</TabsTrigger>
            <TabsTrigger value="announcements">Avisos</TabsTrigger>
            <TabsTrigger value="discussions">Discussões</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          {/* Books */}
          <TabsContent value="books" className="space-y-4">
            <ClassBooksManager classData={classData} />
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progresso Individual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum aluno iniciou a leitura ainda
                  </p>
                ) : (
                  progressData.map((p) => {
                    const member = members.find(m => m.user_id === p.user_id);
                    const progress = totalPages > 0 ? (p.current_page / totalPages) * 100 : 0;
                    return (
                      <div key={p.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{member?.profile?.full_name || "Aluno"}</span>
                          <span className="text-muted-foreground">{p.current_page}/{totalPages}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pilot Metrics */}
          <TabsContent value="metrics" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Métricas do Piloto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <UserCheck className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{members.length}</p>
                    <p className="text-xs text-muted-foreground">Alunos inscritos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-center">
                    <BookOpen className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{studentsStarted}</p>
                    <p className="text-xs text-muted-foreground">Começaram a ler</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-center">
                    <Trophy className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{studentsFinished}</p>
                    <p className="text-xs text-muted-foreground">Terminaram o livro</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted text-center">
                    <Medal className="h-6 w-6 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
                    <p className="text-xs text-muted-foreground">Conquistas desbloqueadas</p>
                  </div>
                </div>

                {/* Engagement bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">Taxa de Engajamento</span>
                    <span className="text-accent font-bold">{pctStarted}%</span>
                  </div>
                  <Progress value={pctStarted} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {studentsStarted} de {members.length} alunos iniciaram a leitura
                  </p>
                </div>

                {/* Status breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Status dos Alunos</h4>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-primary/10 text-center">
                      <p className="text-lg font-bold text-primary">{studentsUpToDate}</p>
                      <p className="text-[10px] text-muted-foreground">Em dia</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-destructive/10 text-center">
                      <p className="text-lg font-bold text-destructive">{studentsLate}</p>
                      <p className="text-[10px] text-muted-foreground">Atrasados</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-accent/10 text-center">
                      <p className="text-lg font-bold text-accent">{studentsFinished}</p>
                      <p className="text-[10px] text-muted-foreground">Finalizados</p>
                    </div>
                  </div>
                </div>

                {topReader && topReader.xp > 0 && (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Flame className="h-4 w-4 text-accent" />
                      Aluno mais engajado
                    </p>
                    <p className="text-lg font-bold text-accent mt-1">
                      {topReader.profile?.full_name || "Aluno"} — {topReader.xp} páginas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Desafios da Turma</h2>
              <Button size="sm" onClick={() => setShowChallengeDialog(true)}>
                <Target className="h-4 w-4 mr-2" />
                Novo Desafio
              </Button>
            </div>
            {challenges.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum desafio criado</p>
                  <p className="text-xs text-muted-foreground mt-1">Crie desafios semanais para motivar os alunos</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map(ch => (
                <Card key={ch.id} className={`bg-card border-border ${ch.is_active ? 'border-l-4 border-l-accent' : 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{ch.title}</h3>
                        {ch.description && <p className="text-sm text-muted-foreground mt-1">{ch.description}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Meta: {ch.goal_value} páginas</span>
                          <span>Até: {new Date(ch.end_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteChallenge(ch.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Avisos para Turma</h2>
              <Button size="sm" onClick={() => setShowAnnouncementDialog(true)}>
                <Megaphone className="h-4 w-4 mr-2" />
                Novo Aviso
              </Button>
            </div>
            {announcements.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-12">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum aviso enviado</p>
                </CardContent>
              </Card>
            ) : (
              announcements.map(a => (
                <Card key={a.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <p className="text-sm text-foreground">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(a.created_at).toLocaleString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Discussions */}
          <TabsContent value="discussions" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Discussões por Capítulo</CardTitle>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map((ch) => (
                    <Button key={ch} size="sm" variant={selectedChapter === ch ? "default" : "outline"} onClick={() => setSelectedChapter(ch)}>
                      Cap. {ch}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea value={discussionText} onChange={(e) => setDiscussionText(e.target.value)} placeholder={`Compartilhe ideias sobre o Capítulo ${selectedChapter}...`} rows={3} />
                  <Button onClick={handlePostDiscussion} size="sm"><Send className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-3">
                  {loadingDiscussions ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : chapterDiscussions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhuma discussão ainda</p>
                  ) : (
                    chapterDiscussions.map((d) => (
                      <Card key={d.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-1">Professor</p>
                          <p className="text-sm text-muted-foreground">{d.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">{new Date(d.created_at).toLocaleString("pt-BR")}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions */}
          <TabsContent value="questions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Perguntas do Professor</h2>
              <Button onClick={() => setShowQuestionDialog(true)} size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Nova Pergunta
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((ch) => (
                <Button key={ch} size="sm" variant={selectedChapter === ch ? "default" : "outline"} onClick={() => setSelectedChapter(ch)}>
                  Cap. {ch}
                </Button>
              ))}
            </div>
            <div className="space-y-4">
              {loadingQuestions ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : chapterQuestions.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma pergunta para este capítulo</p>
                  </CardContent>
                </Card>
              ) : (
                chapterQuestions.map((q) => {
                  const qResponses = responses.filter(r => r.question_id === q.id);
                  return (
                    <Card key={q.id} className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-base">{q.question_text}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {qResponses.map((r) => (
                          <div key={r.id} className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Aluno</p>
                            <p className="text-sm text-muted-foreground">{r.response_text}</p>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <Input value={responseTexts[q.id] || ""} onChange={(e) => setResponseTexts({ ...responseTexts, [q.id]: e.target.value })} placeholder="Sua resposta..." />
                          <Button onClick={() => handlePostResponse(q.id)} size="sm"><Send className="h-4 w-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Ranking de Leitura
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rankedMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum aluno na turma ainda</p>
                ) : (
                  <div className="space-y-3">
                    {rankedMembers.map((m, idx) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                          {idx === 0 && "🥇"}
                          {idx === 1 && "🥈"}
                          {idx === 2 && "🥉"}
                          {idx > 2 && `#${idx + 1}`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{m.profile?.full_name || "Aluno"}</p>
                          <p className="text-sm text-muted-foreground">{m.xp} páginas lidas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Question Dialog */}
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Pergunta - Capítulo {selectedChapter}</DialogTitle>
            </DialogHeader>
            <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Digite sua pergunta..." rows={4} />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowQuestionDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateQuestion}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Challenge Dialog */}
        <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Criar Desafio
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Título do desafio</label>
                <Input
                  value={challengeForm.title}
                  onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  placeholder="Ex: Maratona de Leitura"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                <Textarea
                  value={challengeForm.description}
                  onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                  placeholder="Descreva o desafio..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Meta (páginas)</label>
                  <Input
                    type="number"
                    value={challengeForm.goal_value}
                    onChange={(e) => setChallengeForm({ ...challengeForm, goal_value: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Prazo</label>
                  <Input
                    type="date"
                    value={challengeForm.end_date}
                    onChange={(e) => setChallengeForm({ ...challengeForm, end_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowChallengeDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateChallenge} disabled={!challengeForm.title.trim()}>Criar Desafio</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Announcement Dialog */}
        <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Enviar Aviso
              </DialogTitle>
            </DialogHeader>
            <Textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Escreva seu aviso para a turma..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAnnouncementDialog(false)}>Cancelar</Button>
              <Button onClick={handleSendAnnouncement} disabled={!announcementText.trim()}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduTurmaDetail;
