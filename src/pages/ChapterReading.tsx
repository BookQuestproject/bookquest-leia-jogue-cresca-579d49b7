import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, BookOpen, Timer, HelpCircle, Sparkles, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// This would ideally come from a shared data source
const bookData: Record<string, {
  title: string;
  themeColor: string;
  chapters: Array<{
    id: number;
    title: string;
    icon: string;
    totalPages: number;
    question?: {
      text: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  }>;
}> = {
  "harry-potter-1": {
    title: "Harry Potter e a Pedra Filosofal",
    themeColor: "350 45% 32%",
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        icon: "🏠",
        totalPages: 24,
        question: {
          text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?",
          options: [
            "Porque os Potter eram criminosos procurados",
            "Porque não queriam ser associados a algo 'anormal'",
            "Porque deviam dinheiro aos Potter",
            "Porque os Potter eram celebridades famosas"
          ],
          correctAnswer: 1,
          explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico."
        }
      },
      { id: 2, title: "O Vidro que Sumiu", icon: "🐍", totalPages: 18 },
      { id: 3, title: "As Cartas de Ninguém", icon: "✉️", totalPages: 22 },
      { id: 4, title: "O Guardião das Chaves", icon: "🗝️", totalPages: 20 },
      { id: 5, title: "O Beco Diagonal", icon: "🏪", totalPages: 28 },
      { id: 6, title: "A Viagem da Plataforma", icon: "🚂", totalPages: 18 },
      { id: 7, title: "O Chapéu Seletor", icon: "🎩", totalPages: 16 },
      { id: 8, title: "O Mestre das Poções", icon: "⚗️", totalPages: 20 },
      { id: 9, title: "O Duelo à Meia-Noite", icon: "⚔️", totalPages: 22 },
      { id: 10, title: "O Espelho de Ojesed", icon: "🪞", totalPages: 24 },
    ]
  },
  "percy-jackson-1": {
    title: "Percy Jackson e o Ladrão de Raios",
    themeColor: "210 55% 30%",
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", icon: "⚡", totalPages: 15 },
      { id: 2, title: "Três Velhas Tricotando", icon: "🧶", totalPages: 18 },
      { id: 3, title: "Grover Perde as Calças", icon: "🐐", totalPages: 20 },
    ]
  },
  "dom-casmurro": {
    title: "Dom Casmurro",
    themeColor: "35 40% 28%",
    chapters: [
      { id: 1, title: "Do título", icon: "📜", totalPages: 8 },
      { id: 2, title: "Do livro", icon: "📖", totalPages: 10 },
      { id: 3, title: "A denúncia", icon: "🔔", totalPages: 12 },
    ]
  },
  "o-pequeno-principe": {
    title: "O Pequeno Príncipe",
    themeColor: "40 65% 45%",
    chapters: [
      { id: 1, title: "O Desenho", icon: "🎨", totalPages: 6 },
      { id: 2, title: "O Encontro", icon: "⭐", totalPages: 10 },
      { id: 3, title: "O Asteroide B-612", icon: "🪐", totalPages: 8 },
    ]
  },
};

import ReadingCountdown from "@/components/ReadingCountdown";

type ReadingState = "intro" | "countdown" | "reading" | "quiz" | "completed";

const ChapterReading = () => {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, saveProgress, markAsCompleted, clearProgress } = useReadingProgress(bookId, chapterId);
  
  const [readingState, setReadingState] = useState<ReadingState>("intro");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isTimerError, setIsTimerError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const book = bookId ? bookData[bookId] : null;
  const chapter = book?.chapters.find(c => c.id === Number(chapterId));
  const themeColor = book?.themeColor || "350 45% 32%";

  // Restore progress when loaded
  useEffect(() => {
    if (!progressLoading && progress && !hasRestoredProgress && !progress.is_completed) {
      setElapsedTime(progress.elapsed_time);
      setIsPaused(true);
      setReadingState("reading");
      setHasRestoredProgress(true);
    }
  }, [progress, progressLoading, hasRestoredProgress]);

  // Timer logic
  useEffect(() => {
    if (readingState === "reading" && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [readingState, isPaused]);

  // Auto-save when paused
  useEffect(() => {
    if (readingState === "reading" && isPaused && user && elapsedTime > 0) {
      saveProgress(elapsedTime, true, false);
    }
  }, [isPaused, readingState, elapsedTime, user, saveProgress]);

  // Save progress when leaving the page (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        // Use sendBeacon for reliable save on page unload
        const data = JSON.stringify({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: true,
          is_completed: false,
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/reading_progress?on_conflict=user_id,book_id,chapter_id`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [readingState, user, elapsedTime, bookId, chapterId]);

  // Save progress when navigating away (component unmount)
  useEffect(() => {
    return () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        saveProgress(elapsedTime, true, false);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartReading = () => {
    if (hasRestoredProgress) {
      // Resuming - skip countdown
      setReadingState("reading");
      setIsPaused(false);
    } else {
      setReadingState("countdown");
    }
  };

  const handleCountdownComplete = () => {
    setElapsedTime(0);
    setReadingState("reading");
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // Minimum reading time: 30 seconds to prevent accidental/invalid completions
  const MIN_READING_TIME = 30;

  const handleChapterComplete = async () => {
    // Validate minimum reading time
    if (elapsedTime < MIN_READING_TIME) {
      // Trigger shake animation and red background
      setIsTimerError(true);
      setTimeout(() => setIsTimerError(false), 600);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Mark as completed (keeps the record for showing in trail)
    if (user) {
      await markAsCompleted(elapsedTime);
    }
    
    if (chapter?.question) {
      setReadingState("quiz");
    } else {
      setReadingState("completed");
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  const handleQuizComplete = async () => {
    // Keep the completed record (already marked in handleChapterComplete)
    setReadingState("completed");
  };

  const handleBackToTrail = () => {
    navigate(`/trilhas/${bookId}`);
  };

  if (!book || !chapter) {
    return (
      <Layout>
        <div className="py-8 text-center">
          <h1 className="text-2xl font-serif font-semibold mb-4">Capítulo não encontrado</h1>
          <Link to="/trilhas">
            <Button variant="outline">Voltar às trilhas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Show loading while checking for saved progress
  if (progressLoading && user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Back Button */}
        <button 
          onClick={handleBackToTrail}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {book.title}
        </button>

        {/* Intro State - Explain how it works */}
        {readingState === "intro" && (
          <div className="animate-fade-in space-y-8">
            {/* Header Card */}
            <div 
              className="rounded-xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <span className="text-5xl mb-4 block">{chapter.icon}</span>
              <p className="text-white/70 text-sm mb-1">Capítulo {chapter.id}</p>
              <h1 className="text-2xl font-serif font-semibold text-white mb-2">
                {chapter.title}
              </h1>
              <p className="text-white/60 text-sm">{chapter.totalPages} páginas</p>
            </div>

            {/* How it works */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                Como funciona a trilha
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Timer className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Acompanhamos sua leitura</h3>
                    <p className="text-sm text-muted-foreground">
                      Um cronômetro vai registrar o tempo que você leva para ler o capítulo. 
                      Assim você pode acompanhar seu progresso e ritmo de leitura.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Pause className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Pause quando precisar</h3>
                    <p className="text-sm text-muted-foreground">
                      Precisa fazer uma pausa? Sem problemas! Você pode pausar o cronômetro 
                      e continuar depois, sem perder seu progresso.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Quiz ao final</h3>
                    <p className="text-sm text-muted-foreground">
                      Após concluir a leitura, responda perguntas sobre o capítulo para 
                      testar sua compreensão e ganhar pontos!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              size="xl" 
              className="w-full gap-3"
              onClick={handleStartReading}
              style={{ 
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <Play className="w-6 h-6" />
              Iniciar Leitura
            </Button>
          </div>
        )}

        {/* Countdown State */}
        {readingState === "countdown" && (
          <ReadingCountdown
            onComplete={handleCountdownComplete}
            themeColor={themeColor}
            chapterTitle={chapter.title}
          />
        )}

        {/* Reading State - Timer Active */}
        {readingState === "reading" && (
          <div className="animate-fade-in space-y-8">
            {/* Chapter Info */}
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">{chapter.icon}</span>
              <p className="text-sm text-muted-foreground">Capítulo {chapter.id}</p>
              <h1 className="text-xl font-serif font-semibold">{chapter.title}</h1>
            </div>

            {/* Timer Display */}
            <div 
              className={`rounded-2xl p-8 text-center transition-all duration-200 ${
                isTimerError ? 'animate-[shake_0.5s_ease-in-out]' : ''
              }`}
              style={{
                background: isTimerError 
                  ? 'linear-gradient(135deg, hsl(0 65% 45%), hsl(0 65% 35%))'
                  : `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-3">
                <Clock className="w-4 h-4" />
                {isPaused ? "Leitura pausada" : "Tempo de leitura"}
              </div>
              
              <div 
                className={`text-6xl lg:text-7xl font-mono font-bold text-white mb-4 tracking-wider ${
                  isPaused ? 'animate-pulse' : ''
                }`}
              >
                {formatTime(elapsedTime)}
              </div>

              <p className="text-white/60 text-sm">
                {chapter.totalPages} páginas • {book.title}
              </p>
            </div>

            {/* Reading Instructions */}
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Abra seu livro e leia o capítulo. Quando terminar, clique em "Capítulo Concluído".
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={handlePauseResume}
              >
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
              
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleChapterComplete}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                <CheckCircle className="w-5 h-5" />
                Concluído
              </Button>
            </div>
          </div>
        )}

        {/* Quiz State */}
        {readingState === "quiz" && chapter.question && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `hsl(${themeColor} / 0.15)` }}
              >
                <HelpCircle className="w-8 h-8" style={{ color: `hsl(${themeColor})` }} />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Você leu por {formatTime(elapsedTime)}</p>
              <h2 className="text-xl font-serif font-semibold">Pergunta do Capítulo</h2>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <p className="text-lg mb-6">{chapter.question.text}</p>
              
              <div className="space-y-3">
                {chapter.question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      showResult
                        ? index === chapter.question!.correctAnswer
                          ? 'bg-accent/20 border-accent text-accent-foreground'
                          : index === selectedAnswer
                          ? 'bg-destructive/20 border-destructive'
                          : 'bg-muted/50 border-border'
                        : selectedAnswer === index
                        ? 'border-2'
                        : 'bg-muted/50 border-border hover:bg-muted'
                    }`}
                    style={{
                      borderColor: !showResult && selectedAnswer === index ? `hsl(${themeColor})` : undefined,
                    }}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {showResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  selectedAnswer === chapter.question.correctAnswer
                    ? 'bg-accent/10'
                    : 'bg-amber-500/10'
                }`}>
                  <p className="font-semibold mb-1">
                    {selectedAnswer === chapter.question.correctAnswer
                      ? '🎉 Correto!'
                      : '💡 Não foi dessa vez...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {chapter.question.explanation}
                  </p>
                </div>
              )}

              {!showResult ? (
                <Button 
                  className="w-full mt-6"
                  disabled={selectedAnswer === null}
                  onClick={handleAnswerSubmit}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                  }}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button 
                  className="w-full mt-6"
                  onClick={handleQuizComplete}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                  }}
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Completed State */}
        {readingState === "completed" && (
          <div className="animate-fade-in text-center space-y-8">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: `hsl(${themeColor} / 0.15)` }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: `hsl(${themeColor})` }} />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Capítulo Concluído!</h2>
              <p className="text-muted-foreground">
                Você completou "{chapter.title}" em {formatTime(elapsedTime)}
              </p>
            </div>

            <div 
              className="bg-card rounded-xl p-6 border border-border inline-block"
            >
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    +25
                  </p>
                  <p className="text-xs text-muted-foreground">pontos</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
                  <p className="text-xs text-muted-foreground">tempo de leitura</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                size="lg"
                onClick={handleBackToTrail}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                Voltar para Trilha
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChapterReading;
