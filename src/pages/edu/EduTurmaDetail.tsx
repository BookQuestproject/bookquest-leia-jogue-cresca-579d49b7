import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useClasses, ClassData, ClassMember } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Copy, Users, BookOpen, Calendar, Trophy, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EduTurmaDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { classes, loading: classesLoading, fetchClassMembers } = useClasses();
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberProgress, setMemberProgress] = useState<Record<string, { xp: number; chapters: number }>>({});

  const classData = classes.find((c) => c.id === classId);

  useEffect(() => {
    if (!classId) return;
    const load = async () => {
      setLoadingMembers(true);
      const m = await fetchClassMembers(classId);
      setMembers(m);

      // Fetch reading progress for each member
      if (m.length > 0 && classData?.book_id) {
        const userIds = m.map((x) => x.user_id);
        const { data: progressData } = await supabase
          .from("reading_progress")
          .select("user_id, is_completed, elapsed_time")
          .eq("book_id", classData.book_id)
          .in("user_id", userIds);

        const progressMap: Record<string, { xp: number; chapters: number }> = {};
        (progressData ?? []).forEach((p: any) => {
          if (!progressMap[p.user_id]) progressMap[p.user_id] = { xp: 0, chapters: 0 };
          if (p.is_completed) {
            progressMap[p.user_id].chapters += 1;
            progressMap[p.user_id].xp += 10;
          }
        });
        setMemberProgress(progressMap);
      }
      setLoadingMembers(false);
    };
    load();
  }, [classId, classData?.book_id]);

  if (classesLoading) {
    return (
      <EduLayout>
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </EduLayout>
    );
  }

  if (!classData) {
    return (
      <EduLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Turma não encontrada.</p>
          <Button variant="outline" onClick={() => navigate("/edu/turmas")} className="mt-3">
            Voltar
          </Button>
        </div>
      </EduLayout>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(classData.access_code);
    toast({ title: "Código copiado!", description: classData.access_code });
  };

  // Sort members by XP for ranking
  const rankedMembers = [...members].sort((a, b) => {
    const aXp = memberProgress[a.user_id]?.xp ?? 0;
    const bXp = memberProgress[b.user_id]?.xp ?? 0;
    return bXp - aXp;
  });

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/edu/turmas")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{classData.name}</h1>
            <p className="text-sm text-muted-foreground">{classData.grade}</p>
          </div>
          <button onClick={copyCode} className="flex items-center gap-1.5 text-sm font-mono bg-accent/10 text-accent px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
            <Copy className="h-3.5 w-3.5" />
            {classData.access_code}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-foreground">{members.length}</p>
                <p className="text-xs text-muted-foreground">Alunos</p>
              </div>
            </CardContent>
          </Card>
          {classData.book_title && (
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-foreground truncate">{classData.book_title}</p>
                  <p className="text-xs text-muted-foreground">Livro</p>
                </div>
              </CardContent>
            </Card>
          )}
          {classData.reading_deadline && (
            <Card className="bg-card border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(classData.reading_deadline).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Prazo</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ranking */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Ranking da Turma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <p className="text-sm text-muted-foreground">Carregando alunos...</p>
            ) : rankedMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Nenhum aluno inscrito ainda.</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Compartilhe o código <strong className="text-accent">{classData.access_code}</strong> com seus alunos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankedMembers.map((m, idx) => {
                  const prog = memberProgress[m.user_id];
                  const xp = prog?.xp ?? 0;
                  const chapters = prog?.chapters ?? 0;
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;

                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        idx < 3 ? "bg-accent/5 border border-accent/10" : "bg-muted/30"
                      }`}
                    >
                      <span className="text-lg w-8 text-center font-bold">{medal}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {m.profile?.full_name || m.profile?.email || "Aluno"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chapters} capítulo{chapters !== 1 ? "s" : ""} lido{chapters !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-accent">{xp} ✦</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EduLayout>
  );
};

export default EduTurmaDetail;
