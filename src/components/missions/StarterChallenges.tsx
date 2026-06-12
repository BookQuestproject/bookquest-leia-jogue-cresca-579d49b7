import { useEffect, useMemo, useState } from "react";
import { Sparkles, CheckCircle, BookOpen, Library, Users, MessageSquare, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import EssenciaIcon from "@/components/EssenciaIcon";

const STORAGE_KEY = "bookquest:starter-challenges:done";

interface StarterChallenge {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  essencia: number;
  cta: string;
  to: string;
}

const STARTER_CHALLENGES: StarterChallenge[] = [
  { id: "starter-quiz",      title: "Faça o Quiz Literário",       description: "Descubra seu perfil de leitor e receba recomendações personalizadas.", icon: Target,        essencia: 30, cta: "Fazer quiz",       to: "/quiz-literario" },
  { id: "starter-trail",     title: "Escolha sua primeira trilha", description: "Entre na biblioteca e adicione uma trilha de leitura ao seu acervo.", icon: Library,       essencia: 25, cta: "Ver biblioteca",  to: "/biblioteca" },
  { id: "starter-chapter",   title: "Leia seu primeiro capítulo",  description: "Inicie a leitura de um capítulo em qualquer trilha ativa.",          icon: BookOpen,      essencia: 40, cta: "Minhas trilhas",  to: "/trilhas" },
  { id: "starter-community", title: "Entre em uma comunidade",      description: "Junte-se à comunidade de um dos livros das suas trilhas.",           icon: Users,         essencia: 20, cta: "Comunidades",     to: "/espaco-literario" },
  { id: "starter-post",      title: "Publique seu primeiro post",   description: "Compartilhe uma reflexão ou impressão sobre o que está lendo.",      icon: MessageSquare, essencia: 35, cta: "Publicar",        to: "/espaco-literario" },
];

function loadDone(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveDone(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

const StarterChallenges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState<Set<string>>(() => loadDone());

  // Show only during the first 14 days after sign-up
  const isNew = useMemo(() => {
    if (!user?.created_at) return true;
    const ageDays = (Date.now() - new Date(user.created_at).getTime()) / 86_400_000;
    return ageDays <= 14;
  }, [user?.created_at]);

  useEffect(() => { saveDone(done); }, [done]);

  if (!isNew) return null;

  const completedCount = STARTER_CHALLENGES.filter(c => done.has(c.id)).length;
  if (completedCount === STARTER_CHALLENGES.length) return null;

  const handleAction = (c: StarterChallenge) => {
    setDone(prev => {
      const next = new Set(prev);
      next.add(c.id);
      return next;
    });
    navigate(c.to);
  };

  return (
    <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-card p-5 space-y-4 animate-fade-in">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Primeiros Passos</h2>
            <p className="text-xs text-muted-foreground">5 desafios para começar com tudo no BookQuest</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{completedCount}/{STARTER_CHALLENGES.length}</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {STARTER_CHALLENGES.map(c => {
          const Icon = c.icon;
          const isDone = done.has(c.id);
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-3 flex items-start gap-3 transition-all ${
                isDone
                  ? "bg-accent/5 border-accent/30 opacity-70"
                  : "bg-card border-border/60 hover:border-accent/40"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDone ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
              }`}>
                {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] flex items-center gap-1 text-accent font-semibold">
                    +{c.essencia} <EssenciaIcon size="xs" />
                  </span>
                  {!isDone && (
                    <button
                      onClick={() => handleAction(c)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      {c.cta} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StarterChallenges;
