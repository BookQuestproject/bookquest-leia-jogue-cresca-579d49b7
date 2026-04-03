import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BookOpen, Users, Trophy, ArrowLeft, Copy, LogOut,
  ChevronRight, CheckCircle2, Plus, Loader2, GraduationCap,
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

    const { data: classData, error: findError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('access_code', joinCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

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
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = selectedClass?.total_pages || 0;
  const currentPage = myProgress?.current_page || 0;
  const progressPercent = totalPages > 0 ? Math.min((currentPage / totalPages) * 100, 100) : 0;
  const myRankPosition = classRanking.findIndex(r => r.user_id === user?.id) + 1;

  // Calculate daily reading goal
  const startDate = selectedClass?.reading_start_date ? new Date(selectedClass.reading_start_date) : null;
  const deadline = selectedClass?.reading_deadline ? new Date(selectedClass.reading_deadline) : null;
  const today = new Date();
  const daysRemaining = deadline ? Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const pagesRemaining = Math.max(0, totalPages - currentPage);
  const dailyGoal = daysRemaining > 0 ? Math.ceil(pagesRemaining / daysRemaining) : 0;

  return (
    <div className="min-h-screen bg-background">
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

        {/* Class selector (if multiple) */}
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

            {/* Progress */}
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
                  <span className="text-muted-foreground">
                    {progressPercent.toFixed(0)}% concluído
                  </span>
                  {dailyGoal > 0 && (
                    <span className="text-accent font-medium">
                      Meta: {dailyGoal} págs/dia
                    </span>
                  )}
                </div>
                {deadline && (
                  <p className="text-xs text-muted-foreground">
                    Prazo: {deadline.toLocaleDateString("pt-BR")} ({daysRemaining} dias restantes)
                  </p>
                )}

                {/* Update progress */}
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

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-accent mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">
                    {myRankPosition > 0 ? `#${myRankPosition}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Posição</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-6 w-6 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{currentPage}</p>
                  <p className="text-xs text-muted-foreground">Páginas</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{classRanking.length}</p>
                  <p className="text-xs text-muted-foreground">Colegas</p>
                </CardContent>
              </Card>
            </div>

            {/* Class Ranking */}
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
                      const progressPct = totalPages > 0 ? (r.pages / totalPages) * 100 : 0;
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
                              <Progress value={progressPct} className="h-1.5 flex-1" />
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
    </div>
  );
};

export default EduAluno;
