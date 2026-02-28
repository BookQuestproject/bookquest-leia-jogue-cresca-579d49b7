import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Flame, Target, Users, ArrowRight, ChevronRight, Star, Zap, Trophy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleStart = () => navigate(user ? "/home" : "/auth");
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[hsl(230,68%,6%)] text-white selection:bg-accent/30">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[hsl(230,68%,8%)]/95 backdrop-blur-md border-b border-white/[0.06] py-3" : "py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5 group">
            <img src={logoCrown} alt="BookQuest" className="w-9 h-9 object-contain" />
            <span className="font-serif font-bold text-lg tracking-tight">BookQuest</span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <button onClick={() => scrollTo("hero")} className="hover:text-white transition-colors">Início</button>
            <button onClick={() => scrollTo("como-funciona")} className="hover:text-white transition-colors">Como funciona</button>
            <button onClick={() => scrollTo("diferenciais")} className="hover:text-white transition-colors">Diferenciais</button>
            <button onClick={() => navigate("/ranking")} className="hover:text-white transition-colors">Ranking</button>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate("/home")} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg px-5">
                Acessar plataforma
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate("/auth")} variant="ghost" size="sm" className="text-white/60 hover:text-white hidden sm:inline-flex">
                  Entrar
                </Button>
                <Button onClick={() => navigate("/auth")} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-lg px-5">
                  Começar agora
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-accent/[0.04] blur-[150px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/[0.08] border border-accent/[0.15] text-accent text-xs font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Plataforma gratuita para leitores
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold leading-[1.1] tracking-tight mb-6">
              Transforme leitura
              <br />
              em <span className="text-accent">conquista.</span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-md">
              Leia com propósito, ganhe XP a cada capítulo e suba no ranking literário.
              Sua evolução como leitor começa aqui.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8 py-6 rounded-xl shadow-lg shadow-accent/20 font-bold gap-2"
              >
                Começar minha jornada
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate("/trilhas")}
                variant="ghost"
                size="lg"
                className="text-white/50 hover:text-white text-base gap-2"
              >
                Explorar trilhas
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: App mockup */}
          <div className="hidden lg:block relative">
            <div className="relative bg-[hsl(230,50%,12%)] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/40">
              {/* Mockup header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Trilha Atual</p>
                    <p className="text-xs text-white/40">Dom Casmurro</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-orange-400/80">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="font-medium">12 dias</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-white/40 mb-2">
                  <span>Capítulo 8 de 24</span>
                  <span>33%</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-[33%] bg-gradient-to-r from-accent to-amber-400 rounded-full" />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "XP Total", value: "1,240", icon: Star },
                  { label: "Ranking", value: "Prata II", icon: Trophy },
                  { label: "Sequência", value: "12 dias", icon: Flame },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                    <stat.icon className="w-4 h-4 text-accent/60 mx-auto mb-1.5" />
                    <p className="text-sm font-bold">{stat.value}</p>
                    <p className="text-[10px] text-white/30">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Missions preview */}
              <div className="space-y-2">
                {["Ler 1 capítulo hoje", "Completar reflexão"].map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-accent bg-accent/20" : "border-white/10"}`}>
                      {i === 0 && <div className="w-2 h-2 rounded-full bg-accent" />}
                    </div>
                    <span className="text-xs text-white/60">{m}</span>
                    <span className="ml-auto text-[10px] text-accent/60">+10 XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating decorative glow */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/[0.06] rounded-full blur-[60px]" />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">Três passos para evoluir</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: BookOpen, title: "Escolha sua trilha", desc: "Selecione um livro e comece sua jornada literária no seu ritmo." },
              { step: "02", icon: Target, title: "Complete desafios", desc: "Leia capítulos, responda reflexões e cumpra missões diárias." },
              { step: "03", icon: TrendingUp, title: "Suba no ranking", desc: "Ganhe XP, mantenha sua sequência e evolua entre os tiers." },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-5xl font-serif font-bold text-white/[0.03] absolute -top-4 -left-1">{item.step}</div>
                <div className="relative pt-8">
                  <div className="w-11 h-11 rounded-xl bg-accent/[0.08] border border-accent/[0.12] flex items-center justify-center mb-5 group-hover:bg-accent/[0.12] transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3">Diferenciais</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">Tudo que você precisa para ler com propósito</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: Trophy, title: "Sistema de Ranking", desc: "Suba de Bronze a Lendário conforme ganha XP com suas leituras." },
              { icon: Flame, title: "Sequência de Leitura", desc: "Mantenha a constância e desbloqueie novos níveis de disciplina." },
              { icon: Target, title: "Missões Literárias", desc: "Desafios diários e semanais que recompensam sua dedicação." },
              { icon: Users, title: "Comunidade", desc: "Conecte-se com outros leitores, compartilhe progresso e inspire-se." },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/[0.08] border border-accent/[0.1] flex items-center justify-center shrink-0 group-hover:bg-accent/[0.12] transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-20">
            {[
              { value: "2.4k+", label: "Leitores ativos" },
              { value: "18k+", label: "Capítulos concluídos" },
              { value: "4.8", label: "Avaliação média", suffix: <Star className="w-4 h-4 text-accent inline ml-1" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-serif font-bold mb-1">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-sm text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Ana L.", text: "O BookQuest transformou minha relação com a leitura. O sistema de XP me motiva a ler todos os dias.", avatar: "A" },
              { name: "Pedro M.", text: "Nunca imaginei que gamificação e literatura combinassem tão bem. Minha sequência já está em 45 dias!", avatar: "P" },
              { name: "Julia S.", text: "As missões diárias são simples mas viciantes. Estou no tier Ouro e não pretendo parar.", avatar: "J" },
            ].map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <MessageCircle className="w-4 h-4 text-accent/40 mb-3" />
                <p className="text-sm text-white/50 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                    {t.avatar}
                  </div>
                  <span className="text-xs font-medium text-white/60">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-white/40 mb-10 text-lg max-w-md mx-auto">
            Junte-se a milhares de leitores que estão evoluindo com o BookQuest.
          </p>
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-10 py-6 rounded-xl shadow-lg shadow-accent/20 font-bold gap-2"
          >
            Começar agora gratuitamente
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoCrown} alt="BookQuest" className="w-7 h-7 object-contain" />
                <span className="font-serif font-bold">BookQuest</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs">
                Plataforma de leitura gamificada que transforma cada capítulo em progresso.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Produto", links: ["Trilhas", "Ranking", "Missões", "Premium"] },
              { title: "Comunidade", links: ["Clube do Livro", "Mentoria", "Notícias"] },
              { title: "Suporte", links: ["Central de Ajuda", "Contato", "Termos", "Privacidade"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-white/30 hover:text-white/60 transition-colors cursor-pointer">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© 2026 BookQuest. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
