import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Trophy,
  BookOpen,
  Target,
  Zap,
  Users,
  Flame,
  Brain,
  Award,
  Sparkles,
  BarChart3,
  GraduationCap,
  Star,
  TrendingUp,
  Crown,
  Menu,
  X,
  Compass,
  Heart,
  Rocket,
  Wand2,
  Ghost,
  Swords,
  Telescope,
  Search,
} from "lucide-react";

// Reusable premium button classes
const PRIMARY_CTA =
  "relative overflow-hidden bg-gradient-to-r from-accent via-[hsl(48,96%,60%)] to-accent bg-[length:200%_100%] bg-left hover:bg-right text-accent-foreground font-bold rounded-xl shadow-lg shadow-accent/30 hover:shadow-[0_0_45px_hsl(48,96%,55%/0.55)] hover:scale-[1.025] hover:brightness-110 active:scale-[0.98] transition-all duration-300 ease-out";

const GHOST_CTA =
  "rounded-xl border-white/15 bg-white/5 backdrop-blur-sm text-foreground hover:bg-white/10 hover:border-accent/40 hover:scale-[1.02] hover:shadow-[0_0_24px_hsl(48,96%,55%/0.2)] transition-all duration-300 ease-out";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { useEffect, useRef, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleStart = () => navigate(user ? "/quiz-literario" : "/auth");
  const handleEdu = () => navigate("/edu");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };
  const isVisible = (id: string) => visibleSections.has(id);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = [
    { label: "Início", id: "hero" },
    { label: "Descobrir", id: "discover" },
    { label: "Recursos", id: "features" },
    { label: "Comunidade", id: "community" },
    { label: "Sobre", id: "about" },
  ];

  const features = [
    { icon: Zap, title: "Gamificação", desc: "Cada capítulo lido vira XP e progressão real." },
    { icon: Flame, title: "Sequência diária", desc: "Mantenha o streak e construa o hábito." },
    { icon: Trophy, title: "Ranking de leitores", desc: "Suba de tier competindo com outros leitores." },
    { icon: Brain, title: "Quizzes interativos", desc: "Valide a leitura e ganhe Essência (✦)." },
    { icon: Target, title: "Metas personalizadas", desc: "Plano adaptado ao seu ritmo e objetivos." },
    { icon: Award, title: "Competições literárias", desc: "Desafios PvP e missões semanais." },
  ];

  const stats = [
    { value: "300+", label: "Livros cadastrados" },
    { value: "120+", label: "Usuários impactados" },
    { value: "500+", label: "Quizzes realizados" },
    { value: "95%", label: "Relatam ler mais" },
  ];

  const testimonials = [
    {
      name: "Mariana C.",
      role: "Estudante, 17 anos",
      text: "Nunca tinha terminado um livro. Hoje leio todo dia para manter meu streak.",
    },
    {
      name: "Lucas R.",
      role: "Vestibulando",
      text: "O ranking me motivou a ler clássicos que eu jamais abriria sozinho.",
    },
    {
      name: "Profª Helena",
      role: "Professora de Literatura",
      text: "O EDU mudou como acompanho a leitura da turma. Métricas claras e engajamento real.",
    },
  ];

  return (
    <main id="main-content" className="min-h-screen text-foreground overflow-hidden bg-transparent relative z-[1]">
      {/* Glow ambient layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-accent/[0.05] blur-[160px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[hsl(220,80%,40%)]/[0.18] blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/[0.04] blur-[140px]" />
      </div>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#021f53]/70 backdrop-blur-xl border-b border-white/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-2 group"
            aria-label="BookQuest"
          >
            <img src={logoCrown} alt="" className="w-8 h-8 object-contain" />
            <span className="font-serif font-bold text-lg tracking-tight text-foreground">
              BookQuest
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.id)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleEdu}
              className="text-sm px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground border border-white/10 hover:border-white/20 transition-all"
            >
              BookQuest EDU
            </button>
            <Button
              onClick={() => navigate(user ? "/home" : "/auth")}
              className={`${PRIMARY_CTA} px-5 h-10`}
            >
              {user ? "Acessar BookQuest" : "Entrar"}
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#021f53]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col gap-2 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.id)}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleEdu}
              className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-t border-white/5 mt-2 pt-3"
            >
              BookQuest EDU
            </button>
            <Button
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className={`${PRIMARY_CTA} mt-2`}
            >
              Entrar
            </Button>
          </div>
        )}
      </nav>

      <div className="relative z-10">
        {/* ═══════════ HERO ═══════════ */}
        <section
          id="hero"
          className="min-h-screen flex items-center px-6 pt-32 pb-16 relative"
        >
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left – text */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-sm mb-6">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent tracking-wide">
                  Plataforma de leitura gamificada
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-[1.05] mb-6">
                Sua próxima
                <br />
                <span className="bg-gradient-to-r from-accent via-[hsl(48,96%,65%)] to-accent bg-clip-text text-transparent">história favorita</span>
                <br />
                começa aqui.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed">
                Não importa se você lê todo dia ou nunca terminou um livro. O BookQuest descobre o que combina com você e transforma leitura em uma jornada divertida e personalizada.
              </p>
              <p className="text-sm text-accent/90 max-w-xl mx-auto lg:mx-0 mb-10 italic">
                Nem todo mundo começa gostando de ler. E tudo bem.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 sm:justify-start justify-center">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className={`${PRIMARY_CTA} text-base px-8 py-6 gap-2`}
                >
                  <span className="relative z-10">Iniciar minha jornada</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => scrollTo("discover")}
                  size="lg"
                  variant="outline"
                  className={`${GHOST_CTA} text-base px-8 py-6 gap-2`}
                >
                  <Compass className="w-4 h-4" />
                  Descobrir meu estilo
                </Button>
              </div>

            </div>

            {/* Right – mockup */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {/* Floating glow */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[hsl(220,80%,50%)]/25 blur-3xl" />
              </div>

              {/* Profile card */}
              <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[hsl(48,96%,40%)] flex items-center justify-center text-accent-foreground font-bold text-xl shadow-lg shadow-accent/30">
                    L
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">@leitor.pro</span>
                      <Crown className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground">Tier Diamante · Top 3%</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-orange-300">42</span>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Essência ✦</span>
                    <span className="text-accent font-semibold">2.840 / 3.500</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-[hsl(48,96%,65%)] rounded-full shadow-[0_0_12px_hsl(48,96%,53%,0.6)]"
                      style={{ width: "81%" }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: BookOpen, value: "27", label: "Livros" },
                    { icon: Target, value: "184", label: "Capítulos" },
                    { icon: Award, value: "12", label: "Medalhas" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center"
                    >
                      <s.icon className="w-4 h-4 text-accent mx-auto mb-1.5" />
                      <div className="text-lg font-bold text-foreground">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini ranking */}
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-accent" /> Ranking Semanal
                  </div>
                  {[
                    { pos: 1, name: "marina.lê", xp: "3.420", you: false },
                    { pos: 2, name: "@leitor.pro", xp: "2.840", you: true },
                    { pos: 3, name: "joão_books", xp: "2.610", you: false },
                  ].map((r) => (
                    <div
                      key={r.pos}
                      className={`flex items-center gap-2 py-1.5 text-xs ${
                        r.you ? "text-accent font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      <span className="w-4 text-center">{r.pos}</span>
                      <span className="flex-1 truncate">{r.name}</span>
                      <span>{r.xp} ✦</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              <div
                className="absolute -top-4 -right-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 hidden sm:flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Nova medalha!</div>
                  <div className="text-[10px] text-muted-foreground">Maratonista</div>
                </div>
              </div>

              <div
                className="absolute -bottom-4 -left-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 hidden sm:flex items-center gap-2 animate-fade-in"
                style={{ animationDelay: "0.7s" }}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-foreground">+320 ✦ hoje</div>
                  <div className="text-[10px] text-muted-foreground">3 capítulos lidos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ DESCOBERTA / QUIZ ═══════════ */}
        <section
          id="discover"
          ref={setRef("discover")}
          className="py-24 sm:py-32 px-6 relative"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("discover") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 mb-5">
                  <Compass className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent tracking-wide">Descoberta pessoal</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
                  Não sabe por onde
                  <br />
                  <span className="text-accent italic">começar?</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-3">
                  O BookQuest entende seu estilo e recomenda gêneros, livros e experiências que combinam com você.
                </p>
                <p className="text-sm text-foreground/70 italic mb-8">
                  Descubra qual tipo de livro combina com sua personalidade. A leitura certa muda tudo.
                </p>

                <Button
                  onClick={handleStart}
                  size="lg"
                  className={`${PRIMARY_CTA} px-7 py-6 gap-2`}
                >
                  <Wand2 className="w-4 h-4" />
                  Fazer o quiz literário
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full -z-10" />
                <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Quiz · Pergunta 3 de 6</span>
                    </div>
                    <span className="text-xs text-accent font-semibold">50%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 mb-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-[hsl(48,96%,65%)] rounded-full" style={{ width: "50%" }} />
                  </div>
                  <p className="text-base font-semibold mb-4">Que tipo de história te prende?</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { icon: Swords, label: "Aventura", hot: false },
                      { icon: Search, label: "Mistério", hot: true },
                      { icon: Heart, label: "Romance", hot: false },
                      { icon: Rocket, label: "Ficção científica", hot: false },
                      { icon: Ghost, label: "Suspense", hot: false },
                      { icon: Wand2, label: "Fantasia", hot: false },
                    ].map((g) => (
                      <button
                        key={g.label}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all duration-300 ${
                          g.hot
                            ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_20px_hsl(48,96%,55%/0.25)]"
                            : "border-white/10 bg-white/[0.02] hover:border-accent/40 hover:bg-accent/[0.06] hover:scale-[1.03]"
                        }`}
                      >
                        <g.icon className="w-4 h-4" />
                        <span className="font-medium">{g.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 p-3 rounded-xl bg-accent/[0.06] border border-accent/20 text-xs text-foreground/80 flex items-start gap-2">
                    <Telescope className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <span>Suas escolhas vão moldar uma trilha personalizada de livros que talvez você nunca teria descoberto sozinho.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ PARA TODOS OS TIPOS ═══════════ */}
        <section
          id="for-everyone"
          ref={setRef("for-everyone")}
          className="py-24 sm:py-32 px-6 relative"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("for-everyone") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-semibold">Para todos</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                Uma experiência feita para todos os tipos de leitores.
              </h2>
              <p className="text-muted-foreground">
                Cada jornada começa de um jeito diferente. A sua também.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Heart, label: "Nunca gostei de ler", desc: "Comece por algo curto, leve e do seu interesse." },
                { icon: Flame, label: "Quero criar hábito", desc: "Sequências diárias que tornam a leitura parte da rotina." },
                { icon: Trophy, label: "Quero competir com amigos", desc: "Rankings, desafios PvP e ligas semanais." },
                { icon: Compass, label: "Quero descobrir gêneros", desc: "Recomendações personalizadas a cada leitura." },
                { icon: TrendingUp, label: "Quero evoluir aos poucos", desc: "Metas adaptadas ao seu ritmo, sem pressão." },
                { icon: Sparkles, label: "Quero algo divertido", desc: "Gamificação real: Essência, medalhas e tiers." },
              ].map((c, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-accent/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_hsl(48,96%,55%/0.3)] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3 group-hover:bg-accent/25 group-hover:scale-110 transition-all">
                    <c.icon className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">{c.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground/80 italic mt-10">
              Seu próximo livro favorito pode estar aqui. Não importa seu nível de leitura.
            </p>
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section
          id="features"
          ref={setRef("features")}
          className="py-24 sm:py-32 px-6 relative"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
                Recursos
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                Transformamos leitura em <span className="text-accent">experiência</span>.
              </h2>
              <p className="text-muted-foreground">
                Uma plataforma divertida, gamificada e personalizada — pensada tanto para quem ama ler quanto para quem ainda está descobrindo.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group relative p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-accent/30 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ EXPERIÊNCIA ═══════════ */}
        <section
          id="experience"
          ref={setRef("experience")}
          className="py-24 sm:py-32 px-6 relative"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("experience") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
                Experiência
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                Veja a experiência na prática
              </h2>
            </div>

            <div className="space-y-20">
              {[
                {
                  tag: "Progressão",
                  title: "Cada capítulo é um passo a mais",
                  desc: "Acompanhe seu avanço em tempo real. Veja Essência ganha, capítulos concluídos e o quanto falta para o próximo nível.",
                  icon: BarChart3,
                  reverse: false,
                },
                {
                  tag: "Comunidade",
                  title: "Compita com outros leitores",
                  desc: "Ranking semanal, tiers e desafios PvP. A leitura vira um espaço vivo de comunidade e evolução conjunta.",
                  icon: Users,
                  reverse: true,
                },
                {
                  tag: "Inteligência",
                  title: "Quizzes que validam de verdade",
                  desc: "Perguntas geradas com IA garantem que você leu, entendeu e absorveu o conteúdo. Sem atalhos.",
                  icon: Brain,
                  reverse: false,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`grid lg:grid-cols-2 gap-10 items-center ${
                    row.reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                      {row.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-2 mb-3">
                      {row.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{row.desc}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                    <div className="relative aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/40">
                      <row.icon className="w-20 h-20 text-accent/60" strokeWidth={1.2} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ EMOTIONAL ═══════════ */}
        <section
          id="emotional"
          ref={setRef("emotional")}
          className="py-28 sm:py-36 px-6 relative"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-accent/[0.06] via-transparent to-transparent" />
          </div>
          <div
            className={`max-w-3xl mx-auto text-center relative transition-all duration-700 ${
              isVisible("emotional") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <BookOpen className="w-10 h-10 text-accent/50 mx-auto mb-6" strokeWidth={1.2} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
              Ler nunca deveria ser
              <br />
              uma <span className="italic text-accent">obrigação</span>.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O BookQuest transforma leitura em motivação, progresso e pertencimento através da tecnologia e da gamificação.
            </p>
          </div>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <section
          id="stats"
          ref={setRef("stats")}
          className="py-20 px-6"
        >
          <div
            className={`max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${
              isVisible("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm text-center group hover:border-accent/30 transition-all"
              >
                <div className="absolute inset-0 rounded-2xl bg-accent/0 group-hover:bg-accent/[0.04] transition-colors" />
                <div className="relative text-3xl sm:text-4xl font-bold bg-gradient-to-br from-foreground to-accent bg-clip-text text-transparent mb-1">
                  {s.value}
                </div>
                <div className="relative text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ COMMUNITY / RANKING ═══════════ */}
        <section
          id="community"
          ref={setRef("community")}
          className="py-24 sm:py-32 px-6"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("community") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
                Comunidade
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                Uma comunidade viva de leitores
              </h2>
              <p className="text-muted-foreground">
                Compita, evolua e descubra novas leituras junto com milhares de outros leitores.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Ranking card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Top leitores</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Esta semana</span>
                </div>
                <div className="space-y-2">
                  {[
                    { pos: 1, name: "marina.lê", xp: "3.420", color: "from-yellow-300 to-amber-500" },
                    { pos: 2, name: "rafael_books", xp: "3.180", color: "from-slate-300 to-slate-500" },
                    { pos: 3, name: "ana.literaria", xp: "2.940", color: "from-orange-300 to-orange-600" },
                    { pos: 4, name: "leitor.pro", xp: "2.840", color: "from-white/30 to-white/10" },
                    { pos: 5, name: "joão_books", xp: "2.610", color: "from-white/30 to-white/10" },
                  ].map((r) => (
                    <div
                      key={r.pos}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center font-bold text-sm text-[#021f53]`}
                      >
                        {r.pos}
                      </div>
                      <span className="flex-1 text-sm">{r.name}</span>
                      <span className="text-sm text-accent font-semibold">{r.xp} ✦</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active challenges */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Desafios ativos</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Ao vivo
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Maratona de Clássicos", players: "48 leitores", progress: 68 },
                    { title: "Sprint Semanal", players: "126 leitores", progress: 42 },
                    { title: "Duelo: Ficção vs Não-Ficção", players: "32 leitores", progress: 85 },
                  ].map((c, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{c.title}</span>
                        <span className="text-xs text-muted-foreground">{c.players}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-[hsl(48,96%,65%)]"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BOOKQUEST EDU ═══════════ */}
        <section
          id="edu"
          ref={setRef("edu")}
          className="py-24 sm:py-32 px-6"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("edu") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-8 sm:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.06] blur-3xl rounded-full pointer-events-none" />

              <div className="grid lg:grid-cols-2 gap-10 items-center relative">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 mb-5">
                    <GraduationCap className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium tracking-wide">Para escolas</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-4">
                    BookQuest <span className="text-accent">EDU</span>
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Uma plataforma para escolas acompanharem desempenho, engajamento e evolução leitora — tudo em dashboards claros e em tempo real.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Dashboards e métricas por turma",
                      "Ranking competitivo entre alunos",
                      "Quizzes escolares automatizados",
                      "Acompanhamento de desempenho individual",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        </div>
                        <span className="text-foreground/85">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleEdu}
                    size="lg"
                    className={`${PRIMARY_CTA} px-7 py-6 gap-2`}
                  >
                    Acessar Plataforma EDU
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Dashboard mockup */}
                <div className="relative">
                  <div className="rounded-2xl border border-white/10 bg-[#021f53]/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Turma 9º A</div>
                        <div className="font-semibold">Engajamento semanal</div>
                      </div>
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-2 h-32 mb-5">
                      {[40, 65, 45, 80, 70, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-accent/40 to-accent"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Alunos ativos", value: "28/32" },
                        { label: "Capítulos", value: "184" },
                        { label: "Quizzes", value: "92%" },
                      ].map((s, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center"
                        >
                          <div className="text-sm font-bold text-accent">{s.value}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section
          id="testimonials"
          ref={setRef("testimonials")}
          className="py-24 sm:py-32 px-6"
        >
          <div
            className={`max-w-6xl mx-auto transition-all duration-700 ${
              isVisible("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
                Depoimentos
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
                O que dizem os leitores
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-accent/30 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed mb-5 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center font-bold text-sm text-accent">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ ABOUT (anchor) ═══════════ */}
        <section id="about" className="hidden" ref={setRef("about")} />

        {/* ═══════════ CTA FINAL ═══════════ */}
        <section className="py-28 sm:py-36 px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-accent/[0.08] blur-[120px]" />
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <Crown className="w-12 h-12 text-accent mx-auto mb-6" strokeWidth={1.4} />
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold mb-5 leading-tight">
              Sua jornada de leitura
              <br />
              começa <span className="text-accent italic">agora.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Comece descobrindo o que combina com você. Leva menos de 1 minuto.
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className={`${PRIMARY_CTA} text-lg px-12 py-7 gap-2`}
            >
              Iniciar minha jornada
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <img src={logoCrown} alt="BookQuest" className="w-5 h-5 object-contain" />
              <span className="font-serif font-semibold text-foreground/70">BookQuest</span>
            </div>
            <div className="flex items-center gap-5">
              <Link to="/politica-de-privacidade" className="hover:text-foreground/80 transition-colors">
                Privacidade
              </Link>
              <Link to="/termos-de-servico" className="hover:text-foreground/80 transition-colors">
                Termos
              </Link>
              <button onClick={handleEdu} className="hover:text-foreground/80 transition-colors">
                EDU
              </button>
            </div>
            <p>© 2026 BookQuest</p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Landing;
