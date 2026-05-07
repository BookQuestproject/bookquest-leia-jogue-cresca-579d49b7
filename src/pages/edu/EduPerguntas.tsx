import { useState, useEffect } from "react";
import EduLayout from "./EduLayout";
import { useJourneys } from "@/hooks/useJourneys";
import { useJourneyQuestions } from "@/hooks/useJourneyQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, Trash2, BookOpen, Loader2 } from "lucide-react";

const EduPerguntas = () => {
  const { journeys, loading: loadingJ } = useJourneys();
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const { questions, loading, create, remove } = useJourneyQuestions(journeyId);

  const [creating, setCreating] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!journeyId && journeys.length) setJourneyId(journeys[0].id);
  }, [journeys, journeyId]);

  const journey = journeys.find(j => j.id === journeyId);
  const grouped = questions.reduce<Record<number, typeof questions>>((acc, q) => {
    (acc[q.chapter_number] ||= []).push(q); return acc;
  }, {});

  const save = async () => {
    if (!text.trim()) return;
    await create(chapter, text);
    setText(""); setCreating(false);
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><HelpCircle className="h-6 w-6 text-accent" />Perguntas de Reflexão</h1>
            <p className="text-sm text-muted-foreground">Crie perguntas que aparecem após cada capítulo lido.</p>
          </div>
          <Button onClick={() => setCreating(true)} disabled={!journeyId} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5">
            <Plus className="h-4 w-4" />Nova pergunta
          </Button>
        </div>

        {loadingJ ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : journeys.length === 0 ? (
          <Card className="bg-card border-border"><CardContent className="text-center py-12">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Crie uma jornada primeiro para adicionar perguntas.</p>
          </CardContent></Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {journeys.map(j => (
                <button key={j.id} onClick={() => setJourneyId(j.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${journeyId === j.id ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  <BookOpen className="inline h-3 w-3 mr-1" />{j.title}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : Object.keys(grouped).length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma pergunta para esta jornada.</p>
            ) : (
              <div className="space-y-4">
                {Object.keys(grouped).sort((a,b) => +a - +b).map(ch => (
                  <Card key={ch} className="bg-card border-border">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Capítulo {ch}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {grouped[+ch].map(q => (
                        <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm text-foreground flex-1">{q.question_text}</p>
                          <Button size="icon" variant="ghost" onClick={() => remove(q.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {creating && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
            <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <CardHeader><CardTitle className="text-base">Nova pergunta · {journey?.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Capítulo</label>
                  <Input type="number" min={1} max={journey?.total_chapters ?? 999} value={chapter} onChange={(e) => setChapter(+e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pergunta</label>
                  <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Ex.: O que o título sugere sobre o narrador?" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
                  <Button onClick={save} className="bg-accent hover:bg-accent/90 text-accent-foreground">Salvar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EduLayout>
  );
};

export default EduPerguntas;
