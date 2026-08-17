import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { levelMeta, categoryMeta, type NacionalQuestion } from "@/data/nacional/pagadorDePromessas";

interface Props {
  question: NacionalQuestion;
  /** quando false, não mostra explicação até o fim (Modo Prova) */
  instantFeedback?: boolean;
  selected?: number | null;
  onAnswer: (index: number, isCorrect: boolean) => void;
  onNext?: () => void;
  nextLabel?: string;
  index?: number;
  total?: number;
}

const QuestionCard = ({
  question,
  instantFeedback = true,
  selected: controlled,
  onAnswer,
  onNext,
  nextLabel = "Próxima",
  index,
  total,
}: Props) => {
  const [local, setLocal] = useState<number | null>(null);
  const selected = controlled !== undefined ? controlled : local;
  const answered = selected !== null && selected !== undefined;

  const handleSelect = (i: number) => {
    if (answered) return;
    if (controlled === undefined) setLocal(i);
    onAnswer(i, i === question.answer);
  };

  const lvl = levelMeta[question.level];
  const cat = categoryMeta[question.category];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", lvl.className)}>
          {lvl.emoji} {lvl.label}
        </span>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-border text-muted-foreground">
          {cat.emoji} {cat.label}
        </span>
        {index !== undefined && total !== undefined && (
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {index + 1} / {total}
          </span>
        )}
      </div>

      <p className="text-base md:text-lg font-medium text-foreground leading-snug mb-5">{question.text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer;
          const isPicked = selected === i;
          const reveal = answered && instantFeedback;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm",
                "disabled:cursor-default",
                reveal && isCorrect && "border-emerald-400/50 bg-emerald-400/10 text-foreground",
                reveal && isPicked && !isCorrect && "border-destructive/50 bg-destructive/10 text-foreground",
                !reveal && isPicked && "border-accent/60 bg-accent/10 text-foreground",
                !answered && "border-border bg-muted/20 hover:border-accent/40 hover:bg-muted/40 text-foreground",
                answered && !isPicked && !(reveal && isCorrect) && "border-border/50 text-muted-foreground",
              )}
            >
              <span className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-current/40 grid place-items-center text-[10px] font-bold">
                  {reveal && isCorrect ? (
                    <Check className="w-3 h-3" />
                  ) : reveal && isPicked ? (
                    <X className="w-3 h-3" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="leading-snug">{opt}</span>
              </span>
            </button>
          );
        })}
      </div>

      {answered && instantFeedback && (
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-accent mb-1">
            {selected === question.answer ? "Correto" : "Não é isso"}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {answered && onNext && (
        <Button onClick={onNext} className="w-full mt-4">
          {nextLabel}
        </Button>
      )}
    </div>
  );
};

export default QuestionCard;
