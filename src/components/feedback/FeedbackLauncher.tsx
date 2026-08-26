import { useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import FeedbackPrompt from "./FeedbackPrompt";
import { FeedbackAudience } from "@/hooks/useFeedback";

interface Props {
  audience?: FeedbackAudience;
}

/** Botão flutuante discreto: feedback livre a qualquer momento. */
export const FeedbackLauncher = ({ audience = "aluno" }: Props) => {
  const [open, setOpen] = useState(false);
  // contexto único por abertura para permitir vários envios
  const [session] = useState(() => `livre_${audience}_${Date.now()}`);

  if (open) {
    return (
      <FeedbackPrompt
        context={session}
        audience={audience}
        variant="floating"
        question="Como está sendo sua experiência no BookQuest agora?"
      />
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Enviar feedback"
      className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 h-11 px-4 rounded-full border border-accent/40 bg-card/85 backdrop-blur-xl text-xs font-semibold text-foreground shadow-lg hover:bg-accent/15 transition-colors flex items-center gap-2"
    >
      <MessageSquareHeart className="h-4 w-4 text-accent" />
      Feedback
    </button>
  );
};

export default FeedbackLauncher;
