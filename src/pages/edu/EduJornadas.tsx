import { useState } from "react";
import EduLayout from "./EduLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookMarked, Plus, Copy, Edit2, Send, Search, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Journey {
  id: string; title: string; book: string; chapters: number; classes: number; progress: number;
}

const seed: Journey[] = [
  { id: "1", title: "Dom Casmurro — 9º Ano",      book: "Dom Casmurro",     chapters: 12, classes: 2, progress: 64 },
  { id: "2", title: "O Cortiço — Médio",          book: "O Cortiço",        chapters: 23, classes: 1, progress: 41 },
  { id: "3", title: "Memórias Póstumas — Pré-Vestibular", book: "Memórias Póstumas de Brás Cubas", chapters: 30, classes: 3, progress: 27 },
];

const EduJornadas = () => {
  const [list, setList] = useState<Journey[]>(seed);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ book: "", chapters: 10, questions: 0, classes: [] as string[] });

  const filtered = list.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));

  const duplicate = (j: Journey) => {
    setList([...list, { ...j, id: crypto.randomUUID(), title: `${j.title} (cópia)` }]);
    toast.success("Jornada duplicada");
  };

  const reset = () => { setStep(1); setDraft({ book: "", chapters: 10, questions: 0, classes: [] }); };
  const finish = () => {
    setList([...list, { id: crypto.randomUUID(), title: draft.book || "Nova jornada", book: draft.book, chapters: draft.chapters, classes: draft.classes.length, progress: 0 }]);
    toast.success("Jornada criada e aplicada nas turmas selecionadas");
    setCreating(false); reset();
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BookMarked className="h-6 w-6 text-accent" />Jornadas de leitura</h1>
            <p className="text-sm text-muted-foreground">Crie jornadas, associe perguntas por capítulo e aplique em várias turmas.</p>
          </div>
          <Button onClick={() => { setCreating(true); reset(); }} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"><Plus className="h-4 w-4" />Nova jornada</Button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jornada..." className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground/70" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((j) => (
            <Card key={j.id} className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl hover:border-accent/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground">{j.title}</CardTitle>
                <p className="text-[11px] text-muted-foreground">{j.book} · {j.chapters} capítulos</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progresso médio</span><span>{j.progress}%</span></div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)]" style={{ width: `${j.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{j.classes} turma{j.classes !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] border-white/10 gap-1"><Edit2 className="h-3 w-3" />Editar</Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(j)} className="flex-1 h-8 text-[11px] border-accent/30 text-accent hover:bg-accent/10 gap-1"><Copy className="h-3 w-3" />Duplicar</Button>
                  <Button size="sm" className="flex-1 h-8 text-[11px] bg-accent hover:bg-accent/90 text-accent-foreground gap-1"><Send className="h-3 w-3" />Aplicar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create wizard */}
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="max-w-xl bg-[hsl(230_60%_8%)] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <span className="text-accent">{step}/5</span> Nova jornada de leitura
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {step === 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Escolha o livro</label>
                  <Input value={draft.book} onChange={(e) => setDraft({ ...draft, book: e.target.value })} placeholder="Ex.: Dom Casmurro" />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Quantos capítulos?</label>
                  <Input type="number" value={draft.chapters} onChange={(e) => setDraft({ ...draft, chapters: +e.target.value })} />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Perguntas associadas por capítulo</label>
                  <Input type="number" value={draft.questions} onChange={(e) => setDraft({ ...draft, questions: +e.target.value })} />
                  <p className="text-[10px] text-muted-foreground">Você poderá editar depois em Perguntas de Reflexão.</p>
                </div>
              )}
              {step === 4 && (
                <div className="rounded-xl p-4 bg-accent/10 border border-accent/30 text-center">
                  <Check className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Pronto para publicar</p>
                  <p className="text-xs text-muted-foreground">{draft.book} · {draft.chapters} capítulos · {draft.questions} perguntas</p>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Aplicar em quais turmas?</label>
                  {["9º Ano A", "9º Ano B", "1º Médio A", "1º Médio B"].map((c) => {
                    const sel = draft.classes.includes(c);
                    return (
                      <button key={c} onClick={() => setDraft({ ...draft, classes: sel ? draft.classes.filter(x => x !== c) : [...draft.classes, c] })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${sel ? "border-accent bg-accent/10" : "border-white/10 hover:bg-white/5"}`}>
                        <span className="text-sm text-foreground">{c}</span>
                        {sel && <Check className="h-4 w-4 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-white/10 gap-1"><ArrowLeft className="h-3 w-3" />Voltar</Button>}
              {step < 5 ? (
                <Button onClick={() => setStep(s => s + 1)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1">Próximo<ArrowRight className="h-3 w-3" /></Button>
              ) : (
                <Button onClick={finish} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1">Publicar e aplicar<Check className="h-3 w-3" /></Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduJornadas;
