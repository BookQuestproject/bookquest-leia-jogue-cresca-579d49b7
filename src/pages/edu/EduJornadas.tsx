import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EduLayout from "./EduLayout";
import { useJourneys } from "@/hooks/useJourneys";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookMarked, Plus, Copy, Trash2, Send, Search, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const EduJornadas = () => {
  const navigate = useNavigate();
  const { journeys, links, loading, create, remove, duplicate, assignToClasses } = useJourneys();
  const { classes } = useClasses();
  const activeClasses = classes.filter(c => !c.is_archived);

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ title: "", book_title: "", author: "", total_chapters: 10, description: "", classIds: [] as string[] });

  const filtered = useMemo(
    () => journeys.filter(j => (j.title + " " + (j.book_title ?? "")).toLowerCase().includes(search.toLowerCase())),
    [journeys, search]
  );

  const reset = () => { setStep(1); setDraft({ title: "", book_title: "", author: "", total_chapters: 10, description: "", classIds: [] }); };

  const finish = async () => {
    await create({
      title: draft.title || draft.book_title || "Nova jornada",
      book_title: draft.book_title || null,
      author: draft.author || null,
      total_chapters: draft.total_chapters,
      description: draft.description || null,
      classIds: draft.classIds,
    });
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
          <Button onClick={() => { setCreating(true); reset(); }} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5">
            <Plus className="h-4 w-4" />Nova jornada
          </Button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar jornada..." className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="text-center py-12">
            <BookMarked className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma jornada criada ainda.</p>
            <Button onClick={() => { setCreating(true); reset(); }} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
              <Plus className="h-4 w-4" /> Criar primeira jornada
            </Button>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((j) => {
              const linkedCount = links.filter(l => l.journey_id === j.id).length;
              return (
                <Card key={j.id} className="bg-card border-border hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-foreground">{j.title}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">{j.book_title ?? "Sem livro"} · {j.total_chapters} capítulos</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {j.description && <p className="text-xs text-muted-foreground line-clamp-2">{j.description}</p>}
                    <div className="text-[11px] text-muted-foreground">
                      Aplicada em <span className="font-semibold text-foreground">{linkedCount}</span> turma{linkedCount !== 1 ? "s" : ""}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/edu/jornadas/${j.id}/capitulos`)} className="flex-1 h-8 text-[11px] gap-1"><BookMarked className="h-3 w-3" />Capítulos</Button>
                      <Button size="sm" variant="outline" onClick={() => duplicate(j)} className="h-8 text-[11px] gap-1"><Copy className="h-3 w-3" />Duplicar</Button>
                      <Button size="sm" variant="outline" onClick={() => remove(j.id)} className="h-8 text-[11px] gap-1 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Wizard */}
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-accent">{step}/4</span> Nova jornada de leitura
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Título da jornada</label>
                    <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex.: Dom Casmurro — 9º Ano" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Livro</label>
                    <Input value={draft.book_title} onChange={(e) => setDraft({ ...draft, book_title: e.target.value })} placeholder="Ex.: Dom Casmurro" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Autor</label>
                    <Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} placeholder="Ex.: Machado de Assis" />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Quantos capítulos?</label>
                  <Input type="number" min={1} value={draft.total_chapters} onChange={(e) => setDraft({ ...draft, total_chapters: +e.target.value })} />
                </div>
              )}
              {step === 3 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Descrição pedagógica (opcional)</label>
                  <Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Objetivos, metodologia, observações..." />
                </div>
              )}
              {step === 4 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Aplicar em quais turmas?</label>
                  {activeClasses.length === 0 && <p className="text-xs text-muted-foreground">Você ainda não tem turmas. Crie uma turma primeiro.</p>}
                  {activeClasses.map((c) => {
                    const sel = draft.classIds.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => setDraft({ ...draft, classIds: sel ? draft.classIds.filter(x => x !== c.id) : [...draft.classIds, c.id] })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition ${sel ? "border-accent bg-accent/10" : "border-border hover:bg-muted"}`}>
                        <span className="text-sm text-foreground">{c.name}</span>
                        {sel && <Check className="h-4 w-4 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="gap-1"><ArrowLeft className="h-3 w-3" />Voltar</Button>}
              {step < 4 ? (
                <Button onClick={() => setStep(s => s + 1)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1">Próximo<ArrowRight className="h-3 w-3" /></Button>
              ) : (
                <Button onClick={finish} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1"><Send className="h-3 w-3" />Criar e aplicar</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduJornadas;
