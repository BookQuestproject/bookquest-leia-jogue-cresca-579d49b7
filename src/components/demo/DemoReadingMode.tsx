import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Square, BookOpen, X, Loader2, Plus, Trash2,
  BookMarked, Sparkles, ArrowLeft, CheckCircle2, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { demoReadingPrepStore, useDemoReadingPrep, type VocabularyEntry } from "@/hooks/useDemoReadingPrep";

interface Props {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  pages: number;
  /** ms mínimos para liberar “Finalizar” (default 30s — alinhado ao BookQuest principal) */
  minReadingMs?: number;
  onExit: () => void;
  /** Chamado depois da reflexão. */
  onComplete: (essenciaEarned: number) => void;
}

const REFLECTION_QUESTIONS = [
  { id: "q1", label: "O que aconteceu neste capítulo?" },
  { id: "q2", label: "Qual foi a parte mais interessante?" },
  { id: "q3", label: "Algo te confundiu? Comente brevemente." },
];

export default function DemoReadingMode({
  bookTitle,
  chapterNumber,
  chapterTitle,
  pages,
  minReadingMs = 30_000,
  onExit,
  onComplete,
}: Props) {
  const { toast } = useToast();
  const prep = useDemoReadingPrep();

  const [phase, setPhase] = useState<"reading" | "reflection" | "done">("reading");
  const [elapsed, setElapsed] = useState(0); // ms
  const [running, setRunning] = useState(true);
  const [showWords, setShowWords] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reflection
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!running || phase !== "reading") return;
    intervalRef.current = setInterval(() => setElapsed((p) => p + 1000), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase]);

  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const minProgress = Math.min(100, (elapsed / minReadingMs) * 100);
  const canFinish = elapsed >= minReadingMs;

  const handleFinish = () => {
    if (!canFinish) {
      toast({
        title: "Leia um pouco mais",
        description: `Mínimo de ${Math.round(minReadingMs / 1000)}s antes de finalizar.`,
        variant: "destructive",
      });
      return;
    }
    setRunning(false);
    setPhase("reflection");
  };

  const handleSubmitReflection = () => {
    const filled = REFLECTION_QUESTIONS.filter((q) => (answers[q.id] || "").trim().length >= 10);
    if (filled.length < 2) {
      toast({
        title: "Responda pelo menos 2 perguntas",
        description: "Mínimo 10 caracteres por resposta.",
        variant: "destructive",
      });
      return;
    }
    // Recompensa simples no demo
    const baseEss = 10;
    const bonus = filled.length === 3 ? 8 : 4;
    const minutesBonus = Math.min(8, Math.floor(elapsed / 60000));
    const total = baseEss + bonus + minutesBonus;
    setPhase("done");
    setTimeout(() => onComplete(total), 800);
  };

  return (
    <div className="fixed inset-0 z-[55] bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Sair
          </Button>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{bookTitle}</p>
            <p className="text-sm font-bold text-foreground">
              Cap. {chapterNumber} — {chapterTitle}
            </p>
          </div>
          <div className="w-[60px]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {phase === "reading" && (
          <>
            {/* Cronômetro */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <BookOpen className="h-10 w-10 mx-auto text-primary" />
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Tempo de leitura
                  </p>
                  <p className="text-5xl lg:text-6xl font-mono font-bold tabular-nums text-primary mt-2">
                    {formatted}
                  </p>
                </div>
                <div className="space-y-1">
                  <Progress value={minProgress} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    {canFinish
                      ? "✓ Tempo mínimo atingido — pode finalizar"
                      : `Mínimo ${Math.round(minReadingMs / 1000)}s para finalizar`}
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  {running ? (
                    <Button variant="outline" size="lg" onClick={() => setRunning(false)}>
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={() => setRunning(true)}>
                      <Play className="h-4 w-4 mr-1" />
                      Continuar
                    </Button>
                  )}
                  <Button size="lg" onClick={handleFinish} disabled={!canFinish}>
                    <Square className="h-4 w-4 mr-1" />
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Como aproveitar este capítulo
                </p>
                <ul className="text-sm text-foreground space-y-1.5">
                  <li>📖 Pegue seu livro físico ou digital de "{bookTitle}".</li>
                  <li>⏱️ O cronômetro registra seu tempo — você pode pausar a qualquer momento.</li>
                  <li>📝 Anote palavras difíceis no botão flutuante — a IA explica em segundos.</li>
                  <li>🎯 Ao finalizar, você fará uma reflexão rápida sobre o capítulo.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Vocabulário desta sessão */}
            {prep.vocabulary.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <BookMarked className="h-3.5 w-3.5" />
                      Seu vocabulário
                    </p>
                    <Badge variant="secondary">{prep.vocabulary.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {prep.vocabulary.slice(0, 10).map((v) => (
                      <button
                        key={v.word}
                        onClick={() => setShowWords(true)}
                        className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md hover:bg-accent/20"
                      >
                        {v.word}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {phase === "reflection" && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-5">
              <div className="text-center space-y-1">
                <Sparkles className="h-8 w-8 mx-auto text-accent" />
                <h2 className="text-xl font-bold text-foreground">Reflexão pós-capítulo</h2>
                <p className="text-xs text-muted-foreground">
                  Responda pelo menos 2 perguntas (mín. 10 caracteres cada).
                </p>
              </div>

              {REFLECTION_QUESTIONS.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">{q.label}</label>
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Sua resposta..."
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPhase("reading")}>
                  Voltar à leitura
                </Button>
                <Button onClick={handleSubmitReflection}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Concluir capítulo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === "done" && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Capítulo concluído!</h2>
              <p className="text-sm text-muted-foreground">Suas Essências foram registradas.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botão flutuante: Palavras Difíceis */}
      {phase === "reading" && (
        <button
          onClick={() => setShowWords(true)}
          className="fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-accent-foreground shadow-lg hover:bg-accent/90 transition-transform hover:scale-105"
          aria-label="Abrir palavras difíceis"
        >
          <BookMarked className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">Palavras difíceis</span>
        </button>
      )}

      {/* Sheet de palavras difíceis */}
      <DifficultWordsSheet
        open={showWords}
        onOpenChange={setShowWords}
        chapterContext={`${bookTitle} — Capítulo ${chapterNumber}: ${chapterTitle}`}
      />
    </div>
  );
}

/* ========================= Palavras Difíceis ========================= */

interface SheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  chapterContext: string;
}

interface ExplanationResult {
  meaning: string;
  synonyms: string[];
  example: string;
}

function DifficultWordsSheet({ open, onOpenChange, chapterContext }: SheetProps) {
  const { toast } = useToast();
  const prep = useDemoReadingPrep();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<{ word: string; result?: ExplanationResult } | null>(null);

  const handleAdd = async () => {
    const word = input.trim();
    if (word.length < 2) {
      toast({ title: "Digite uma palavra", variant: "destructive" });
      return;
    }
    setActive({ word });
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("explain-word", {
        body: { word, context: chapterContext },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result: ExplanationResult = {
        meaning: data.meaning,
        synonyms: data.synonyms || [],
        example: data.example,
      };
      setActive({ word, result });
      // Salva automaticamente no vocabulário
      demoReadingPrepStore.saveWord({
        word,
        meaning: result.meaning,
        synonyms: result.synonyms,
        example: result.example,
        chapter: chapterContext,
      });
      setInput("");
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Não foi possível explicar",
        description: e.message?.slice(0, 120) || "Tente novamente em instantes.",
        variant: "destructive",
      });
      setActive(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSaved = (entry: VocabularyEntry) => {
    setActive({
      word: entry.word,
      result: {
        meaning: entry.meaning || "",
        synonyms: entry.synonyms || [],
        example: entry.example || "",
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-accent" />
            Palavras difíceis
          </SheetTitle>
          <p className="text-xs text-muted-foreground text-left">
            Adicione palavras que apareceram durante a leitura — a IA explica de forma simples.
          </p>
        </SheetHeader>

        <div className="p-4 space-y-3 border-b border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Digite a palavra..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={loading}
              maxLength={50}
            />
            <Button onClick={handleAdd} disabled={loading || input.trim().length < 2}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Card de explicação ativa */}
        {active && (
          <div className="p-4 border-b border-border bg-accent/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-foreground">{active.word}</h3>
              <Button variant="ghost" size="icon" onClick={() => setActive(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Consultando IA...
              </div>
            ) : active.result ? (
              <div className="space-y-2 text-sm">
                <p className="text-foreground">{active.result.meaning}</p>
                {active.result.synonyms.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase font-semibold text-muted-foreground mb-1">
                      Sinônimos
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {active.result.synonyms.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {active.result.example && (
                  <p className="text-xs italic text-muted-foreground border-l-2 border-accent pl-2">
                    "{active.result.example}"
                  </p>
                )}
                <p className="text-[11px] text-success flex items-center gap-1 pt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Salva no seu vocabulário
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Lista de palavras salvas */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Vocabulário salvo ({prep.vocabulary.length})
          </p>
          {prep.vocabulary.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Nenhuma palavra ainda. Adicione a primeira acima!
            </p>
          ) : (
            <ul className="space-y-1.5">
              {prep.vocabulary.map((v) => (
                <li
                  key={v.word}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/70 transition"
                >
                  <button
                    onClick={() => handleViewSaved(v)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-semibold text-foreground truncate">{v.word}</p>
                    {v.meaning && (
                      <p className="text-[11px] text-muted-foreground truncate">{v.meaning}</p>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => demoReadingPrepStore.removeWord(v.word)}
                    aria-label={`Remover ${v.word}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
