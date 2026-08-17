import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Sparkles, ClipboardCheck, Shuffle, ArrowRight, Crown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { nacionalWorks } from "@/data/nacional/pagadorDePromessas";
import { useNacionalProgress } from "@/hooks/useNacionalProgress";

const features = [
  { icon: BookOpen, title: "Trilha por partes", desc: "Resumo, detalhes de prova, interpretação e verificação de leitura." },
  { icon: GraduationCap, title: "Modo Professor", desc: "Perguntas como o professor faria — do fácil ao nível pegadinha." },
  { icon: Shuffle, title: "Pergunta Aleatória", desc: "Um sorteio só dentro do que você já leu. Sem spoiler." },
  { icon: ClipboardCheck, title: "Modo Prova", desc: "Simulado completo com desempenho por área de conhecimento." },
  { icon: Sparkles, title: "Ágata IA", desc: "Tutora que responde suas dúvidas respeitando o seu progresso." },
];

const NacionalHub = () => {
  const work = nacionalWorks[0];
  const { progress } = useNacionalProgress(work.id);
  const pct = Math.round((progress.completedParts.length / work.parts.length) * 100);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent border border-accent/30 bg-accent/10 px-3 py-1 rounded-full">
              <GraduationCap className="w-3.5 h-3.5" /> BookQuest Nacional
            </span>
            <h1 className="mt-4 font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Chegue na prova sabendo <span className="text-accent">exatamente</span> o que caiu no livro.
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
              Área exclusiva para alunos do Colégio Nacional. Leitura guiada, verificação real de compreensão e simulados
              da obra cobrada em sala.
            </p>
          </div>
        </section>

        {/* Obra em destaque */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Obra em destaque</h2>
          <Link
            to={`/nacional/${work.id}`}
            className="group block rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start gap-5">
              <div className="w-20 h-28 md:w-24 md:h-32 shrink-0 rounded-xl bg-primary grid place-items-center border border-border">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground">{work.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {work.author} · {work.year} · {work.genre}
                </p>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{work.synopsis}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Seu progresso</span>
                    <span className="font-bold text-accent">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Abrir obra <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* Recursos */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 grid place-items-center mb-3">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Premium */}
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <Crown className="w-8 h-8 text-accent shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground">BookQuest Nacional Premium — R$ 19,90/mês</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As duas primeiras partes são gratuitas. Com o Premium você libera a obra completa, o Modo Prova, o Modo
              Professor em todos os níveis e a Ágata sem limites.
            </p>
          </div>
          <Link
            to="/premium"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:brightness-105 transition"
          >
            Assinar
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default NacionalHub;
