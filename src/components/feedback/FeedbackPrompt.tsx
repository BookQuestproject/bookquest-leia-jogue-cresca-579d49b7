import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFeedback, FeedbackAudience } from "@/hooks/useFeedback";

const FACES = [
  { value: 1, emoji: "😞", label: "Ruim" },
  { value: 2, emoji: "🙁", label: "Fraco" },
  { value: 3, emoji: "😐", label: "Ok" },
  { value: 4, emoji: "🙂", label: "Bom" },
  { value: 5, emoji: "🤩", label: "Ótimo" },
];

interface Props {
  /** Unique id of the moment being evaluated, e.g. "aluno_home". */
  context: string;
  question: string;
  audience?: FeedbackAudience;
  /** Only render when true (strategic trigger). */
  enabled?: boolean;
  delay?: number;
  /** "inline" sits in the page flow, "floating" docks bottom-right. */
  variant?: "inline" | "floating";
  className?: string;
}

export const FeedbackPrompt = ({
  context,
  question,
  audience = "aluno",
  enabled = true,
  delay = 0,
  variant = "inline",
  className,
}: Props) => {
  const { visible, submitting, submitted, submit, dismiss } = useFeedback(context, { delay, enabled });
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  if (!visible) return null;

  const handlePick = async (value: number) => {
    setRating(value);
    // Notas altas: envio imediato (rápido). Notas baixas: pede detalhe.
    if (value >= 4) await submit(value, comment, audience);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-4 shadow-lg animate-fade-in",
        variant === "floating" &&
          "fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 w-[min(22rem,calc(100vw-2rem))]",
        className
      )}
      role="region"
      aria-label="Feedback rápido"
    >
      {submitted ? (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground py-1">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          Obrigado! Seu feedback ajuda muito. 💛
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground pr-2">{question}</p>
            <button
              onClick={dismiss}
              aria-label="Dispensar feedback"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            {FACES.map(f => (
              <button
                key={f.value}
                onClick={() => handlePick(f.value)}
                disabled={submitting}
                aria-label={f.label}
                className={cn(
                  "flex-1 h-11 rounded-xl border text-xl transition-all hover:scale-[1.06]",
                  rating === f.value
                    ? "border-accent bg-accent/15"
                    : "border-border/60 bg-background/40 hover:border-accent/50"
                )}
              >
                {f.emoji}
              </button>
            ))}
          </div>

          {rating !== null && rating <= 3 && (
            <div className="mt-3 space-y-2">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, 1000))}
                placeholder="O que podemos melhorar? (opcional)"
                rows={3}
                className="w-full rounded-xl bg-background/50 border border-border/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-accent/50 resize-none"
              />
              <Button
                size="sm"
                onClick={() => submit(rating, comment, audience)}
                disabled={submitting}
                className="w-full gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Enviar feedback
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedbackPrompt;
