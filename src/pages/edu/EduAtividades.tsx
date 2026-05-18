import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, Plus, Send, Trash2, Users, BookOpen, Loader2, MessageSquare,
  CheckCircle2, Search, Filter, Pencil, Copy, Eye, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type DateFilter = "all" | "today" | "week" | "month";
type StatusFilter = "all" | "pending" | "reviewed" | "no_responses";

interface DraftState {
  text: string;
  chapter: string;
  classId: string;
}
const emptyDraft: DraftState = { text: "", chapter: "", classId: "" };

const EduAtividades = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, loading: loadingClasses } = useClasses();
  const activeClasses = useMemo(() => classes.filter((c) => !c.is_archived), [classes]);

  const { questions, responses, loading, fetchQuestions, createQuestion } = useClassQuestions();
  const { toast } = useToast();

  // Class scope: "all" | classId
  const [classScope, setClassScope] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Aggregate questions across all active classes
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [aggLoading, setAggLoading] = useState(false);

  useEffect(() => {
    if (activeClasses.length === 0) { setAllQuestions([]); setAllResponses([]); return; }
    setAggLoading(true);
    (async () => {
      const ids = activeClasses.map((c) => c.id);
      const { data: qs } = await supabase
        .from("class_questions")
        .select("*")
        .in("class_id", ids)
        .order("created_at", { ascending: false });
      const qList = qs ?? [];
      setAllQuestions(qList);

      const qIds = qList.map((q: any) => q.id);
      if (qIds.length) {
        const { data: rs } = await supabase
          .from("class_question_responses")
          .select("*")
          .in("question_id", qIds);
        setAllResponses(rs ?? []);
      } else {
        setAllResponses([]);
      }
      setAggLoading(false);
    })();
  }, [activeClasses, questions.length]); // refresh when local questions change

  // Dialog state
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = (presetClassId?: string) => {
    setEditing(null);
    setDraft({ ...emptyDraft, classId: presetClassId ?? (classScope !== "all" ? classScope : activeClasses[0]?.id ?? "") });
    setCreating(true);
  };

  const openEdit = (q: any) => {
    setEditing(q);
    setDraft({
      text: q.question_text,
      chapter: q.chapter_number != null ? String(q.chapter_number) : "",
      classId: q.class_id,
    });
    setCreating(true);
  };

  const openDuplicate = (q: any) => {
    setEditing(null);
    setDraft({
      text: q.question_text,
      chapter: q.chapter_number != null ? String(q.chapter_number) : "",
      classId: q.class_id,
    });
    setCreating(true);
    toast({ title: "Duplicando atividade", description: "Escolha a turma e edite se quiser." });
  };

  const reload = async () => {
    const ids = activeClasses.map((c) => c.id);
    const { data: qs } = await supabase.from("class_questions").select("*").in("class_id", ids).order("created_at", { ascending: false });
    setAllQuestions(qs ?? []);
    const qIds = (qs ?? []).map((q: any) => q.id);
    if (qIds.length) {
      const { data: rs } = await supabase.from("class_question_responses").select("*").in("question_id", qIds);
      setAllResponses(rs ?? []);
    } else setAllResponses([]);
  };

  const handleSave = async () => {
    if (!draft.text.trim() || !draft.classId || !user) return;
    setSubmitting(true);
    const chapterNum = draft.chapter ? parseInt(draft.chapter, 10) : null;

    if (editing) {
      const { error } = await supabase
        .from("class_questions")
        .update({
          question_text: draft.text.trim(),
          chapter_number: Number.isFinite(chapterNum as number) ? chapterNum : null,
          class_id: draft.classId,
        })
        .eq("id", editing.id);
      setSubmitting(false);
      if (error) { toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" }); return; }
      toast({ title: "✅ Atividade atualizada" });
    } else {
      const { error } = await supabase.from("class_questions").insert({
        class_id: draft.classId,
        created_by: user.id,
        chapter_number: Number.isFinite(chapterNum as number) ? chapterNum : null,
        question_text: draft.text.trim(),
      });
      setSubmitting(false);
      if (error) { toast({ title: "Erro", description: "Falha ao lançar.", variant: "destructive" }); return; }
      toast({ title: "🎯 Atividade lançada!", description: "Seus alunos já podem responder." });
    }
    setCreating(false);
    setDraft(emptyDraft);
    setEditing(null);
    await reload();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("class_questions").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" }); return; }
    toast({ title: "Atividade removida" });
    await reload();
  };

  // Filtering
  const filtered = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return allQuestions.filter((q) => {
      if (classScope !== "all" && q.class_id !== classScope) return false;

      const text = q.question_text.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;

      const createdAt = new Date(q.created_at).getTime();
      if (dateFilter === "today" && now - createdAt > dayMs) return false;
      if (dateFilter === "week" && now - createdAt > 7 * dayMs) return false;
      if (dateFilter === "month" && now - createdAt > 30 * dayMs) return false;

      if (statusFilter !== "all") {
        const rs = allResponses.filter((r) => r.question_id === q.id);
        const pending = rs.filter((r) => !r.reviewed_at).length;
        if (statusFilter === "pending" && pending === 0) return false;
        if (statusFilter === "reviewed" && (rs.length === 0 || pending > 0)) return false;
        if (statusFilter === "no_responses" && rs.length > 0) return false;
      }
      return true;
    });
  }, [allQuestions, allResponses, classScope, search, dateFilter, statusFilter]);

  const stats = useMemo(() => {
    const scoped = classScope === "all"
      ? allQuestions
      : allQuestions.filter((q) => q.class_id === classScope);
    const scopedIds = new Set(scoped.map((q) => q.id));
    const rs = allResponses.filter((r) => scopedIds.has(r.question_id));
    return {
      total: scoped.length,
      responses: rs.length,
      pending: rs.filter((r) => !r.reviewed_at).length,
    };
  }, [allQuestions, allResponses, classScope]);

  const classNameOf = (cid: string) => activeClasses.find((c) => c.id === cid)?.name ?? "—";
  const hasActiveFilters = search || dateFilter !== "all" || statusFilter !== "all" || classScope !== "all";

  const clearFilters = () => {
    setSearch(""); setDateFilter("all"); setStatusFilter("all"); setClassScope("all");
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
              Crie, revise, duplique e reaproveite atividades — tudo em um lugar.
            </p>
          </div>
          <Button
            onClick={() => openCreate()}
            disabled={activeClasses.length === 0}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nova atividade
          </Button>
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
              <p className="text-2xl font-bold text-foreground">{stats.responses}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Para revisar</p>
              <p className="text-2xl font-bold text-accent">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar no enunciado..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={classScope} onValueChange={setClassScope}>
              <SelectTrigger className="h-9 w-full lg:w-[180px] text-sm">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {activeClasses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="h-9 w-full lg:w-[140px] text-sm">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-9 w-full lg:w-[170px] text-sm">
                <Filter className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Com pendentes</SelectItem>
                <SelectItem value="reviewed">Tudo revisado</SelectItem>
                <SelectItem value="no_responses">Sem respostas</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs gap-1">
                <X className="h-3 w-3" /> Limpar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* List */}
        {loadingClasses || aggLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : activeClasses.length === 0 ? (
          <Card><CardContent className="text-center py-12">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Crie uma turma primeiro para lançar atividades.</p>
          </CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="text-center py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? "Nenhuma atividade corresponde aos filtros." : "Nenhuma atividade ainda."}
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => openCreate()} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
                <Plus className="h-4 w-4" /> Criar primeira atividade
              </Button>
            )}
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => {
              const qResponses = allResponses.filter((r) => r.question_id === q.id);
              const pending = qResponses.filter((r) => !r.reviewed_at).length;
              return (
                <Card key={q.id} className="bg-card border-border hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Users className="h-3 w-3" /> {classNameOf(q.class_id)}
                        </Badge>
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
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(q)} title="Editar"
                        className="h-7 w-7 text-muted-foreground hover:text-accent">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDuplicate(q)} title="Duplicar"
                        className="h-7 w-7 text-muted-foreground hover:text-accent">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)} title="Excluir"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {qResponses.length} respostas
                      </span>
                      {pending > 0 ? (
                        <span className="flex items-center gap-1 text-accent font-semibold">
                          {pending} para revisar
                        </span>
                      ) : qResponses.length > 0 ? (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" /> revisadas
                        </span>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant={pending > 0 ? "default" : "outline"}
                      onClick={() => navigate(`/edu/atividades/${q.id}`)}
                      className={pending > 0
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 text-[11px] h-7"
                        : "gap-1.5 text-[11px] h-7"}
                    >
                      <Eye className="h-3 w-3" /> Revisar respostas
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit / Duplicate dialog */}
        <Dialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) { setEditing(null); setDraft(emptyDraft); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-accent" />
                {editing ? "Editar atividade" : "Nova atividade"}
              </DialogTitle>
              <DialogDescription>
                {editing ? "Atualize o enunciado, capítulo ou mude a turma." : "Lance imediatamente para a turma escolhida."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Turma</label>
                <Select value={draft.classId} onValueChange={(v) => setDraft((d) => ({ ...d, classId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                  <SelectContent>
                    {activeClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Capítulo (opcional)</label>
                <Input
                  type="number" min={1}
                  value={draft.chapter}
                  onChange={(e) => setDraft((d) => ({ ...d, chapter: e.target.value }))}
                  placeholder="Ex.: 3"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Enunciado</label>
                <Textarea
                  rows={5}
                  value={draft.text}
                  onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  placeholder="Ex.: Analise o conflito interno do protagonista..."
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); setDraft(emptyDraft); }}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!draft.text.trim() || !draft.classId || submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
              >
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                {editing ? "Salvar alterações" : "Lançar para turma"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduAtividades;
