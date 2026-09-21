import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type FeedbackAudience = "aluno" | "professor";

const storageKey = (context: string) => `bq_feedback_${context}`;

/** Returns true when the user has already answered/dismissed this feedback context. */
export const isFeedbackDone = (context: string) => {
  try {
    const stored = localStorage.getItem(storageKey(context));
    if (!stored) return false;
    const timestamp = new Date(stored).getTime();
    if (!Number.isFinite(timestamp)) return false;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp < thirtyDays) return true;
    localStorage.removeItem(storageKey(context));
    return false;
  } catch {
    return false;
  }
};

export const markFeedbackDone = (context: string) => {
  try {
    localStorage.setItem(storageKey(context), new Date().toISOString());
  } catch {
    /* ignore */
  }
};

interface Options {
  /** Delay in ms before the prompt becomes visible. */
  delay?: number;
  /** Only show when true (strategic trigger). */
  enabled?: boolean;
}

export const useFeedback = (context: string, { delay = 0, enabled = true }: Options = {}) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!enabled || !user || isFeedbackDone(context)) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [context, delay, enabled, user]);

  const dismiss = useCallback(() => {
    markFeedbackDone(context);
    setVisible(false);
  }, [context]);

  const submit = useCallback(
    async (rating: number, comment: string, audience: FeedbackAudience) => {
      if (!user) return false;
      setSubmitting(true);
      const { error } = await supabase.from("feedback_entries" as any).insert({
        user_id: user.id,
        audience,
        context,
        rating,
        comment: comment.trim().slice(0, 1000) || null,
        page_path: window.location.pathname,
      } as any);
      setSubmitting(false);
      if (error) return false;

      // Persistimos no Supabase e, quando o projeto tiver o envio por e-mail configurado,
      // encaminhamos uma cópia para o endereço de feedback sem bloquear a experiência.
      void supabase.functions.invoke("send-feedback-email", {
        body: {
          audience,
          context,
          rating,
          comment: comment.trim().slice(0, 1000) || null,
          page_path: window.location.pathname,
        },
      }).catch(() => {});

      markFeedbackDone(context);
      setSubmitted(true);
      setTimeout(() => setVisible(false), 1600);
      return true;
    },
    [context, user]
  );

  return { visible, submitting, submitted, submit, dismiss, setVisible };
};
