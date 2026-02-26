import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Flame, Brain, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate("/quiz-onboarding");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,8%)] text-white overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(217,91%,53%,0.06)] via-transparent to-[hsl(217,91%,53%,0.03)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(217,91%,53%,0.04)] blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          {/* Logo */}
          <div className="mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[hsl(217,91%,53%)] flex items-center justify-center shadow-lg shadow-[hsl(217,91%,53%,0.25)]">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">
                Book<span className="text-[hsl(217,91%,53%)]">Quest</span>
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight max-w-3xl mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Transforme sua leitura
            <br />
            <span className="text-[hsl(217,91%,53%)]">em uma jornada.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[hsl(215,16%,57%)] max-w-xl mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Descubra seu perfil literário e evolua através de desafios, rankings e constância.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-[hsl(217,91%,53%)] hover:bg-[hsl(224,76%,48%)] text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-[hsl(217,91%,53%,0.3)] transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(217,91%,53%,0.4)] hover:-translate-y-0.5 gap-2"
            >
              Começar Jornada
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-[hsl(215,16%,47%)]">
              Leva menos de 1 minuto.
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="w-6 h-10 rounded-full border-2 border-[hsl(215,16%,47%)] flex items-start justify-center p-1.5">
              <div className="w-1.5 h-2.5 rounded-full bg-[hsl(215,16%,47%)]" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-widest text-[hsl(217,91%,53%)] mb-3 font-medium">
                Por que o BookQuest?
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">
                Leitura com propósito
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "Evolua no Ranking Literário",
                  description: "Ganhe XP ao concluir leituras e desafios. Suba de Bronze a Lendário.",
                  color: "hsl(217,91%,53%)",
                },
                {
                  icon: Flame,
                  title: "Construa sua Sequência",
                  description: "Mantenha constância diária e desbloqueie níveis de disciplina.",
                  color: "hsl(48,96%,53%)",
                },
                {
                  icon: Brain,
                  title: "Torne a leitura ativa",
                  description: "Responda perguntas inteligentes ao final de cada capítulo.",
                  color: "hsl(150,40%,50%)",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${benefit.color}`.replace(")", "/0.12)") }}
                  >
                    <benefit.icon
                      className="w-6 h-6"
                      style={{ color: benefit.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-[hsl(215,16%,57%)] text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-[hsl(217,91%,53%)] mb-3 font-medium">
              Como funciona
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-12">
              Simples e direto
            </h2>

            <div className="grid sm:grid-cols-3 gap-10">
              {[
                { step: "01", title: "Faça o Quiz", desc: "Descubra seu perfil literário em menos de 1 minuto." },
                { step: "02", title: "Escolha Trilhas", desc: "Selecione livros e leia capítulo por capítulo no seu ritmo." },
                { step: "03", title: "Evolua", desc: "Ganhe XP, suba no ranking e complete missões diárias." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-[hsl(217,91%,53%,0.2)] mb-3 font-serif">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[hsl(215,16%,57%)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-8 h-8 text-[hsl(48,96%,53%)] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-[hsl(215,16%,57%)] mb-8 text-lg">
              Faça o quiz e descubra qual é o seu perfil literário.
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-[hsl(217,91%,53%)] hover:bg-[hsl(224,76%,48%)] text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-[hsl(217,91%,53%,0.3)] transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(217,91%,53%,0.4)] hover:-translate-y-0.5 gap-2"
            >
              Fazer Quiz Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/[0.05]">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[hsl(215,16%,47%)]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="font-serif font-semibold">BookQuest</span>
            </div>
            <p>© 2026 BookQuest. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
