import { useState } from "react";
import { Bug, MessageSquareHeart, Send, X } from "lucide-react";
import FeedbackPrompt from "./FeedbackPrompt";
import { FeedbackAudience } from "@/hooks/useFeedback";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  audience?: FeedbackAudience;
}

/** Botão flutuante discreto: feedback livre a qualquer momento. */
export const FeedbackLauncher = ({ audience = "aluno" }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [bugOpen, setBugOpen] = useState(false);
  const [bugText, setBugText] = useState("");
  const [bugSending, setBugSending] = useState(false);
  const [session] = useState(() => `livre_${audience}_${Date.now()}`);

  const sendBug = async () => {
    const message = bugText.trim();
    if (!user || message.length < 5) return;
    setBugSending(true);
    const { error } = await supabase.from("feedback_entries" as any).insert({
      user_id: user.id,
      audience,
      context: `bug_${Date.now()}`,
      rating: 1,
      comment: `BUG: ${message}`.slice(0, 1000),
      page_path: window.location.pathname,
    } as any);

    if (!error) {
      void supabase.functions.invoke("send-feedback-email", {
        body: {
          audience,
          type: "bug",
          context: "bug_report",
          rating: 1,
          comment: message.slice(0, 1000),
          page_path: window.location.pathname,
        },
      }).catch(() => {});
      setBugText("");
      setBugOpen(false);
      setOpen(false);
    }
    setBugSending(false);
  };

  if (open) {
    return (
      <>
        {!bugOpen ? (
          <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl p-3 shadow-xl">
            <div className="flex items-center justify-between gap-3 px-2 pb-2">
              <p className="text-sm font-semibold">Falar com o BookQuest</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              <FeedbackPrompt
                context={session}
                audience={audience}
                variant="inline"
                question="Como está sendo sua experiência no BookQuest agora?"
                className="!border-0 !bg-transparent !shadow-none !p-0"
              />
              <button
                onClick={() => setBugOpen(true)}
                className="w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-left text-xs font-semibold hover:bg-muted/40 transition-colors flex items-center gap-2"
              >
                <Bug className="h-4 w-4 text-destructive" />
                Relatar um problema
              </button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Encontrou um problema?</p>
                <p className="text-xs text-muted-foreground mt-1">Descreva o que aconteceu para a equipe investigar.</p>
              </div>
              <button onClick={() => setBugOpen(false)} aria-label="Voltar" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <textarea
              value={bugText}
              onChange={(e) => setBugText(e.target.value.slice(0, 1000))}
              rows={5}
              placeholder="Ex.: cliquei no capítulo 3 e nada aconteceu..."
              className="mt-3 w-full rounded-xl border border-border/60 bg-background/50 p-3 text-sm outline-none focus:border-accent/50 resize-none"
            />
            <button
              onClick={() => void sendBug()}
              disabled={bugSending || bugText.trim().length < 5}
              className="mt-3 w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {bugSending ? "Enviando..." : "Enviar problema"}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Falar com o BookQuest"
      className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 h-11 px-4 rounded-full border border-accent/40 bg-card/85 backdrop-blur-xl text-xs font-semibold text-foreground shadow-lg hover:bg-accent/15 transition-colors flex items-center gap-2"
    >
      <MessageSquareHeart className="h-4 w-4 text-accent" />
      Falar com a gente
    </button>
  );
};

export default FeedbackLauncher;
