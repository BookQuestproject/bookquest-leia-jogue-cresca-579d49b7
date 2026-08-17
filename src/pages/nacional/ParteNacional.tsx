import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BookOpen, ListChecks, Brain, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import QuestionCard from "@/components/nacional/QuestionCard";
import AgataTutora from "@/components/nacional/AgataTutora";
import { getWork } from "@/data/nacional/pagadorDePromessas";
import { useNacionalProgress } from "@/hooks/useNacionalProgress";
import { useProfile } from "@/hooks/useProfile";

type Step = "resumo" | "detalhes" | "interpretacao" | "verificacao";

const steps: { id: Step; label: string; icon: typeof BookOpen }[] = [
  { id: "resumo", label: "Resumo", icon: BookOpen },
  { id: "detalhes", label: "Detalhes", icon: ListChecks },
  { id: "interpretacao", label: "Interpretação", icon: Brain },
  { id: "verificacao", label: "Você leu mesmo?", icon: CheckCircle2 },
];

const ParteNacional = () => {
  const { workId, partId } = useParams();
  const navigate = useNavigate();
  const work = getWork(workId ?? "");
  const part = work?.parts.find((p) => p.id === Number(partId));
  const { profile } = useProfile();
  const isPremium = !!profile?.is_premium;
  const { progress, completePart, registerAnswer } = useNacionalProgress(work?.id ?? "none");

  const [step, setStep] = useState<Step>("resumo");
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});

  if (!work || !part) return <Navigate to="/nacional" replace />;
  if (!isPremium && part.id > work.freeParts) return <Navigate to={`/nacional/${work.id}`} replace />;

  const questions = part.questions;
  const currentQ = questions[qIndex];

  const handleAnswer = (_i: number, isCorrect: boolean) => {
    registerAnswer(currentQ.category, isCorrect);
    if (isCorrect) setCorrect((c) => c + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
    } else {
      completePart(part.id);
      setFinished(true);
    }
  };

  const nextPart = work.parts.find((p) => p.id === part.id + 1);
  const doneParts = progress.completedParts;
  const lastDone = work.parts.filter((p) => doneParts.includes(p.id)).slice(-1)[0];
  const progressLabel = `${part.act} — ${part.title}`;
  const contextSummary = work.parts
    .filter((p) => p.id <= part.id)
    .map((p) => `• ${p.act} — ${p.title}: ${p.summary.join(" ")}`)
    .join("\n");

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-5 max-w-3xl mx-auto">
        <Link to={`/nacional/${work.id}`} className="text-xs text-muted-foreground hover:text-foreground">
          ← {work.title}
        </Link>

        <header>
          <p className="text-[11px] uppercase tracking-widest text-accent font-bold">
            {part.act} · Parte {part.id}
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-1">{part.title}</h1>
          <p className="text-sm text-muted-foreground">{part.subtitle}</p>
        </header>

        {/* Passos */}
        <nav className="grid grid-cols-4 gap-1.5">
          {steps.map((s) => {
            const active = step === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="text-center leading-tight">{s.label}</span>
              </button>
            );
          })}
        </nav>

        {step === "resumo" && (
          <section className="rounded-2xl border border-border bg-card p-5 md:p-6 space-y-3">
            {part.summary.map((p, i) => (
              <p key={i} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            <Button className="w-full mt-2" onClick={() => setStep("detalhes")}>
              Ver detalhes que caem na prova <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </section>
        )}

        {step === "detalhes" && (
          <section className="space-y-2.5">
            {part.details.map((d) => (
              <div key={d.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-accent mb-1">{d.label}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.text}</p>
              </div>
            ))}
            <Button className="w-full" onClick={() => setStep("interpretacao")}>
              Ir para interpretação <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </section>
        )}

        {step === "interpretacao" && (
          <section className="space-y-3">
            {part.interpretation.map((q, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm md:text-base font-medium text-foreground leading-snug">{q.question}</p>
                <p className="flex items-start gap-2 text-xs text-muted-foreground mt-2">
                  <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  {q.hint}
                </p>
                <Textarea
                  value={notes[i] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [i]: e.target.value }))}
                  placeholder="Escreva sua resposta com suas palavras..."
                  className="mt-3 min-h-[100px] text-sm"
                />
              </div>
            ))}
            <Button className="w-full" onClick={() => setStep("verificacao")}>
              Testar se eu li mesmo <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </section>
        )}

        {step === "verificacao" && (
          <section>
            {!finished ? (
              <QuestionCard
                key={currentQ.id}
                question={currentQ}
                index={qIndex}
                total={questions.length}
                onAnswer={handleAnswer}
                onNext={handleNext}
                nextLabel={qIndex + 1 < questions.length ? "Próxima" : "Concluir parte"}
              />
            ) : (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
                <h2 className="font-serif text-xl font-bold text-foreground">Parte concluída</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Você acertou {correct} de {questions.length}.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-5">
                  {nextPart && (isPremium || nextPart.id <= work.freeParts) ? (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        navigate(`/nacional/${work.id}/parte/${nextPart.id}`);
                        setStep("resumo");
                        setQIndex(0);
                        setCorrect(0);
                        setFinished(false);
                      }}
                    >
                      Próxima parte
                    </Button>
                  ) : nextPart ? (
                    <Button className="flex-1" onClick={() => navigate("/premium")}>
                      Liberar próxima parte
                    </Button>
                  ) : (
                    <Button className="flex-1" onClick={() => navigate(`/nacional/${work.id}/prova`)}>
                      Fazer o Modo Prova
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/nacional/${work.id}`)}>
                    Voltar à obra
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <AgataTutora
        workTitle={work.title}
        workAuthor={work.author}
        progressLabel={lastDone ? `${lastDone.act} — ${lastDone.title}` : progressLabel}
        contextSummary={contextSummary}
      />
    </Layout>
  );
};

export default ParteNacional;
