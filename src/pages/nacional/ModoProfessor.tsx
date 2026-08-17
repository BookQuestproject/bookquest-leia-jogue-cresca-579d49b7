import { useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { GraduationCap, Shuffle, Lock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/nacional/QuestionCard";
import AgataTutora from "@/components/nacional/AgataTutora";
import { getWork, levelMeta, type QuestionLevel, type NacionalQuestion } from "@/data/nacional/pagadorDePromessas";
import { useNacionalProgress } from "@/hooks/useNacionalProgress";
import { useProfile } from "@/hooks/useProfile";

const levels: QuestionLevel[] = ["facil", "medio", "dificil", "professor"];

const ModoProfessor = () => {
  const { workId } = useParams();
  const [params] = useSearchParams();
  const randomMode = params.get("aleatoria") === "1";
  const work = getWork(workId ?? "");
  const { profile } = useProfile();
  const isPremium = !!profile?.is_premium;
  const { progress, registerAnswer } = useNacionalProgress(work?.id ?? "none");

  const [level, setLevel] = useState<QuestionLevel | "todos">("todos");
  const [current, setCurrent] = useState<NacionalQuestion | null>(null);
  const [stats, setStats] = useState({ asked: 0, hit: 0 });

  const readParts = progress.completedParts;

  const pool = useMemo(() => {
    if (!work) return [];
    const unlocked = work.parts.filter(
      (p) => readParts.includes(p.id) || (readParts.length === 0 && p.id === 1),
    );
    let qs = unlocked.flatMap((p) => p.questions);
    if (!isPremium) qs = qs.filter((q) => q.level === "facil" || q.level === "medio");
    if (level !== "todos") qs = qs.filter((q) => q.level === level);
    return qs;
  }, [work, readParts, level, isPremium]);

  if (!work) return <Navigate to="/nacional" replace />;

  const draw = () => {
    const candidates = pool.filter((q) => q.id !== current?.id);
    const list = candidates.length ? candidates : pool;
    if (!list.length) return;
    setCurrent(list[Math.floor(Math.random() * list.length)]);
  };

  const contextSummary = work.parts
    .filter((p) => readParts.includes(p.id))
    .map((p) => `• ${p.act} — ${p.title}: ${p.summary.join(" ")}`)
    .join("\n") || "O aluno ainda não concluiu nenhuma parte.";
  const lastDone = work.parts.filter((p) => readParts.includes(p.id)).slice(-1)[0];

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-5 max-w-3xl mx-auto">
        <Link to={`/nacional/${work.id}`} className="text-xs text-muted-foreground hover:text-foreground">
          ← {work.title}
        </Link>

        <header className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/10 grid place-items-center">
              {randomMode ? <Shuffle className="w-5 h-5 text-accent" /> : <GraduationCap className="w-5 h-5 text-accent" />}
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                {randomMode ? "Pergunta Aleatória" : "Modo Professor"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {randomMode
                  ? "Sorteio dentro do que você já leu — sem spoilers."
                  : "O professor pergunta. Você responde na hora."}
              </p>
            </div>
          </div>
          {stats.asked > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Nesta sessão: <span className="text-accent font-bold">{stats.hit}</span> acertos em {stats.asked} perguntas.
            </p>
          )}
        </header>

        {!randomMode && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setLevel("todos");
                setCurrent(null);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                level === "todos" ? "border-accent/50 bg-accent/10 text-accent" : "border-border text-muted-foreground"
              }`}
            >
              Todos os níveis
            </button>
            {levels.map((l) => {
              const locked = !isPremium && (l === "dificil" || l === "professor");
              return (
                <button
                  key={l}
                  onClick={() => {
                    if (locked) return;
                    setLevel(l);
                    setCurrent(null);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    level === l ? levelMeta[l].className : "border-border text-muted-foreground"
                  } ${locked ? "opacity-50" : ""}`}
                >
                  {locked ? <Lock className="w-3 h-3" /> : <span>{levelMeta[l].emoji}</span>}
                  {levelMeta[l].label}
                </button>
              );
            })}
          </div>
        )}

        {pool.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma pergunta disponível nesse filtro ainda. Avance na trilha da obra para liberar mais.
            </p>
            <Button asChild className="mt-4">
              <Link to={`/nacional/${work.id}`}>Voltar à trilha</Link>
            </Button>
          </div>
        ) : !current ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {pool.length} perguntas disponíveis com base na sua leitura.
            </p>
            <Button className="mt-4 w-full sm:w-auto" onClick={draw}>
              {randomMode ? "Sortear pergunta" : "Começar"}
            </Button>
          </div>
        ) : (
          <QuestionCard
            key={current.id}
            question={current}
            onAnswer={(_i, ok) => {
              registerAnswer(current.category, ok);
              setStats((s) => ({ asked: s.asked + 1, hit: s.hit + (ok ? 1 : 0) }));
            }}
            onNext={draw}
            nextLabel={randomMode ? "Sortear outra" : "Próxima pergunta"}
          />
        )}

        {!isPremium && (
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground">
            Níveis <strong className="text-foreground">Difícil</strong> e{" "}
            <strong className="text-foreground">Professor</strong> fazem parte do Nacional Premium (R$ 19,90/mês).{" "}
            <Link to="/premium" className="text-accent font-bold">
              Liberar
            </Link>
          </div>
        )}
      </div>

      <AgataTutora
        workTitle={work.title}
        workAuthor={work.author}
        progressLabel={lastDone ? `${lastDone.act} — ${lastDone.title}` : "ainda não iniciou a leitura"}
        contextSummary={contextSummary}
      />
    </Layout>
  );
};

export default ModoProfessor;
