import { useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileBarChart, Mail, RefreshCw, FileText, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string; name: string; progress: number; chapters: number; frequency: number; reflections: number;
  status: "Enviado" | "Pendente" | "Não enviado"; lastSentAt?: string;
}

const seedStudents = (): Student[] => [
  { id: "1", name: "Lucas Ferreira",    progress: 82, chapters: 9,  frequency: 6, reflections: 8, status: "Enviado",      lastSentAt: "10/05" },
  { id: "2", name: "Mariana Souza",     progress: 64, chapters: 7,  frequency: 5, reflections: 6, status: "Pendente" },
  { id: "3", name: "Pedro Alves",       progress: 41, chapters: 5,  frequency: 3, reflections: 3, status: "Não enviado" },
  { id: "4", name: "Ana Beatriz Lima",  progress: 95, chapters: 11, frequency: 7, reflections: 10, status: "Enviado",     lastSentAt: "08/05" },
  { id: "5", name: "Rafael Costa",      progress: 28, chapters: 3,  frequency: 2, reflections: 1, status: "Não enviado" },
];

const generateAnalysis = (s: Student) => {
  const eng = s.progress >= 70 ? "alto engajamento" : s.progress >= 40 ? "engajamento regular" : "engajamento ainda em desenvolvimento";
  const cons = s.frequency >= 5 ? "constância sólida ao longo da semana" : "leituras menos frequentes que poderiam evoluir";
  const part = s.reflections >= 6 ? "participação ativa nas reflexões" : "participação que ainda pode crescer";
  return `${s.name} apresenta ${eng} nesta jornada. Observamos ${cons} e ${part}. Seguimos acompanhando seu desenvolvimento com carinho — cada capítulo concluído é uma conquista relevante e contribui para o crescimento da leitura crítica e do repertório literário.`;
};

const EduRelatorios = () => {
  const { classes, loading } = useClasses();
  const active = classes.filter(c => c.is_active);
  const [classId, setClassId] = useState<string | null>(active[0]?.id ?? null);
  const [students, setStudents] = useState<Student[]>(seedStudents());
  const [open, setOpen] = useState<Student | null>(null);
  const [note, setNote] = useState("");

  const send = (s: Student) => {
    setStudents(prev => prev.map(x => x.id === s.id ? { ...x, status: "Enviado", lastSentAt: new Date().toLocaleDateString("pt-BR") } : x));
    toast.success(`Relatório de ${s.name} enviado aos responsáveis`);
    setOpen(null); setNote("");
  };

  const statusBadge = (s: Student["status"]) => {
    const map = {
      "Enviado":     "bg-[hsl(142_71%_45%/0.15)] text-[hsl(142_71%_60%)]",
      "Pendente":    "bg-accent/15 text-accent",
      "Não enviado": "bg-white/5 text-muted-foreground",
    };
    return map[s];
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileBarChart className="h-6 w-6 text-accent" />Relatórios</h1>
          <p className="text-sm text-muted-foreground">Gere relatórios pedagógicos automáticos por aluno e envie aos responsáveis.</p>
        </div>

        {/* Class selector */}
        <div className="flex flex-wrap gap-2">
          {loading && <p className="text-xs text-muted-foreground">Carregando turmas...</p>}
          {active.map(c => (
            <button key={c.id} onClick={() => setClassId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${classId === c.id ? "bg-accent text-accent-foreground border-accent" : "border-white/10 text-muted-foreground hover:bg-white/5"}`}>
              {c.name}
            </button>
          ))}
        </div>

        <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Alunos da turma</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-accent/20 transition">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent/30 to-accent/5 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                  {s.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{s.progress}% concluído</span>
                    <span>·</span>
                    <span>{s.chapters} capítulos</span>
                    <span>·</span>
                    <span>{s.frequency}/7 dias ativos</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)]" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(s.status)}`}>{s.status}</span>
                <Button size="sm" onClick={() => { setOpen(s); setNote(""); }} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1 h-8"><FileText className="h-3 w-3" />Gerar</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Report dialog */}
        <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
          <DialogContent className="max-w-2xl bg-[hsl(230_60%_8%)] border-white/10 max-h-[90vh] overflow-y-auto">
            {open && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-foreground"><FileText className="h-5 w-5 text-accent" />Relatório · {open.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "Progresso",    value: `${open.progress}%` },
                      { label: "Capítulos",    value: open.chapters },
                      { label: "Frequência",   value: `${open.frequency}/7` },
                      { label: "Reflexões",    value: open.reflections },
                    ].map((m, i) => (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold text-foreground tabular-nums">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Auto analysis */}
                  <div className="rounded-xl p-4 bg-gradient-to-br from-accent/[0.08] to-transparent border border-accent/20">
                    <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-accent" /><p className="text-xs font-bold text-accent uppercase tracking-wider">Análise pedagógica automática</p></div>
                    <p className="text-sm text-foreground leading-relaxed">{generateAnalysis(open)}</p>
                  </div>

                  {/* Teacher note */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Observação do professor (opcional)</label>
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex.: Parabéns pelo empenho desta semana..." className="bg-white/[0.03] border-white/10 mt-1" />
                  </div>

                  {/* History */}
                  {open.lastSentAt && (
                    <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />Último envio: <span className="text-foreground font-semibold">{open.lastSentAt}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-white/[0.06]">
                    {open.lastSentAt && (
                      <Button variant="outline" onClick={() => send(open)} className="border-white/10 gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Reenviar</Button>
                    )}
                    <Button onClick={() => send(open)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5">
                      <Mail className="h-3.5 w-3.5" />Enviar para responsáveis
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduRelatorios;
