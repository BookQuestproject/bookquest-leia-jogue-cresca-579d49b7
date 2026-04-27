import { useMemo, useState } from "react";
import {
  FileText, Plus, Calendar, Clock, CheckCircle2, AlertCircle,
  Lock, Unlock, Eye, Trash2, ArrowLeft, MessageSquare,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  demoActivitiesStore, useDemoActivities, isActivityClosed, activityStatusLabel,
} from "@/hooks/useDemoActivities";
import { DEMO_STUDENTS, DEMO_CLASS, type DemoActivity, type DemoActivityResponseType } from "@/data/demoData";

const responseTypeLabels: Record<DemoActivityResponseType, string> = {
  text: "Texto curto",
  multiple_choice: "Múltipla escolha",
  file: "Envio de arquivo",
  open: "Resposta aberta",
};

const statusBadgeMap = {
  active: { label: "Ativa", className: "bg-success/10 text-success" },
  closed: { label: "Encerrada", className: "bg-muted text-muted-foreground" },
  no_deadline: { label: "Sem prazo", className: "bg-primary/10 text-primary" },
};

export default function ActivitiesSection() {
  const activities = useDemoActivities();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? activities.find((a) => a.id === selectedId) : null;

  if (selected) {
    return <ActivityDetail activity={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Atividades da Turma
          </h2>
          <p className="text-xs text-muted-foreground">
            Crie tarefas, defina prazos e acompanhe respostas dos alunos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova atividade
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="p-10 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhuma atividade ainda</p>
            <p className="text-xs text-muted-foreground mb-4">
              Crie sua primeira atividade para a turma.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Criar atividade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} onOpen={() => setSelectedId(a.id)} />
          ))}
        </div>
      )}

      <CreateActivityDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ---------- Card ---------- */
function ActivityCard({ activity, onOpen }: { activity: DemoActivity; onOpen: () => void }) {
  const status = activityStatusLabel(activity);
  const badge = statusBadgeMap[status];
  const responded = activity.responses.length;
  const total = DEMO_CLASS.members_count;
  const pending = Math.max(0, total - responded);

  return (
    <Card
      onClick={onOpen}
      className="bg-card border-border hover:border-accent/50 hover:shadow-md transition-all cursor-pointer"
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{activity.title}</h3>
            {activity.chapter && (
              <p className="text-xs text-muted-foreground truncate">{activity.chapter}</p>
            )}
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Criada {formatDistanceToNow(new Date(activity.createdAt), { locale: ptBR, addSuffix: true })}
          </span>
          {activity.deadline && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Prazo: {format(new Date(activity.deadline), "dd/MM/yyyy")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-success">{responded}</p>
            <p className="text-[10px] text-muted-foreground">Respondido</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-destructive">{pending}</p>
            <p className="text-[10px] text-muted-foreground">Pendente</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Create Dialog ---------- */
function CreateActivityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapter, setChapter] = useState("");
  const [responseType, setResponseType] = useState<DemoActivityResponseType>("text");
  const [hasDeadline, setHasDeadline] = useState(true);
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const reset = () => {
    setTitle("");
    setDescription("");
    setChapter("");
    setResponseType("text");
    setHasDeadline(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Preencha título e descrição", variant: "destructive" });
      return;
    }
    demoActivitiesStore.create({
      title: title.trim(),
      description: description.trim(),
      bookTitle: DEMO_CLASS.book_title,
      chapter: chapter.trim() || undefined,
      responseType,
      deadline: hasDeadline ? new Date(deadline).toISOString() : null,
    });
    toast({
      title: "✅ Atividade publicada",
      description: "Os alunos da turma demo já podem visualizar a atividade.",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova atividade da turma</DialogTitle>
          <DialogDescription>
            Configure a tarefa que os alunos do {DEMO_CLASS.name} irão responder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="act-title">Título da atividade *</Label>
            <Input
              id="act-title"
              placeholder="Ex.: Reflexão sobre o capítulo 12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="act-desc">Instruções para os alunos *</Label>
            <Textarea
              id="act-desc"
              placeholder="Explique o que os alunos devem fazer..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="act-chapter">Capítulo relacionado (opcional)</Label>
              <Input
                id="act-chapter"
                placeholder="Ex.: Cap. 12 — O segredo"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo de resposta</Label>
              <Select value={responseType} onValueChange={(v) => setResponseType(v as DemoActivityResponseType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(responseTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Prazo de entrega</Label>
              <button
                type="button"
                onClick={() => setHasDeadline(!hasDeadline)}
                className="text-xs text-accent hover:underline"
              >
                {hasDeadline ? "Deixar sem prazo" : "Definir prazo"}
              </button>
            </div>
            {hasDeadline ? (
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Atividade sem prazo — alunos podem responder a qualquer momento.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-1" />
            Publicar atividade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Detail ---------- */
function ActivityDetail({ activity, onBack }: { activity: DemoActivity; onBack: () => void }) {
  const { toast } = useToast();
  const closed = isActivityClosed(activity);
  const status = activityStatusLabel(activity);
  const badge = statusBadgeMap[status];
  const [viewing, setViewing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const studentRows = useMemo(() => {
    const responseMap = new Map(activity.responses.map((r) => [r.studentId, r]));
    return DEMO_STUDENTS.map((s) => ({
      student: s,
      response: responseMap.get(s.id),
    }));
  }, [activity]);

  const respondedCount = activity.responses.length;
  const viewingResp = viewing ? activity.responses.find((r) => r.studentId === viewing) : null;

  const handleDelete = () => {
    if (!confirm("Excluir esta atividade? Esta ação não pode ser desfeita.")) return;
    demoActivitiesStore.remove(activity.id);
    toast({ title: "Atividade removida" });
    onBack();
  };

  const handleToggleClose = () => {
    demoActivitiesStore.toggleClosed(activity.id);
    toast({
      title: activity.closedManually ? "Atividade reaberta" : "Atividade encerrada",
      description: activity.closedManually
        ? "Os alunos podem responder novamente."
        : "Novas respostas serão bloqueadas.",
    });
  };

  const handleMarkReviewed = () => {
    if (!viewing) return;
    demoActivitiesStore.markReviewed(activity.id, viewing, feedback.trim() || undefined);
    toast({ title: "✅ Resposta marcada como revisada" });
    setViewing(null);
    setFeedback("");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para atividades
      </Button>

      {/* Top: info */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-foreground">{activity.title}</h2>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              {activity.chapter && (
                <p className="text-sm text-muted-foreground">{activity.chapter}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={handleToggleClose}>
                {activity.closedManually ? (
                  <><Unlock className="h-3.5 w-3.5 mr-1" /> Reabrir</>
                ) : (
                  <><Lock className="h-3.5 w-3.5 mr-1" /> Encerrar</>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir
              </Button>
            </div>
          </div>

          <div className="bg-muted/40 rounded-lg p-3 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Instruções</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{activity.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <InfoBlock label="Tipo" value={responseTypeLabels[activity.responseType]} />
            <InfoBlock
              label="Prazo"
              value={activity.deadline ? format(new Date(activity.deadline), "dd/MM/yyyy") : "Sem prazo"}
            />
            <InfoBlock label="Respostas" value={`${respondedCount} / ${DEMO_CLASS.members_count}`} />
            <InfoBlock
              label="Criada em"
              value={format(new Date(activity.createdAt), "dd/MM/yyyy")}
            />
          </div>

          {closed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md p-2 border border-border">
              <AlertCircle className="h-4 w-4" />
              Esta atividade está encerrada — novas respostas estão bloqueadas, mas você pode revisar todas as entregas abaixo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom: responses */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            Respostas dos alunos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {studentRows.map(({ student, response }) => (
            <div
              key={student.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback>{student.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {response ? (
                    <>
                      Enviado em {format(new Date(response.submittedAt), "dd/MM/yyyy 'às' HH:mm")}
                      {response.reviewed && (
                        <span className="ml-2 text-success font-medium">· Revisado</span>
                      )}
                    </>
                  ) : (
                    "Aguardando resposta"
                  )}
                </p>
              </div>
              {response ? (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-success/10 text-success whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3 inline mr-0.5" />
                  Respondido
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive whitespace-nowrap">
                  Pendente
                </span>
              )}
              {response && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setViewing(student.id); setFeedback(response.feedback || ""); }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resposta dialog */}
      <Dialog open={!!viewing} onOpenChange={(v) => { if (!v) { setViewing(null); setFeedback(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resposta de {viewingResp?.studentName}</DialogTitle>
            <DialogDescription>
              {viewingResp && (
                <>Enviada em {format(new Date(viewingResp.submittedAt), "dd/MM/yyyy 'às' HH:mm")}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingResp && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-3 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{viewingResp.responseText}</p>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (opcional)</Label>
                <Textarea
                  id="feedback"
                  rows={3}
                  placeholder="Escreva um comentário rápido para o aluno..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {viewingResp.reviewed && (
                <p className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Esta resposta já foi marcada como revisada.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setViewing(null); setFeedback(""); }}>
              Fechar
            </Button>
            <Button onClick={handleMarkReviewed}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar como revisada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
