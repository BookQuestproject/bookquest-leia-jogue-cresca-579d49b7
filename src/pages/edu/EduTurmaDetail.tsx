import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useClassDiscussions } from "@/hooks/useClassDiscussions";
import { useClassQuestions } from "@/hooks/useClassQuestions";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, BookOpen, Calendar, Copy, Send, HelpCircle, BarChart3, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EduTurmaDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { classes, loading, fetchClassMembers } = useClasses();
  const { discussions, loading: loadingDiscussions, fetchDiscussions, createDiscussion } = useClassDiscussions();
  const { questions, responses, loading: loadingQuestions, fetchQuestions, createQuestion, createResponse } = useClassQuestions();
  const { progressData, fetchProgress } = useClassReadingProgress();

  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [discussionText, setDiscussionText] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

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
            {classData.description && <p className="text-sm text-muted-foreground mt-1">{classData.description}</p>}
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 text-sm font-mono bg-accent/10 text-accent px-3 py-2 rounded-lg hover:bg-accent/20 transition-colors"
          >
            <Copy className="h-4 w-4" />
            {classData.access_code}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Alunos</p>
              </div>
            </CardContent>
          </Card>
          {classData.book_title && (
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-semibold truncate">{classData.book_title}</p>
                  <p className="text-xs text-muted-foreground">{totalPages} páginas</p>
                </div>
              </CardContent>
            </Card>
          )}
          {classData.reading_deadline && (
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-semibold">{new Date(classData.reading_deadline).toLocaleDateString("pt-BR")}</p>
                  <p className="text-xs text-muted-foreground">Prazo final</p>
                </div>
              </CardContent>
            </Card>
          )}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="discussions">Discussões</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progresso da Turma
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
                          <span>{member?.profile?.full_name || "Aluno"}</span>
                          <span className="text-muted-foreground">
                            {p.current_page}/{totalPages} páginas
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Discussões por Capítulo</CardTitle>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map((ch) => (
                    <Button
                      key={ch}
                      size="sm"
                      variant={selectedChapter === ch ? "default" : "outline"}
                      onClick={() => setSelectedChapter(ch)}
                    >
                      Cap. {ch}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    value={discussionText}
                    onChange={(e) => setDiscussionText(e.target.value)}
                    placeholder={`Compartilhe suas ideias sobre o Capítulo ${selectedChapter}...`}
                    rows={3}
                  />
                  <Button onClick={handlePostDiscussion} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {loadingDiscussions ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : chapterDiscussions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma discussão ainda. Seja o primeiro!
                    </p>
                  ) : (
                    chapterDiscussions.map((d) => (
                      <Card key={d.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-1">Professor</p>
                          <p className="text-sm text-muted-foreground">{d.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(d.created_at).toLocaleString("pt-BR")}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                <Button
                  key={ch}
                  size="sm"
                  variant={selectedChapter === ch ? "default" : "outline"}
                  onClick={() => setSelectedChapter(ch)}
                >
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
                          <Input
                            value={responseTexts[q.id] || ""}
                            onChange={(e) =>
                              setResponseTexts({ ...responseTexts, [q.id]: e.target.value })
                            }
                            placeholder="Sua resposta..."
                          />
                          <Button onClick={() => handlePostResponse(q.id)} size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

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
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum aluno na turma ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {rankedMembers.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                          {idx === 0 && "🥇"}
                          {idx === 1 && "🥈"}
                          {idx === 2 && "🥉"}
                          {idx > 2 && `#${idx + 1}`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{m.profile?.full_name || "Aluno"}</p>
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

        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Criar Pergunta - Capítulo {selectedChapter}</DialogTitle>
            </DialogHeader>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Digite sua pergunta..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowQuestionDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuestion}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduTurmaDetail;
