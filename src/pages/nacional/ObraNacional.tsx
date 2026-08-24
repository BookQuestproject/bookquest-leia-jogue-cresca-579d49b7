import { Link, useParams, Navigate } from "react-router-dom";
import {
  BookOpen, Lock, Check, GraduationCap, Shuffle, ClipboardCheck, ArrowRight, Users, Target, Play,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import AgataTutora from "@/components/nacional/AgataTutora";
import { getWork, categoryMeta, type QuestionCategory } from "@/data/nacional/pagadorDePromessas";
import { useNacionalProgress } from "@/hooks/useNacionalProgress";
import { useProfile } from "@/hooks/useProfile";

const ObraNacional = () => {
  const { workId } = useParams();
  const work = getWork(workId ?? "");
  const { profile } = useProfile();
  const isPremium = !!profile?.is_premium;
  const { progress } = useNacionalProgress(work?.id ?? "none");

  if (!work) return <Navigate to="/nacional" replace />;

  const done = progress.completedParts;
  const pct = Math.round((done.length / work.parts.length) * 100);
  const lastPart = work.parts.filter((p) => done.includes(p.id)).slice(-1)[0];
  const progressLabel = lastPart ? `${lastPart.act} — ${lastPart.title}` : "ainda não iniciou a leitura";
  const contextSummary = work.parts
    .filter((p) => done.includes(p.id))
    .map((p) => `• ${p.act} — ${p.title}: ${p.summary.join(" ")}`)
    .join("\n") || "O aluno ainda não concluiu nenhuma parte. Fale apenas de contexto geral do autor e do gênero.";

  const isUnlocked = (partId: number) => isPremium || partId <= work.freeParts;

  // First part the user hasn't completed yet, or part 1 if all done
  const nextPartId =
    work.parts.find((p) => !done.includes(p.id))?.id ?? work.parts[0].id;

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-6">
        <Link to="/nacional" className="text-xs text-muted-foreground hover:text-foreground">
          ← BookQuest Nacional
        </Link>

        {/* Cabeçalho da obra */}
        <section className="rounded-3xl border border-border bg-card p-5 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-32 shrink-0 rounded-xl bg-primary grid place-items-center border border-border">
              <BookOpen className="w-9 h-9 text-accent" />
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground">{work.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {work.author} · {work.year} · {work.genre}
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">{work.synopsis}</p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    {done.length} de {work.parts.length} partes concluídas
                  </span>
                  <span className="font-bold text-accent">{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Link
                to={`/nacional/${work.id}/parte/${nextPartId}`}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:brightness-105 transition shadow-[0_0_22px_hsl(var(--accent)/0.35)]"
              >
                <Play className="w-4 h-4 fill-current" />
                {done.length === 0 ? "Começar leitura" : "Continuar"}
              </Link>
            </div>
          </div>
        </section>

        {/* Modos */}
        <section className="grid gap-3 sm:grid-cols-3">
          <Link
            to={`/nacional/${work.id}/professor`}
            className="rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors"
          >
            <GraduationCap className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-bold text-foreground">Modo Professor</h3>
            <p className="text-xs text-muted-foreground mt-1">Perguntas por nível de dificuldade.</p>
          </Link>
          <Link
            to={`/nacional/${work.id}/professor?aleatoria=1`}
            className="rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors"
          >
            <Shuffle className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-bold text-foreground">Pergunta Aleatória</h3>
            <p className="text-xs text-muted-foreground mt-1">Sorteio só do que você já leu.</p>
          </Link>
          <Link
            to={`/nacional/${work.id}/prova`}
            className="rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-colors"
          >
            <ClipboardCheck className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-bold text-foreground">Modo Prova</h3>
            <p className="text-xs text-muted-foreground mt-1">Simulado completo com relatório.</p>
          </Link>
        </section>

        {/* Desempenho por área */}
        {progress.answered > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              <Target className="w-4 h-4" /> Seu desempenho
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(categoryMeta) as QuestionCategory[]).map((c) => {
                const s = progress.scores[c] ?? { correct: 0, total: 0 };
                const p = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={c} className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">
                      {categoryMeta[c].emoji} {categoryMeta[c].label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">{p}%</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.correct}/{s.total} acertos
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Partes */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Trilha da obra</h2>
          <div className="space-y-2.5">
            {work.parts.map((part) => {
              const unlocked = isUnlocked(part.id);
              const completed = done.includes(part.id);
              const Wrapper: any = unlocked ? Link : "div";
              return (
                <Wrapper
                  key={part.id}
                  {...(unlocked ? { to: `/nacional/${work.id}/parte/${part.id}` } : {})}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                    unlocked ? "border-border bg-card hover:border-accent/40" : "border-border/60 bg-card/50 opacity-70"
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center font-bold ${
                      completed
                        ? "bg-accent text-accent-foreground"
                        : unlocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {completed ? <Check className="w-5 h-5" /> : unlocked ? part.id : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-widest text-accent font-bold">{part.act}</p>
                    <p className="font-semibold text-foreground truncate">{part.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{part.subtitle}</p>
                  </div>
                  {unlocked ? (
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Link
                      to="/premium"
                      className="text-[11px] font-bold text-accent border border-accent/30 bg-accent/10 px-2.5 py-1 rounded-full shrink-0"
                    >
                      Premium
                    </Link>
                  )}
                </Wrapper>
              );
            })}
          </div>
        </section>

        {/* Personagens e temas */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              <Users className="w-4 h-4" /> Personagens
            </h2>
            <ul className="space-y-2.5">
              {work.characters.map((c) => (
                <li key={c.name} className="text-sm">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className="text-muted-foreground"> — {c.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Temas centrais</h2>
            <div className="flex flex-wrap gap-2">
              {work.themes.map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <AgataTutora
        workTitle={work.title}
        workAuthor={work.author}
        progressLabel={progressLabel}
        contextSummary={contextSummary}
      />
    </Layout>
  );
};

export default ObraNacional;
