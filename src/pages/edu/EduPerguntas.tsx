import { useState } from "react";
import EduLayout from "./EduLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Plus, Copy, Edit2, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

type QType = "aberta" | "multipla" | "reflexiva";
interface Question { id: string; book: string; chapter: number; type: QType; text: string }

const seed: Question[] = [
  { id: "1", book: "Dom Casmurro", chapter: 1, type: "reflexiva", text: "O que o título 'Dom Casmurro' sugere sobre o narrador?" },
  { id: "2", book: "Dom Casmurro", chapter: 2, type: "aberta",    text: "Como Bentinho descreve sua infância?" },
  { id: "3", book: "O Cortiço",    chapter: 1, type: "multipla",  text: "Quem é o protagonista inicial da obra?" },
];

const EduPerguntas = () => {
  const [list, setList] = useState<Question[]>(seed);
  const [book, setBook] = useState<string>("Dom Casmurro");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Question>({ id: "", book: "Dom Casmurro", chapter: 1, type: "reflexiva", text: "" });

  const books = Array.from(new Set(list.map(q => q.book)));
  const filtered = list.filter(q => q.book === book).sort((a, b) => a.chapter - b.chapter);
  const grouped = filtered.reduce<Record<number, Question[]>>((acc, q) => {
    (acc[q.chapter] ||= []).push(q); return acc;
  }, {});

  const save = () => {
    if (!draft.text.trim()) return toast.error("Escreva a pergunta");
    setList([...list, { ...draft, id: crypto.randomUUID() }]);
    toast.success("Pergunta criada");
    setCreating(false); setDraft({ id: "", book, chapter: 1, type: "reflexiva", text: "" });
  };

  const typeLabel = { aberta: "Aberta", multipla: "Múltipla escolha", reflexiva: "Reflexiva" };
  const typeColor: Record<QType, string> = {
    aberta:    "bg-[hsl(217_91%_60%/0.15)] text-[hsl(217_91%_75%)]",
    multipla:  "bg-[hsl(262_83%_58%/0.15)] text-[hsl(262_83%_75%)]",
    reflexiva: "bg-accent/15 text-accent",
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><HelpCircle className="h-6 w-6 text-accent" />Perguntas de Reflexão</h1>
            <p className="text-sm text-muted-foreground">Crie perguntas que aparecem após cada capítulo lido.</p>
          </div>
          <Button onClick={() => setCreating(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-1.5"><Plus className="h-4 w-4" />Nova pergunta</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {books.map(b => (
            <button key={b} onClick={() => setBook(b)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${book === b ? "bg-accent text-accent-foreground border-accent" : "border-white/10 text-muted-foreground hover:bg-white/5"}`}>
              <BookOpen className="inline h-3 w-3 mr-1" />{b}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {Object.keys(grouped).map(ch => (
            <Card key={ch} className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Capítulo {ch}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {grouped[+ch].map(q => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${typeColor[q.type]}`}>{typeLabel[q.type]}</span>
                    <p className="text-sm text-foreground flex-1">{q.text}</p>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-accent"><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setList([...list, { ...q, id: crypto.randomUUID() }]); toast.success("Duplicada"); }} className="h-7 w-7 text-muted-foreground hover:text-accent"><Copy className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setList(list.filter(x => x.id !== q.id))} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {creating && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
            <Card className="w-full max-w-lg bg-[hsl(230_60%_8%)] border-white/10" onClick={(e) => e.stopPropagation()}>
              <CardHeader><CardTitle className="text-base">Nova pergunta</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Livro</label><Input value={draft.book} onChange={(e) => setDraft({ ...draft, book: e.target.value })} /></div>
                  <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Capítulo</label><Input type="number" value={draft.chapter} onChange={(e) => setDraft({ ...draft, chapter: +e.target.value })} /></div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tipo</label>
                  <div className="flex gap-1 mt-1">
                    {(["reflexiva", "aberta", "multipla"] as QType[]).map(t => (
                      <button key={t} onClick={() => setDraft({ ...draft, type: t })} className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${draft.type === t ? "bg-accent text-accent-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>{typeLabel[t]}</button>
                    ))}
                  </div>
                </div>
                <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">Pergunta</label><Textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} rows={3} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreating(false)} className="border-white/10">Cancelar</Button>
                  <Button onClick={save} className="bg-accent hover:bg-accent/90 text-accent-foreground">Salvar pergunta</Button>
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
