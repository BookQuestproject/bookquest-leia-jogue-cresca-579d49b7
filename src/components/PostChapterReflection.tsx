import { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, ChevronRight, CheckCircle, Star, MessageSquare, BarChart3, Brain, Users, Tag, Loader2, ShieldAlert } from "lucide-react";
import EssenciaIcon from "@/components/EssenciaIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSound } from "@/hooks/useSoundEffects";

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

function isGibberish(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  // Mostly numbers or special characters (e.g. "12345", "!@#$%")
  const alphaChars = trimmed.replace(/[^a-záéíóúâêôãõçà]/g, "");
  if (alphaChars.length < trimmed.length * 0.4) return true;
  // Check for repeated character patterns (e.g. "aaaa", "asdasd")
  if (/(.)\1{4,}/.test(trimmed)) return true;
  // Check for very short repeated sequences (e.g. "ababab", "xyzxyz")
  if (/^(.{1,4})\1{2,}$/.test(trimmed)) return true;
  // Check ratio of unique chars to length — gibberish tends to have low variety relative to word count
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  // If long text but very few actual words
  if (trimmed.length > 30 && words.length < 3) return true;
  // Check if most "words" are nonsense (no vowels or too short)
  const realWords = words.filter(w => w.length >= 2 && /[aeiouyáéíóúâêôãõ]/.test(w));
  if (words.length >= 3 && realWords.length / words.length < 0.4) return true;
  // Random keyboard smash: too many consonant clusters
  const consonantClusters = trimmed.match(/[bcdfghjklmnpqrstvwxz]{5,}/g);
  if (consonantClusters && consonantClusters.length >= 1) return true;
  // Single word that's not a real word pattern (e.g. "asdfgh")
  if (words.length === 1 && trimmed.length > 5 && !/[aeiouyáéíóúâêôãõ].*[aeiouyáéíóúâêôãõ]/.test(trimmed)) return true;
  return false;
}

function scoreOpenAnswer(answer: string, keywords: string[]): number {
  if (!answer.trim()) return 0;
  const trimmed = answer.trim();

  // Gibberish / nonsense detection
  if (isGibberish(trimmed)) return 0;

  const len = trimmed.length;
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);

  // Require at least 3 real words for any meaningful score
  if (words.length < 3) return 1;

  let score = 0;
  if (len < 40) score = 1;
  else if (len < 100) score = 2;
  else score = 3;

  const lower = trimmed.toLowerCase();
  const kwHits = keywords.filter(k => lower.includes(k.toLowerCase())).length;
  if (kwHits >= 2) score += 1;
  else if (kwHits === 0 && score >= 2) score -= 1; // Penalty: long text but zero relevance

  return Math.min(Math.max(score, 0), 4);
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
  const [tabViolation, setTabViolation] = useState(false);
  const tabViolationRef = useRef(false);

  // ─── Anti-cheat: block paste on text inputs ───
  const blockPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error("Colar texto não é permitido durante a reflexão.");
  }, []);

  // ─── Anti-cheat: detect tab/window switch, Alt+Tab, minimize ───
  const violationCountRef = useRef(0);

  useEffect(() => {
    if (finished || loading) return;

    const triggerViolation = (reason: string) => {
      if (tabViolationRef.current || finished) return;
      tabViolationRef.current = true;
      violationCountRef.current += 1;
      setTabViolation(true);
      setXpPerQuestion(prev => {
        const next = [...prev];
        next[currentIdx] = 0;
        return next;
      });
      console.warn(`[Anti-cheat] Violation #${violationCountRef.current}: ${reason}`);
    };

    // Catches tab switch, minimize, Alt+Tab (when page becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) triggerViolation("visibilitychange: tab hidden");
    };

    // Catches Alt+Tab, clicking outside browser — fires even if page stays "visible"
    const handleWindowBlur = () => {
      triggerViolation("window blur: focus lost (Alt+Tab / click outside)");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [finished, loading, currentIdx]);

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

    // If question was annulled, force 0 XP and skip to feedback
    if (tabViolation) {
      setXpPerQuestion(prev => {
        const next = [...prev];
        next[currentIdx] = 0;
        return next;
      });
      setShowFeedback(true);
      return;
    }

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
        if (justification && justification.trim().length > 15 && !isGibberish(justification)) {
          // Validate relevance: justification must reference the book, character, or question context
          const justLower = justification.trim().toLowerCase();
          const questionLower = currentQ.question.toLowerCase();
          const bookLower = bookTitle.toLowerCase();
          
          // Extract key terms from the question (words with 4+ chars, excluding common words)
          const stopWords = ["como", "você", "qual", "para", "sobre", "esse", "essa", "este", "esta", "dele", "dela", "acha", "seria", "fazer", "pode", "mais", "muito", "quando", "onde", "quem", "porque", "ainda", "sendo", "foram", "está", "estão", "isso", "aqui", "pela", "pelo", "entre", "após", "antes", "cada", "outro", "outra", "mesmo", "mesma", "todo", "toda", "algum", "alguma", "nenhum", "nenhuma", "seus", "suas", "nosso", "nossa", "vocês", "eles", "elas", "dele", "dela", "deles", "delas", "minha", "minha", "teria", "seria"];
          const questionTerms = questionLower
            .replace(/[?.,!;:""'']/g, "")
            .split(/\s+/)
            .filter(w => w.length >= 4 && !stopWords.includes(w));
          
          // Also include book title words and character options as relevant terms
          const bookTerms = bookLower.split(/\s+/).filter(w => w.length >= 3);
          const optionTerms = (currentQ.options || []).flatMap(o => o.toLowerCase().split(/\s+/).filter(w => w.length >= 3));
          const allRelevantTerms = [...new Set([...questionTerms, ...bookTerms, ...optionTerms])];
          
          // Check if the justification contains at least 1 relevant term
          const relevanceHits = allRelevantTerms.filter(term => justLower.includes(term)).length;
          
          // Also check minimum word count for substance
          const wordCount = justification.trim().split(/\s+/).filter(w => w.length > 0).length;
          
          if (relevanceHits >= 1 && wordCount >= 4) {
            xp += 2; // Full bonus: relevant and substantive
          } else if (wordCount >= 6) {
            xp += 1; // Partial: long enough but not clearly relevant
          }
          // else: no bonus — irrelevant or too short
        }
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

    // Play correct/incorrect sound for scorable questions
    if (currentQ.type === "multiple_choice") {
      const isCorrect = answer === currentQ.correctAnswer;
      const isPartial = !isCorrect && (currentQ.partialAnswers || []).includes(answer);
      if (isCorrect) {
        playSound("success");
      } else if (isPartial) {
        playSound("complete");
      } else {
        playSound("error");
      }
    } else if (xp >= 3) {
      playSound("success");
    } else if (xp === 0 && currentQ.type !== "perception") {
      playSound("error");
    }

    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setTabViolation(false);
    tabViolationRef.current = false;
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
          Pular reflexão (+10 Essência base)
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
            <span className="font-bold" style={{ color: `hsl(${themeColor})` }}>+10 ✦</span>
          </div>
          {xpPerQuestion.map((xp, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                {typeIcons[questions[i]?.type] || <Star className="w-4 h-4" />}
                {typeLabels[questions[i]?.type] || "Pergunta"}
              </span>
              <span className="font-bold" style={{ color: `hsl(${themeColor})` }}>+{xp} ✦</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <EssenciaIcon size="md" className="text-accent" />
              Total
            </span>
            <span className="text-2xl font-bold" style={{ color: `hsl(${themeColor})` }}>
              +{finalXp} ✦
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
  const hasAnswer = (() => {
    const ans = answers[currentIdx];
    if (ans === undefined || ans === "" || ans === null) return false;
    // Character questions require justification
    if (currentQ?.type === "character") {
      return typeof ans === "object" && ans?.choice !== undefined && (ans?.justification || "").trim().length >= 15;
    }
    return true;
  })();

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
        <p className="text-lg font-medium leading-relaxed select-none" style={{ WebkitUserSelect: "none", userSelect: "none" }}>{currentQ?.question}</p>

        {/* ─── Renderers per type ─── */}
        {currentQ?.type === "open" && (
          <Textarea
            value={answers[currentIdx] || ""}
            onChange={e => handleAnswer(e.target.value)}
            onPaste={blockPaste}
            placeholder="Escreva sua reflexão..."
            className="min-h-[100px] resize-none"
            disabled={showFeedback || tabViolation}
          />
        )}

        {currentQ?.type === "multiple_choice" && (
          <div className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !showFeedback && !tabViolation && handleAnswer(i)}
                disabled={showFeedback || tabViolation}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showFeedback
                    ? i === currentQ.correctAnswer
                      ? "bg-accent/20 border-accent"
                      : i === answers[currentIdx] && i !== currentQ.correctAnswer
                      ? "bg-destructive/20 border-destructive"
                      : "bg-muted/50 border-border"
                    : tabViolation
                    ? "bg-muted/30 border-border opacity-50 cursor-not-allowed"
                    : answers[currentIdx] === i
                    ? "border-2"
                    : "bg-muted/50 border-border hover:bg-muted"
                }`}
                style={{
                  borderColor: !showFeedback && !tabViolation && answers[currentIdx] === i ? `hsl(${themeColor})` : undefined,
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
                onClick={() => !showFeedback && !tabViolation && handleAnswer(i)}
                disabled={showFeedback || tabViolation}
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
            onPaste={blockPaste}
            placeholder="O que você acha que vai acontecer..."
            className="min-h-[80px] resize-none"
            disabled={showFeedback || tabViolation}
          />
        )}

        {currentQ?.type === "character" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (showFeedback || tabViolation) return;
                    const prev = answers[currentIdx] || {};
                    handleAnswer({ ...prev, choice: i });
                  }}
                  disabled={showFeedback || tabViolation}
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
              onPaste={blockPaste}
              placeholder={currentQ.justifyLabel || "Justifique sua escolha..."}
              className="min-h-[60px] resize-none"
              disabled={showFeedback || tabViolation}
            />
          </div>
        )}

        {currentQ?.type === "theme" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => !showFeedback && !tabViolation && handleAnswer(opt)}
                  disabled={showFeedback || tabViolation}
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
                onPaste={blockPaste as any}
                disabled={showFeedback || tabViolation}
              />
            )}
          </div>
        )}

        {/* Feedback for multiple choice */}
        {showFeedback && currentQ?.type === "multiple_choice" && (() => {
          const selected = answers[currentIdx];
          const isCorrect = selected === currentQ.correctAnswer;
          const isPartial = !isCorrect && (currentQ.partialAnswers || []).includes(selected);
          const xp = xpPerQuestion[currentIdx];
          const correctLetter = String.fromCharCode(65 + currentQ.correctAnswer);
          const correctText = currentQ.options[currentQ.correctAnswer];

          return (
            <div className={`p-4 rounded-lg space-y-2 ${
              isCorrect ? "bg-green-500/10 border border-green-500/20" 
              : isPartial ? "bg-amber-500/10 border border-amber-500/20" 
              : "bg-destructive/10 border border-destructive/20"
            }`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold flex items-center gap-2">
                  {isCorrect ? "🎉 Correto!" : isPartial ? "🔶 Parcialmente certo" : "❌ Resposta incorreta"}
                </p>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                  isCorrect ? "bg-green-500/20 text-green-600" 
                  : isPartial ? "bg-amber-500/20 text-amber-600" 
                  : "bg-destructive/20 text-destructive"
                }`}>
                  +{xp} ✦
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm font-medium">
                  Resposta correta: <span className="font-bold">{correctLetter}. {correctText}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
            </div>
          );
        })()}

        {/* Feedback for open/prediction */}
        {showFeedback && (currentQ?.type === "open" || currentQ?.type === "prediction") && (
          <div className={`p-4 rounded-lg ${xpPerQuestion[currentIdx] === 0 ? "bg-destructive/10" : "bg-accent/10"}`}>
            <p className="font-semibold mb-1 flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
              +{xpPerQuestion[currentIdx]} ✦
            </p>
            <p className="text-sm text-muted-foreground">
              {xpPerQuestion[currentIdx] === 0
                ? "Resposta não reconhecida. Tente escrever uma reflexão real sobre o capítulo."
                : xpPerQuestion[currentIdx] >= 4
                ? "Excelente reflexão! Resposta bem desenvolvida e relevante."
                : xpPerQuestion[currentIdx] >= 2
                ? "Boa reflexão! Tente incluir mais detalhes do capítulo."
                : "Resposta breve. Desenvolva mais para ganhar mais Essência!"}
            </p>
          </div>
        )}

        {/* Feedback for perception */}
        {showFeedback && currentQ?.type === "perception" && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center justify-between">
              <p className="font-semibold flex items-center gap-2">
                ✅ Percepção registrada!
              </p>
              <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ background: `hsl(${themeColor} / 0.15)`, color: `hsl(${themeColor})` }}>
                +{xpPerQuestion[currentIdx]} ✦
              </span>
            </div>
          </div>
        )}

        {/* Feedback for theme */}
        {showFeedback && currentQ?.type === "theme" && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold flex items-center gap-2">
                ✅ Tema identificado!
              </p>
              <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ background: `hsl(${themeColor} / 0.15)`, color: `hsl(${themeColor})` }}>
                +{xpPerQuestion[currentIdx]} ✦
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Boa análise temática! Identificar os temas centrais ajuda a construir uma compreensão mais profunda da obra.
            </p>
          </div>
        )}

        {/* Feedback for character */}
        {showFeedback && currentQ?.type === "character" && (() => {
          const xp = xpPerQuestion[currentIdx];
          const justification = answers[currentIdx]?.justification || "";
          const hasJustification = justification.trim().length > 15;
          const isHighQuality = xp >= 4; // choice (2) + full relevance bonus (2)
          const isPartialQuality = xp === 3; // choice (2) + partial bonus (1)
          const feedbackLevel = isHighQuality ? "excellent" : isPartialQuality ? "partial" : hasJustification ? "irrelevant" : "none";
          
          const feedbackConfig = {
            excellent: { icon: "🎉", title: "Análise completa!", msg: "Excelente! Sua justificativa enriqueceu a análise do personagem. Continue assim!", bg: "bg-green-500/10 border border-green-500/20", badge: "bg-green-500/20 text-green-400" },
            partial: { icon: "👍", title: "Boa tentativa!", msg: "Sua justificativa tem substância, mas tente conectar mais diretamente ao livro e à pergunta.", bg: "bg-yellow-500/10 border border-yellow-500/20", badge: "bg-yellow-500/20 text-yellow-400" },
            irrelevant: { icon: "⚠️", title: "Justificativa insuficiente", msg: "Sua resposta não pareceu relacionada ao livro ou à pergunta. Tente usar elementos do texto para justificar.", bg: "bg-orange-500/10 border border-orange-500/20", badge: "bg-orange-500/20 text-orange-400" },
            none: { icon: "✅", title: "Personagem escolhido!", msg: "Escolha registrada. Na próxima vez, elabore sua justificativa para ganhar mais Essência!", bg: "bg-accent/10 border border-accent/20", badge: "" },
          };
          const fb = feedbackConfig[feedbackLevel];
          
          return (
            <div className={`p-4 rounded-lg space-y-2 ${fb.bg}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold flex items-center gap-2">
                  {fb.icon} {fb.title}
                </p>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${fb.badge}`} style={fb.badge ? undefined : { background: `hsl(${themeColor} / 0.15)`, color: `hsl(${themeColor})` }}>
                  +{xp} ✦
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{fb.msg}</p>
            </div>
          );
        })()}
      </div>

      {/* Tab violation warning */}
      {tabViolation && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive text-sm">Questão anulada — Saída da guia detectada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Para garantir a autenticidade das suas respostas e a integridade da sua evolução como leitor, 
                o BookQuest monitora a atividade durante a reflexão. Consultar fontes externas invalida a questão 
                e você não receberá XP por ela.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action button */}
      {tabViolation && !showFeedback ? (
        <Button
          className="w-full gap-2"
          size="lg"
          variant="outline"
          onClick={handleNext}
        >
          {currentIdx < questions.length - 1 ? (
            <>Pular para próxima questão <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Ver Resultado <Sparkles className="w-4 h-4" /></>
          )}
        </Button>
      ) : !showFeedback ? (
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
