import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  workTitle: string;
  workAuthor: string;
  /** até onde o aluno leu (nome da parte) — a Ágata não passa disso */
  progressLabel: string;
  contextSummary: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Por que o padre não deixa a cruz entrar?",
  "Explique o sincretismo na obra",
  "Qual o papel de Rosa na história?",
];

const AgataTutora = ({ workTitle, workAuthor, progressLabel, contextSummary }: Props) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agata-tutor", {
        body: {
          messages: next,
          workTitle,
          workAuthor,
          progressLabel,
          contextSummary,
        },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data?.reply || "Não consegui responder agora." }]);
    } catch (e) {
      setMessages([
        ...next,
        { role: "assistant", content: "Tive um problema para responder agora. Tenta de novo em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-lg hover:brightness-105 transition"
      >
        <Sparkles className="w-4 h-4" />
        Ágata
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-20 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[380px] z-50 rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[70vh]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/15 grid place-items-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">Ágata</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tutora · sem spoilers</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Oi! Sou a Ágata. Pergunte o que quiser sobre <span className="text-foreground font-medium">{workTitle}</span> —
              respondo até onde você leu ({progressLabel}).
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent/15 border border-accent/25 px-3 py-2 text-sm text-foreground"
                : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-muted/40 border border-border px-3 py-2 text-sm text-foreground whitespace-pre-wrap leading-relaxed"
            }
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ágata está pensando...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-border flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre a obra..."
          className="text-sm"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default AgataTutora;
