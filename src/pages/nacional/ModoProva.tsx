import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ClipboardCheck, Trophy, RotateCcw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/nacional/QuestionCard";
import {
  getWork, categoryMeta, type QuestionCategory, type NacionalQuestion,
} from "@/data/nacional/pagadorDePromessas";
import { useNacionalProgress } from "@/hooks/useNacionalProgress";
import { useProfile } from "@/hooks/useProfile";

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

const ModoProva = () => {
  const { workId } = useParams();
  const work = getWork(workId ?? "");
  const { profile } = useProfile();
  const isPremium = !!profile?.is_premium;
  const { registerAnswer, registerExam } = useNacionalProgress(work?.id ?? "none");

  const [started, setStarted] = useState(false);
  const [exam, setExam] = useState<NacionalQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const available = useMemo(() => (work ? work.parts.flatMap((p) => p.questions) : []), [work]);

  if (!work) return <Navigate to="/nacional" replace />;

  const start = () => {
    setExam(shuffle(available).slice(0, 15));
    setIndex(0);
    setAnswers({});
    setDone(false);
    setStarted(true);
  };

  const finish = (final: Record<string, number>) => {
    const hits = exam.filter((q) => final[q.id] === q.answer).length;
    registerExam(hits, exam.length);
    setDone(true);
  };

  const current = exam[index];

  const byCategory = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    exam.forEach((q) => {
      const c = (map[q.category] ??= { correct: 0, total: 0 });
      c.total += 1;
      if (answers[q.id] === q.answer) c.correct += 1;
    });
    return map;
  }, [exam, answers]);

  const hits = exam.filter((q) => answers[q.id] === q.answer).length;

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-5 max-w-3xl mx-auto">
        <Link to={`/nacional/${work.id}`} className="text-xs text-muted-foreground hover:text-foreground">
          ← {work.title}
        </Link>

        {!started && (
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            <ClipboardCheck className="w-10 h-10 text-accent mx-auto mb-3" />
            <h1 className="font-serif text-2xl font-bold text-foreground">Modo Prova</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
              15 questões sorteadas de toda a obra, sem feedback durante o simulado. No final você recebe o relatório por
              área: história, personagens, detalhes e interpretação.
            </p>
            {!isPremium ? (
              <>
                <p className="text-xs text-muted-foreground mt-4">
                  O Modo Prova faz parte do Nacional Premium (R$ 19,90/mês).
                </p>
                <Button asChild className="mt-4">
                  <Link to="/premium">Liberar Modo Prova</Link>
                </Button>
              </>
            ) : (
              <Button className="mt-5" onClick={start}>
                Iniciar simulado
              </Button>
            )}
          </section>
        )}

        {started && !done && current && (
          <>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(index / exam.length) * 100}%` }}
              />
            </div>
            <QuestionCard
              key={current.id}
              question={current}
              instantFeedback={false}
              selected={answers[current.id] ?? null}
              index={index}
              total={exam.length}
              onAnswer={(i, ok) => {
                const next = { ...answers, [current.id]: i };
                setAnswers(next);
                registerAnswer(current.category, ok);
                setTimeout(() => {
                  if (index + 1 < exam.length) setIndex(index + 1);
                  else finish(next);
                }, 250);
              }}
            />
          </>
        )}

        {done && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
              <Trophy className="w-10 h-10 text-accent mx-auto mb-3" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {hits} / {exam.length}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((hits / exam.length) * 100)}% de acerto neste simulado.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(byCategory).map(([cat, s]) => {
                const meta = categoryMeta[cat as QuestionCategory];
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={cat} className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">
                      {meta.emoji} {meta.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{pct}%</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.correct}/{s.total} acertos
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Gabarito comentado</h3>
              {exam.map((q) => {
                const ok = answers[q.id] === q.answer;
                return (
                  <div key={q.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-foreground">{q.text}</p>
                    <p className={`text-xs mt-1 ${ok ? "text-emerald-400" : "text-destructive"}`}>
                      {ok ? "Acertou" : `Resposta certa: ${q.options[q.answer]}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1" onClick={start}>
                <RotateCcw className="w-4 h-4 mr-1" /> Novo simulado
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to={`/nacional/${work.id}`}>Voltar à obra</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ModoProva;
