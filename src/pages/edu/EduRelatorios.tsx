import { useState, useEffect } from "react";
import EduLayout from "./EduLayout";
import { useClasses, ClassMember } from "@/hooks/useClasses";
import { useClassReadingProgress } from "@/hooks/useClassReadingProgress";
import { useReports } from "@/hooks/useReports";
import { useTeacherSettings } from "@/hooks/useTeacherSettings";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileBarChart, Mail, FileText, Sparkles, CheckCircle2, Clock, Download, Loader2 } from "lucide-react";
import { downloadReportPDF } from "@/lib/edu/generateReportPDF";
import { toast } from "sonner";

interface StudentRow {
  user_id: string;
  name: string;
  current_page: number;
  total_pages: number;
  progress: number;
  is_up_to_date: boolean;
}

const buildAnalysis = (s: StudentRow) => {
  const eng = s.progress >= 70 ? "alto engajamento" : s.progress >= 40 ? "engajamento regular" : "engajamento ainda em desenvolvimento";
  const cons = s.is_up_to_date ? "constância sólida com a meta de leitura" : "leituras menos frequentes que poderiam evoluir";
  return `${s.name} apresenta ${eng} nesta jornada. Observamos ${cons}. Seguimos acompanhando seu desenvolvimento — cada capítulo concluído é uma conquista relevante e contribui para o crescimento da leitura crítica e do repertório literário.`;
};

const EduRelatorios = () => {
  const { classes, loading, fetchClassMembers } = useClasses();
  const { profile } = useProfile();
  const { settings } = useTeacherSettings();
  const active = classes.filter(c => !c.is_archived);
  const [classId, setClassId] = useState<string | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const { progressData, fetchProgress } = useClassReadingProgress();
  const { reports, upsertReport, markSent } = useReports(classId);

  const [open, setOpen] = useState<StudentRow | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!classId && active.length) setClassId(active[0].id);
  }, [active, classId]);

  useEffect(() => {
    if (classId) {
      fetchClassMembers(classId).then(setMembers);
      fetchProgress(classId);
    }
  }, [classId]);

  const classData = classes.find(c => c.id === classId);
  const totalPages = classData?.total_pages || 0;

  const students: StudentRow[] = members.map(m => {
    const p = progressData.find(x => x.user_id === m.user_id);
    const cp = p?.current_page || 0;
    return {
      user_id: m.user_id,
      name: m.profile?.full_name || "Aluno",
      current_page: cp,
      total_pages: totalPages,
      progress: totalPages > 0 ? Math.round((cp / totalPages) * 100) : 0,
      is_up_to_date: !!p?.is_up_to_date,
    };
  });

  const lastReportFor = (uid: string) => reports.find(r => r.student_user_id === uid);

  const generateAndDownload = async (s: StudentRow) => {
    const analysis = buildAnalysis(s);
    const metrics = {
      progress: s.progress,
      chapters: Math.floor(s.progress / 10),
      frequency: s.is_up_to_date ? 6 : 3,
      reflections: 0,
      current_page: s.current_page,
      total_pages: s.total_pages,
    };
    const report = await upsertReport({
      student_user_id: s.user_id,
      metrics,
      analysis_text: analysis,
      teacher_note: note,
      status: "gerado",
    });
    downloadReportPDF({
      studentName: s.name,
      className: classData?.name ?? "",
      bookTitle: classData?.book_title,
      schoolName: settings?.school_name,
      teacherName: profile?.full_name,
      periodLabel: new Date().toLocaleDateString("pt-BR"),
      metrics,
      analysisText: analysis,
      teacherNote: note,
      signature: settings?.signature,
    });
    toast.success("Relatório gerado e baixado em PDF");
    if (report) await markSent(report.id);
    setOpen(null); setNote("");
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileBarChart className="h-6 w-6 text-accent" />Relatórios</h1>
          <p className="text-sm text-muted-foreground">Gere relatórios pedagógicos automáticos por aluno e baixe em PDF.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {active.map(c => (
            <button key={c.id} onClick={() => setClassId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${classId === c.id ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {c.name}
            </button>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Alunos da turma</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {students.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Nenhum aluno nesta turma ainda.</p>
            ) : students.map(s => {
              const last = lastReportFor(s.user_id);
              return (
                <div key={s.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-accent/30 transition">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {s.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      <span>{s.progress}% concluído</span>
                      <span>·</span>
                      <span>{s.current_page}/{s.total_pages} págs</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                  {last && (
                    <span className="text-[10px] text-muted-foreground hidden md:inline">
                      Último: {new Date(last.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <Button size="sm" onClick={() => { setOpen(s); setNote(""); }} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1 h-8">
                    <FileText className="h-3 w-3" />Gerar
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {open && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-accent" />Relatório · {open.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: "Progresso", value: `${open.progress}%` },
                      { label: "Página atual", value: `${open.current_page}` },
                      { label: "Total", value: `${open.total_pages}` },
                      { label: "Status", value: open.is_up_to_date ? "Em dia" : "Atrasado" },
                    ].map((m, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted border border-border">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold text-foreground tabular-nums">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4 bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">Análise pedagógica automática</p>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{buildAnalysis(open)}</p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Observação do professor (opcional)</label>
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex.: Parabéns pelo empenho..." className="mt-1" />
                  </div>

                  {lastReportFor(open.user_id) && (
                    <div className="rounded-lg p-3 bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />Último relatório: <span className="text-foreground font-semibold">
                        {new Date(lastReportFor(open.user_id)!.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-border">
                    <Button onClick={() => generateAndDownload(open)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5">
                      <Download className="h-3.5 w-3.5" />Gerar e baixar PDF
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
