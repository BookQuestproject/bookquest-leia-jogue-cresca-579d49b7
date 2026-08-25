import { BookHeart, TrendingUp, Sparkles } from "lucide-react";

const BENEFITS = [
  {
    icon: BookHeart,
    title: "Hábito de leitura",
    description:
      "Constância diária com trilhas guiadas, missões e sequências que transformam leitura em rotina.",
  },
  {
    icon: TrendingUp,
    title: "Evolução no ranking",
    description:
      "Suba de tier a cada Essência conquistada e compare seu progresso com outros leitores.",
  },
  {
    icon: Sparkles,
    title: "Descoberta personalizada",
    description:
      "Receba recomendações de livros alinhadas ao seu gênero literário e ao seu nível de leitura.",
  },
] as const;

const BenefitsSection = () => {
  return (
    <section
      className="w-full py-8 lg:py-10"
      aria-label="Por que ler com o BookQuest"
    >
      <div className="max-w-5xl mx-auto px-1">
        <header className="mb-6 lg:mb-8 text-center lg:text-left">
          <p className="text-xs text-accent font-semibold uppercase tracking-[0.15em] mb-2 flex items-center gap-2 justify-center lg:justify-start">
            <Sparkles className="w-3.5 h-3.5" />
            Por que ler com o BookQuest
          </p>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
            Mais do que ler — evoluir
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl mx-auto lg:mx-0">
            Uma jornada gamificada que constrói hábito, reconhece seu progresso e recomenda o próximo livro ideal.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {BENEFITS.map((benefit) => (
            <article
              key={benefit.title}
              className="group relative rounded-2xl p-5 lg:p-6 bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10"
            >
              {/* Decorative glow */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--accent) / 0.18), transparent 70%)",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-accent/10 border border-accent/20 text-accent">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base lg:text-lg font-serif font-bold text-foreground mb-1.5">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
