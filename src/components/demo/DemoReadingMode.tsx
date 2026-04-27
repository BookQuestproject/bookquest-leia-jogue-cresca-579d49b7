import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, ArrowLeft, BookOpen, Clock, CheckCircle, Sparkles,
  Timer, HelpCircle, BookMarked, Plus, Loader2, X, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReadingCountdown from "@/components/ReadingCountdown";
import PostChapterReflection from "@/components/PostChapterReflection";
import { demoReadingPrepStore, useDemoReadingPrep, type VocabularyEntry } from "@/hooks/useDemoReadingPrep";
import { AlertTriangle } from "lucide-react";

interface Props {
  bookTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  pages: number;
  /** Tema visual (HSL string sem 'hsl()'). Default = O Pequeno Príncipe. */
  themeColor?: string;
  /** Total de capítulos do livro (para PostChapterReflection). */
  totalChapters?: number;
  /** ms mínimos para liberar "Concluído" (default 30s — alinhado ao BookQuest principal) */
  minReadingMs?: number;
  /** ícone do capítulo (emoji), default 📖 */
  icon?: string;
  onExit: () => void;
  onComplete: (essenciaEarned: number) => void;
}

type ReadingState = "intro" | "countdown" | "reading" | "reflection" | "completed";

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatTimeReadable = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  if (minutes > 0) return `${minutes}min`;
  return `${Math.floor(ms / 1000)}s`;
};

export default function DemoReadingMode({
  bookTitle,
  chapterNumber,
  chapterTitle,
  pages,
  themeColor = "40 65% 45%",
  totalChapters = 14,
  minReadingMs = 30_000,
  icon = "📖",
  onExit,
  onComplete,
}: Props) {
  const { toast } = useToast();

  const [state, setState] = useState<ReadingState>("intro");
  const [elapsed, setElapsed] = useState(0); // ms
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerError, setIsTimerError] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [earnedEss, setEarnedEss] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cronômetro
  useEffect(() => {
    if (state !== "reading" || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((p) => p + 1000), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, isPaused]);

  const handleStartReading = () => setState("countdown");
  const handleCountdownComplete = () => {
    setElapsed(0);
    setIsPaused(false);
    setState("reading");
  };
  const handlePauseResume = () => setIsPaused((p) => !p);

  const handleChapterComplete = () => {
    if (elapsed < minReadingMs) {
      setIsTimerError(true);
      toast({
        title: "Leia um pouco mais",
        description: `Mínimo de ${Math.round(minReadingMs / 1000)}s antes de finalizar.`,
        variant: "destructive",
      });
      setTimeout(() => setIsTimerError(false), 600);
      return;
    }
    setState("reflection");
  };

  // PostChapterReflection devolve o XP da reflexão; somamos +10 base do capítulo
  const handleReflectionComplete = (reflectionXp: number) => {
    const total = 10 + reflectionXp;
    setEarnedEss(total);
    setState("completed");
  };

  const handleBack = () => {
    if (state === "reflection") {
      setShowExitConfirm(true);
      return;
    }
    onExit();
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  const gradient = `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(
    /\d+%$/,
    (m) => parseInt(m) + 10 + "%"
  )}))`;

  return (
    <div className="fixed inset-0 z-[55] bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Back */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {bookTitle}
        </button>

        {/* Exit confirm during reflection */}
        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <AlertDialogTitle>Sair da reflexão?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-relaxed">
                Se você sair agora, <strong>todo o progresso deste capítulo será perdido</strong> e ele
                <strong> não será concluído</strong>. Você precisará ler novamente para desbloqueá-lo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar respondendo</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmExit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sair e perder progresso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* INTRO */}
        {state === "intro" && (
          <div className="animate-fade-in space-y-8">
            <div className="rounded-xl p-6 text-center" style={{ background: gradient }}>
              <span className="text-5xl mb-4 block">{icon}</span>
              <p className="text-white/70 text-sm mb-1">Capítulo {chapterNumber}</p>
              <h1 className="text-2xl font-serif font-semibold text-white mb-2">{chapterTitle}</h1>
              <p className="text-white/60 text-sm">{pages} páginas</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                Como funciona a trilha
              </h2>
              <div className="space-y-4">
                {[
                  { Icon: Timer, title: "Acompanhamos sua leitura", desc: "Um cronômetro registra o tempo do capítulo. Acompanhe seu ritmo." },
                  { Icon: Pause, title: "Pause quando precisar", desc: "Pause e retome sem perder o progresso." },
                  { Icon: BookMarked, title: "Palavras difíceis com IA", desc: "Adicione palavras durante a leitura e a IA explica em segundos." },
                  { Icon: HelpCircle, title: "Reflexão ao final", desc: "Responda perguntas sobre o capítulo e ganhe Essência." },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `hsl(${themeColor} / 0.15)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" className="w-full gap-3" onClick={handleStartReading} style={{ background: gradient }}>
              <Play className="w-6 h-6" />
              Iniciar Leitura
            </Button>
          </div>
        )}

        {/* COUNTDOWN */}
        {state === "countdown" && (
          <ReadingCountdown
            onComplete={handleCountdownComplete}
            themeColor={themeColor}
            chapterTitle={chapterTitle}
          />
        )}

        {/* READING */}
        {state === "reading" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">{icon}</span>
              <p className="text-sm text-muted-foreground">Capítulo {chapterNumber}</p>
              <h1 className="text-xl font-serif font-semibold">{chapterTitle}</h1>
            </div>

            <div
              className={`rounded-2xl p-8 text-center transition-all duration-200 ${
                isTimerError ? "animate-[shake_0.5s_ease-in-out]" : ""
              }`}
              style={{
                background: isTimerError
                  ? "linear-gradient(135deg, hsl(0 65% 45%), hsl(0 65% 35%))"
                  : gradient,
              }}
            >
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-3">
                <Clock className="w-4 h-4" />
                {isPaused ? "Leitura pausada" : "Tempo de leitura"}
              </div>
              <div
                className={`text-6xl lg:text-7xl font-mono font-bold text-white mb-4 tracking-wider ${
                  isPaused ? "animate-pulse" : ""
                }`}
              >
                {formatTime(elapsed)}
              </div>
              <p className="text-white/60 text-sm">
                {pages} páginas • {bookTitle}
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Abra seu livro e leia o capítulo. Quando terminar, clique em "Concluído".
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="gap-2" onClick={handlePauseResume}>
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                )}
              </Button>
              <Button size="lg" className="gap-2" onClick={handleChapterComplete} style={{ background: gradient }}>
                <CheckCircle className="w-5 h-5" />
                Concluído
              </Button>
            </div>
          </div>
        )}

        {/* REFLECTION — reuso integral do componente do BookQuest principal */}
        {state === "reflection" && (
          <PostChapterReflection
            bookTitle={bookTitle}
            chapterTitle={chapterTitle}
            chapterId={chapterNumber}
            totalChapters={totalChapters}
            themeColor={themeColor}
            readingTime={Math.floor(elapsed / 1000)}
            onComplete={handleReflectionComplete}
          />
        )}

        {/* COMPLETED */}
        {state === "completed" && (
          <div className="animate-fade-in text-center space-y-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: `hsl(${themeColor} / 0.15)` }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: `hsl(${themeColor})` }} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Capítulo Concluído!</h2>
              <p className="text-muted-foreground">Você completou "{chapterTitle}"</p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border inline-block">
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    +{earnedEss}
                  </p>
                  <p className="text-xs text-muted-foreground">Essência ganha</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">tempo de leitura</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    {formatTimeReadable(elapsed)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" onClick={() => onComplete(earnedEss)} style={{ background: gradient }}>
                Voltar para Trilha
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botão flutuante: Palavras Difíceis (somente durante a leitura) */}
      {state === "reading" && (
        <button
          onClick={() => setShowWords(true)}
          className="fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-accent-foreground shadow-lg hover:bg-accent/90 transition-transform hover:scale-105"
          aria-label="Abrir palavras difíceis"
        >
          <BookMarked className="h-5 w-5" />
          <span className="text-sm font-semibold hidden sm:inline">Palavras difíceis</span>
        </button>
      )}

      {/* Sheet de palavras difíceis (com IA) */}
      <DifficultWordsSheet
        open={showWords}
        onOpenChange={setShowWords}
        chapterContext={`${bookTitle} — Capítulo ${chapterNumber}: ${chapterTitle}`}
      />
    </div>
  );
}

/* ========================= Palavras Difíceis (IA) ========================= */

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
                  <CheckCircle className="h-3 w-3" />
                  Salva no seu vocabulário
                </p>
              </div>
            ) : null}
          </div>
        )}

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
                  <button onClick={() => handleViewSaved(v)} className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{v.word}</p>
                    {v.meaning && (
                      <p className="text-[11px] text-muted-foreground truncate">{v.meaning}</p>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => demoReadingPrepStore.removeWord(v.word)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
