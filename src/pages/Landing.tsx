import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Trophy, BookOpen, Target, Zap, Users, Quote, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoCrown from "@/assets/logo-crown-transparent.png";
import premiacaoImg from "@/assets/batalha-pitch-premiacao.jpeg";
import equipeApresentacaoImg from "@/assets/equipe-apresentacao.jpeg";
import { useEffect, useRef, useState } from "react";
import DemoButton from "@/components/demo/DemoButton";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleStart = () => {
    navigate(user ? "/quiz-literario" : "/auth");
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const isVisible = (id: string) => visibleSections.has(id);

  const team = [
    { name: "Davi Miranda", role: "Idealização e Estratégia" },
    { name: "Anny Eduarda", role: "Pesquisa e Desenvolvimento Educacional" },
    { name: "Anna Gabriella", role: "Experiência do Usuário e Organização de Trilhas" },
    { name: "Matheus Pierre", role: "Tecnologia e Estrutura da Plataforma" },
    { name: "Henrique De Assis", role: "Comunicação e Expansão" },
  ];

  return (
    <main id="main-content" className="min-h-screen text-foreground overflow-hidden bg-transparent relative z-[1]">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-accent/[0.03] blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* ═══════════ HERO ═══════════ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">

          {/* Logo */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <img
              src={logoCrown}
              alt="BookQuest Crown"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
            />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-[1.1] max-w-4xl mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Transforme sua leitura
            <br />
            <span className="text-accent">em uma jornada.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            O BookQuest foi criado para jovens que nunca tiveram o hábito de ler.
            <br className="hidden sm:block" />
            Transformamos a leitura em uma experiência gamificada, trilhada e com propósito.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-12 py-7 rounded-xl shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5 gap-2 font-bold"
            >
              Começar Jornada
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground/60">
              Leva menos de 1 minuto para começar.
            </p>
            <DemoButton size="default" label="Explorar BookQuest EDU em modo demo" />
          </div>


          {/* Scroll indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ═══════════ O PROPÓSITO ═══════════ */}
        <section
          id="purpose"
          ref={setRef("purpose")}
          className="py-24 sm:py-32 px-6 bg-card/50"
        >
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
              isVisible("purpose") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4 font-medium">
              Propósito
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-10">
              Por que o BookQuest existe?
            </h2>

            <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-left sm:text-center">
              <p>
                Muitos jovens nunca desenvolveram o hábito da leitura.
                <br className="hidden sm:block" />
                Não por falta de capacidade, mas por falta de{" "}
                <span className="text-foreground font-medium">direcionamento</span> e{" "}
                <span className="text-foreground font-medium">propósito</span>.
              </p>
              <p>
                O BookQuest transforma a leitura em uma jornada clara e evolutiva.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {[
                  { icon: BookOpen, text: "Cada capítulo lido representa progresso." },
                  { icon: Target, text: "Cada desafio cumprido fortalece a disciplina." },
                  { icon: Zap, text: "Cada sequência mantida constrói consistência." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-background/50"
                  >
                    <item.icon className="w-5 h-5 text-accent" />
                    <p className="text-sm text-muted-foreground text-center">{item.text}</p>
                  </div>
                ))}
              </div>

              <p className="pt-4 text-foreground/80 font-medium italic">
                Não é apenas sobre ler mais.
                <br />
                É sobre criar o hábito de forma estratégica e motivadora.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

        {/* ═══════════ COMO FUNCIONA ═══════════ */}
        <section
          id="how"
          ref={setRef("how")}
          className="py-24 sm:py-32 px-6 bg-primary/40"
        >
          <div
            className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
              isVisible("how") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4 font-medium">
              Como funciona
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Simples. Estratégico. Transformador.
            </h2>
            <p className="text-muted-foreground mb-14 max-w-xl mx-auto">
              Três etapas para construir um hábito real de leitura.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "Descubra seu perfil",
                  desc: "Faça um quiz rápido e descubra seu estilo literário.",
                  icon: "🧠",
                },
                {
                  step: "02",
                  title: "Escolha sua trilha",
                  desc: "Siga um caminho estruturado de leitura, capítulo por capítulo.",
                  icon: "📖",
                },
                {
                  step: "03",
                  title: "Evolua",
                  desc: "Ganhe XP, mantenha sua sequência e desenvolva constância.",
                  icon: "⚡",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative group p-8 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-accent/30 hover:bg-card/80 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-xs font-bold text-accent/40 tracking-widest mb-2 uppercase">
                    Etapa {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

        {/* ═══════════ RECONHECIMENTO ═══════════ */}
        <section
          id="recognition"
          ref={setRef("recognition")}
          className="py-24 sm:py-32 px-6 bg-card/50"
        >
          <div
            className={`max-w-5xl mx-auto transition-all duration-700 ${
              isVisible("recognition") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-14">
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-accent font-bold bg-accent/10 px-4 py-1.5 rounded-full mb-5">
                Validação
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">
                Reconhecimento e impacto real
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Card 1 – Apresentação */}
              <div className="rounded-2xl border border-accent/20 bg-primary/60 shadow-lg shadow-primary/20 overflow-hidden flex flex-col">
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={equipeApresentacaoImg}
                    alt="Equipe BookQuest apresentando o projeto na Batalha de Pitch 2025"
                    className="w-full h-52 sm:h-56 object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-7 flex flex-col flex-1 text-center">
                  <h3 className="text-xl font-serif font-bold mb-3">Batalha de Pitch 2025</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Projeto vencedor entre mais de{" "}
                    <span className="text-accent font-semibold">150 projetos</span>, validando o potencial do BookQuest como solução inovadora para incentivar a leitura entre jovens.
                  </p>
                </div>
              </div>

              {/* Card 2 – Premiação */}
              <div className="rounded-2xl border border-accent/20 bg-primary/60 shadow-lg shadow-primary/20 overflow-hidden flex flex-col">
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={premiacaoImg}
                    alt="Equipe BookQuest recebendo premiação de 1º lugar na Batalha de Pitch 2025"
                    className="w-full h-52 sm:h-56 object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-7 flex flex-col flex-1 text-center">
                  <h3 className="text-xl font-serif font-bold mb-3">Momento da premiação</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A equipe BookQuest recebendo o prêmio de{" "}
                    <span className="text-accent font-semibold">1º lugar</span> na Batalha de Pitch 2025, competição que reuniu mais de 150 projetos inovadores.
                  </p>
                </div>
              </div>
            </div>

            {/* UFU mention */}
            <p className="text-center text-sm text-muted-foreground/70 mt-10">
              Projeto com apoio acadêmico da{" "}
              <span className="text-foreground/80 font-medium">
                Universidade Federal de Uberlândia (UFU)
              </span>.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

        {/* ═══════════ TIME ═══════════ */}
        <section
          id="team"
          ref={setRef("team")}
          className="py-24 sm:py-32 px-6 bg-primary/40"
        >
          <div
            className={`max-w-4xl mx-auto transition-all duration-700 ${
              isVisible("team") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-6">
              <p className="text-sm uppercase tracking-[0.2em] text-accent mb-4 font-medium">
                O Time
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                Quem está construindo essa jornada
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Somos um time movido pelo propósito de transformar a leitura em uma experiência acessível, estruturada e evolutiva.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-card/40 hover:border-accent/20 transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-accent/70" />
                  </div>
                  <h4 className="text-sm font-semibold leading-tight">{member.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

        {/* ═══════════ CTA FINAL ═══════════ */}
        <section
          id="cta"
          ref={setRef("cta")}
          className="py-28 sm:py-36 px-6 bg-card/50 relative overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-accent/[0.05] blur-[100px]" />
          </div>

          <div
            className={`max-w-2xl mx-auto text-center relative z-10 transition-all duration-700 ${
              isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Quote className="w-8 h-8 text-accent/40 mx-auto mb-6 rotate-180" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
              Pronto para transformar sua relação com a leitura?
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Comece agora e descubra seu perfil literário.
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-12 py-7 rounded-xl shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5 gap-2 font-bold"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border/30">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground/50">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <img src={logoCrown} alt="BookQuest" className="w-5 h-5 object-contain" />
                <span className="font-serif font-semibold text-foreground/60">BookQuest</span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/politica-de-privacidade" className="hover:text-foreground/70 transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/termos-de-servico" className="hover:text-foreground/70 transition-colors">
                  Termos de Serviço
                </Link>
              </div>
            </div>
            <p>© 2026 BookQuest. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Landing;
