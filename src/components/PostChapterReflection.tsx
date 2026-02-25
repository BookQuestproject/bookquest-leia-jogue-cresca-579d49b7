import { useState, useEffect, useCallback } from "react";
import { Sparkles, ChevronRight, CheckCircle, Star, Zap, MessageSquare, BarChart3, Brain, Users, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────

interface OpenQuestion {
  type: "open";
  question: string;
  keywords: string[];
}

interface MultipleChoiceQuestion {
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: number;
  partialAnswers?: number[];
  explanation: string;
}

interface PerceptionQuestion {
  type: "perception";
  question: string;
  options: string[];
}

interface PredictionQuestion {
  type: "prediction";
  question: string;
  keywords: string[];
}

interface CharacterQuestion {
  type: "character";
  question: string;
  options: string[];
  justifyLabel: string;
}

interface ThemeQuestion {
  type: "theme";
  question: string;
  options: string[];
  allowOther?: boolean;
}

type ReflectionQuestion =
  | OpenQuestion
  | MultipleChoiceQuestion
  | PerceptionQuestion
  | PredictionQuestion
  | CharacterQuestion
  | ThemeQuestion;

interface Props {
  bookTitle: string;
  chapterTitle: string;
  chapterId: number;
  totalChapters: number;
  themeColor: string;
  readingTime: number;
  onComplete: (xpEarned: number) => void;
}

// ─── Scoring helpers ─────────────────────────────────────────────

function scoreOpenAnswer(answer: string, keywords: string[]): number {
  if (!answer.trim()) return 0;
  const len = answer.trim().length;
  let score = 0;
  if (len < 20) score = 1;
  else if (len < 80) score = 2;
  else score = 3;

  const lower = answer.toLowerCase();
  const kwHits = keywords.filter(k => lower.includes(k.toLowerCase())).length;
  if (kwHits >= 2) score += 1;

  return Math.min(score, 4); // max 4 XP per open question
}

function scoreMultipleChoice(selected: number, correct: number, partial: number[]): number {
  if (selected === correct) return 4;
  if (partial.includes(selected)) return 2;
  return 1;
}

// ─── Icons per type ──────────────────────────────────────────────

const typeIcons: Record<string, React.ReactNode> = {
  open: <MessageSquare className="w-5 h-5" />,
  multiple_choice: <Brain className="w-5 h-5" />,
  perception: <BarChart3 className="w-5 h-5" />,
  prediction: <Sparkles className="w-5 h-5" />,
  character: <Users className="w-5 h-5" />,
  theme: <Tag className="w-5 h-5" />,
};

const typeLabels: Record<string, string> = {
  open: "Reflexão",
  multiple_choice: "Interpretação",
  perception: "Percepção",
  prediction: "Previsão",
  character: "Personagem",
  theme: "Tema",
};

// ─── Component ───────────────────────────────────────────────────

const PostChapterReflection = ({
  bookTitle,
  chapterTitle,
  chapterId,
  totalChapters,
  themeColor,
  readingTime,
  onComplete,
}: Props) => {
  const [questions, setQuestions] = useState<ReflectionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [xpPerQuestion, setXpPerQuestion] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from AI
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("generate-reflection", {
          body: { bookTitle, chapterTitle, chapterId, totalChapters },
        });
        if (fnError) throw fnError;
        if (data?.questions?.length) {
          setQuestions(data.questions);
          setXpPerQuestion(new Array(data.questions.length).fill(0));
        } else {
          throw new Error("No questions returned");
        }
      } catch (err: any) {
        console.error("Failed to load reflection questions:", err);
        setError("Não foi possível carregar as perguntas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [bookTitle, chapterTitle, chapterId, totalChapters]);

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx + (showFeedback || finished ? 1 : 0)) / questions.length) * 100 : 0;

  const handleAnswer = useCallback((value: any) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: value }));
  }, [currentIdx]);

  const handleSubmitAnswer = () => {
    if (!currentQ) return;

    let xp = 0;
    const answer = answers[currentIdx];

    switch (currentQ.type) {
      case "open":
        xp = scoreOpenAnswer(answer || "", currentQ.keywords);
        break;
      case "multiple_choice":
        xp = scoreMultipleChoice(answer ?? -1, currentQ.correctAnswer, currentQ.partialAnswers || []);
        break;
      case "perception":
        xp = answer !== undefined ? 2 : 0;
        break;
      case "prediction":
        xp = scoreOpenAnswer(answer || "", currentQ.keywords);
        break;
      case "character": {
        const { choice, justification } = answer || {};
        xp = choice !== undefined ? 2 : 0;
        if (justification && justification.trim().length > 15) xp += 2;
        break;
      }
      case "theme":
        xp = answer !== undefined ? 2 : 0;
        if (typeof answer === "string" && answer.startsWith("other:") && answer.length > 8) xp += 1;
        break;
    }

    setXpPerQuestion(prev => {
      const next = [...prev];
      next[currentIdx] = xp;
      return next;
    });

    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const totalXp = 10 + xpPerQuestion.reduce((a, b) => a + b, 0); // 10 base + question XP

  // Anti-manipulation: check for duplicate answers
  const detectDuplication = () => {
    const openAnswers = Object.entries(answers)
      .filter(([idx]) => {
        const q = questions[Number(idx)];
        return q?.type === "open" || q?.type === "prediction";
      })
      .map(([, v]) => (v || "").trim().toLowerCase());
    
    const unique = new Set(openAnswers);
    return openAnswers.length > 1 && unique.size === 1;
  };

  const finalXp = detectDuplication() ? Math.max(10, Math.floor(totalXp * 0.5)) : totalXp;

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6 text-center py-12">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: `hsl(${themeColor} / 0.15)` }}
        >
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: `hsl(${themeColor})` }} />
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold mb-2">Preparando reflexão...</h2>
          <p className="text-sm text-muted-foreground">Gerando perguntas personalizadas sobre o capítulo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in space-y-6 text-center py-12">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => onComplete(10)}>
          Pular reflexão (+10 XP base)
        </Button>
      </div>
    );
  }

  // ─── Finished screen ──────────────────────────────────────────
  if (finished) {
    return (
      <div className="animate-fade-in space-y-8 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{ background: `hsl(${themeColor} / 0.15)` }}
        >
          <CheckCircle className="w-12 h-12" style={{ color: `hsl(${themeColor})` }} />
        </div>

        <div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Reflexão Concluída!</h2>
          <p className="text-muted-foreground">
            Você completou "{chapterTitle}"
          </p>
        </div>

        {/* XP Breakdown */}
        <div className="bg-card rounded-xl p-6 border border-border max-w-sm mx-auto space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Leitura do capítulo</span>
            <span className="font-bold" style={{ color: `hsl(${themeColor})` }}>+10 XP</span>
          </div>
          {xpPerQuestion.map((xp, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                {typeIcons[questions[i]?.type] || <Star className="w-4 h-4" />}
                {typeLabels[questions[i]?.type] || "Pergunta"}
              </span>
              <span className="font-bold" style={{ color: `hsl(${themeColor})` }}>+{xp} XP</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
              Total
            </span>
            <span className="text-2xl font-bold" style={{ color: `hsl(${themeColor})` }}>
              +{finalXp} XP
            </span>
          </div>
        </div>

        {/* XP Bar animation */}
        <div className="max-w-sm mx-auto">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (finalXp / 30) * 100)}%`,
                background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, m => parseInt(m) + 15 + '%')}))`,
              }}
            />
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => onComplete(finalXp)}
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, m => parseInt(m) + 10 + '%')}))`,
          }}
        >
          Continuar
        </Button>
      </div>
    );
  }

  // ─── Question view ─────────────────────────────────────────────
  const hasAnswer = answers[currentIdx] !== undefined && answers[currentIdx] !== "" && answers[currentIdx] !== null;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {typeIcons[currentQ?.type]}
            {typeLabels[currentQ?.type] || "Pergunta"}
          </span>
          <span>{currentIdx + 1} de {questions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, m => parseInt(m) + 15 + '%')}))`,
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-5">
        <p className="text-lg font-medium leading-relaxed">{currentQ?.question}</p>

        {/* ─── Renderers per type ─── */}
        {currentQ?.type === "open" && (
          <Textarea
            value={answers[currentIdx] || ""}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Escreva sua reflexão..."
            className="min-h-[100px] resize-none"
            disabled={showFeedback}
          />
        )}

        {currentQ?.type === "multiple_choice" && (
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !showFeedback && handleAnswer(i)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showFeedback
                    ? i === currentQ.correctAnswer
                      ? "bg-accent/20 border-accent"
                      : i === answers[currentIdx] && i !== currentQ.correctAnswer
                      ? "bg-destructive/20 border-destructive"
                      : "bg-muted/50 border-border"
                    : answers[currentIdx] === i
                    ? "border-2"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
                style={{
                  borderColor: !showFeedback && answers[currentIdx] === i ? `hsl(${themeColor})` : undefined,
                }}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ?.type === "perception" && (
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !showFeedback && handleAnswer(i)}
                disabled={showFeedback}
                className={`p-4 rounded-lg border text-center transition-all ${
                  answers[currentIdx] === i
                    ? "border-2 font-semibold"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
                style={{
                  borderColor: answers[currentIdx] === i ? `hsl(${themeColor})` : undefined,
                  color: answers[currentIdx] === i ? `hsl(${themeColor})` : undefined,
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ?.type === "prediction" && (
          <Textarea
            value={answers[currentIdx] || ""}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="O que você acha que vai acontecer..."
            className="min-h-[80px] resize-none"
            disabled={showFeedback}
          />
        )}

        {currentQ?.type === "character" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (showFeedback) return;
                    const prev = answers[currentIdx] || {};
                    handleAnswer({ ...prev, choice: i });
                  }}
                  disabled={showFeedback}
                  className={`flex-1 p-3 rounded-lg border text-center text-sm transition-all ${
                    answers[currentIdx]?.choice === i
                      ? "border-2 font-semibold"
                      : "bg-muted/50 border-border hover:bg-muted"
                  }`}
                  style={{
                    borderColor: answers[currentIdx]?.choice === i ? `hsl(${themeColor})` : undefined,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Textarea
              value={answers[currentIdx]?.justification || ""}
              onChange={e => {
                const prev = answers[currentIdx] || {};
                handleAnswer({ ...prev, justification: e.target.value });
              }}
              placeholder={currentQ.justifyLabel || "Justifique (opcional)..."}
              className="min-h-[60px] resize-none"
              disabled={showFeedback}
            />
          </div>
        )}

        {currentQ?.type === "theme" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => !showFeedback && handleAnswer(opt)}
                  disabled={showFeedback}
                  className={`p-3 rounded-lg border text-center text-sm transition-all ${
                    answers[currentIdx] === opt
                      ? "border-2 font-semibold"
                      : "bg-muted/50 border-border hover:bg-muted"
                  }`}
                  style={{
                    borderColor: answers[currentIdx] === opt ? `hsl(${themeColor})` : undefined,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
            {currentQ.allowOther && (
              <input
                type="text"
                value={
                  typeof answers[currentIdx] === "string" && answers[currentIdx]?.startsWith("other:")
                    ? answers[currentIdx].slice(6)
                    : ""
                }
                onChange={e => handleAnswer(e.target.value ? `other:${e.target.value}` : undefined)}
                placeholder="Outro tema..."
                className="w-full p-3 rounded-lg border border-border bg-muted/50 text-sm"
                disabled={showFeedback}
              />
            )}
          </div>
        )}

        {/* Feedback for multiple choice */}
        {showFeedback && currentQ?.type === "multiple_choice" && (
          <div className={`p-4 rounded-lg ${
            answers[currentIdx] === currentQ.correctAnswer ? "bg-accent/10" : "bg-amber-500/10"
          }`}>
            <p className="font-semibold mb-1">
              {answers[currentIdx] === currentQ.correctAnswer ? "🎉 Correto!" : "💡 Não foi dessa vez..."}
            </p>
            <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
          </div>
        )}

        {/* Feedback for open/prediction */}
        {showFeedback && (currentQ?.type === "open" || currentQ?.type === "prediction") && (
          <div className="p-4 rounded-lg bg-accent/10">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
              +{xpPerQuestion[currentIdx]} XP
            </p>
            <p className="text-sm text-muted-foreground">
              {(answers[currentIdx] || "").length > 80
                ? "Excelente reflexão! Resposta bem desenvolvida."
                : (answers[currentIdx] || "").length > 20
                ? "Boa reflexão! Tente desenvolver mais nas próximas."
                : "Resposta registrada. Tente aprofundar mais suas reflexões!"}
            </p>
          </div>
        )}

        {/* Feedback generic */}
        {showFeedback && !["multiple_choice", "open", "prediction"].includes(currentQ?.type || "") && (
          <div className="p-4 rounded-lg bg-accent/10">
            <p className="font-semibold flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
              +{xpPerQuestion[currentIdx]} XP
            </p>
          </div>
        )}
      </div>

      {/* Action button */}
      {!showFeedback ? (
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!hasAnswer}
          onClick={handleSubmitAnswer}
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, m => parseInt(m) + 10 + '%')}))`,
          }}
        >
          Confirmar
        </Button>
      ) : (
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleNext}
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, m => parseInt(m) + 10 + '%')}))`,
          }}
        >
          {currentIdx < questions.length - 1 ? (
            <>Próxima <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Ver Resultado <Sparkles className="w-4 h-4" /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default PostChapterReflection;
