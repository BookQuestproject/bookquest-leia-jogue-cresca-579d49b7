import { useEffect, useMemo, useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useClassQuestions } from "@/hooks/useClassQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, Plus, Send, Trash2, Users, BookOpen, Loader2, MessageSquare, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EduAtividades = () => {
  const { classes, loading: loadingClasses } = useClasses();
  const activeClasses = classes.filter((c) => !c.is_archived);
  const [classId, setClassId] = useState<string | null>(null);

  const { questions, responses, loading, fetchQuestions, createQuestion } = useClassQuestions();
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [text, setText] = useState("");
  const [chapter, setChapter] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!classId && activeClasses.length) setClassId(activeClasses[0].id);
  }, [activeClasses, classId]);

  useEffect(() => {
    if (classId) fetchQuestions(classId);
  }, [classId, fetchQuestions]);

  const selectedClass = activeClasses.find((c) => c.id === classId);

  const stats = useMemo(() => {
    const total = questions.length;
    const totalResponses = responses.length;
    const pendingReview = responses.filter((r) => !r.reviewed_at).length;
    return { total, totalResponses, pendingReview };
  }, [questions, responses]);

  const handleCreate = async () => {
    if (!classId || !text.trim()) return;
    setSubmitting(true);
    const ch = chapter ? parseInt(chapter, 10) : undefined;
    const result = await createQuestion(classId, text.trim(), Number.isFinite(ch as number) ? ch : undefined);
    setSubmitting(false);
    if (result) {
      setText("");
      setChapter("");
      setCreating(false);
      toast({ title: "🎯 Atividade lançada!", description: "Seus alunos já podem responder." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!classId) return;
    const { error } = await supabase.from("class_questions").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
      return;
    }
    toast({ title: "Atividade removida" });
    fetchQuestions(classId);
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-accent" /> Atividades
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie atividades e lance diretamente para a turma — eles aparecem para os alunos no painel deles.
            </p>
          </div>
          <Button
            onClick={() => setCreating(true)}
            disabled={!classId}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nova atividade
          </Button>
        </div>

        {loadingClasses ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeClasses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Crie uma turma primeiro para lançar atividades.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Class selector */}
            <div className="flex flex-wrap gap-2">
              {activeClasses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setClassId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    classId === c.id
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Users className="inline h-3 w-3 mr-1" />
                  {c.name}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Atividades</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Respostas</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalResponses}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Para revisar</p>
                  <p className="text-2xl font-bold text-accent">{stats.pendingReview}</p>
                </CardContent>
              </Card>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : questions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-12">
                  <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade lançada para <strong>{selectedClass?.name}</strong>.
                  </p>
                  <Button
                    onClick={() => setCreating(true)}
                    className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Criar primeira atividade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => {
                  const qResponses = responses.filter((r) => r.question_id === q.id);
                  const pending = qResponses.filter((r) => !r.reviewed_at).length;
                  return (
                    <Card key={q.id} className="bg-card border-border hover:border-accent/40 transition-colors">
                      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {q.chapter_number != null && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <BookOpen className="h-3 w-3" /> Cap. {q.chapter_number}
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(q.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <CardTitle className="text-sm font-medium text-foreground leading-snug">
                            {q.question_text}
                          </CardTitle>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(q.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {qResponses.length} respostas
                          </span>
                          {pending > 0 && (
                            <span className="flex items-center gap-1 text-accent font-semibold">
                              {pending} para revisar
                            </span>
                          )}
                          {pending === 0 && qResponses.length > 0 && (
                            <span className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="h-3 w-3" /> revisadas
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Create dialog */}
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-accent" /> Nova atividade
              </DialogTitle>
              <DialogDescription>
                Lançar para <strong className="text-foreground">{selectedClass?.name}</strong>. A atividade aparece imediatamente para os alunos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Capítulo (opcional)</label>
                <Input
                  type="number"
                  min={1}
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Ex.: 3"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Se preencher, a atividade aparece após o aluno terminar esse capítulo.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Enunciado</label>
                <Textarea
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ex.: Analise o conflito interno do protagonista e relacione com um evento atual."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!text.trim() || submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Lançar para turma
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduAtividades;
