import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import agathaMascot from "@/assets/agatha-mascot.png";

const VISITED_KEY = "bookquest_visited_categories_v3";

interface CategoryStep {
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

const categorySteps: Record<string, CategoryStep[]> = {
  "/biblioteca": [
    { target: '[data-tutorial="biblioteca-header"]', title: "📚 Biblioteca", description: "Bem-vindo à Biblioteca! Aqui você encontra todos os livros disponíveis no BookQuest. Vem comigo explorar!", placement: "bottom" },
    { target: '[data-tutorial="biblioteca-search"]', title: "🔍 Busca e Filtros", description: "Use a busca e os filtros de gênero pra encontrar exatamente o livro que você procura. Eu adoro pesquisar!", placement: "bottom" },
    { target: '[data-tutorial="biblioteca-genres"]', title: "🏷️ Gêneros", description: "Filtre rapidamente por gênero clicando nas categorias. Cada gênero tem surpresas incríveis esperando!", placement: "bottom" },
    { target: '[data-tutorial="biblioteca-suggest"]', title: "💡 Sugerir Livro", description: "Não encontrou um livro? Me conta! Sugira e nossa equipe avalia pra adicionar à plataforma.", placement: "bottom" },
    { target: '[data-tutorial="biblioteca-grid"]', title: "📖 Catálogo de Livros", description: "Clique em um livro pra ver detalhes, sinopse e adicionar à sua estante. Bora montar sua coleção!", placement: "top" },
  ],
  "/trilhas": [
    { target: '[data-tutorial="trilhas-header"]', title: "🗺️ Trilhas Literárias", description: "Cada trilha é um livro completo dividido em capítulos pra você ler no seu ritmo. Eu vou te acompanhar!", placement: "bottom" },
    { target: '[data-tutorial="trilhas-grid"]', title: "📖 Escolha sua Trilha", description: "Clique em uma trilha pra ver os capítulos, cronômetro de leitura e quizzes de compreensão. Vamos nessa!", placement: "bottom" },
  ],
  "/estante": [
    { target: '[data-tutorial="estante-header"]', title: "📖 Minha Estante", description: "Aqui ficam todos os seus livros organizados por status de leitura. Eu cuido da organização pra você!", placement: "bottom" },
    { target: '[data-tutorial="estante-tabs"]', title: "📂 Categorias", description: "Organize seus livros entre: Lendo, Reelendo, Quero Ler, Lido, Abandonado e Favoritos. Tudo certinho!", placement: "bottom" },
    { target: '[data-tutorial="estante-add"]', title: "➕ Adicionar Livro", description: "Clique aqui pra ir à Biblioteca e adicionar novos livros à sua estante. Quanto mais, melhor!", placement: "bottom" },
  ],
  "/missoes": [
    { target: '[data-tutorial="missoes-header"]', title: "🎯 Missões", description: "Complete missões pra ganhar XP e subir no ranking. Eu vou torcer por você! Veja seu progresso aqui.", placement: "bottom" },
    { target: '[data-tutorial="missoes-daily"]', title: "⏰ Missões Diárias", description: "Essas missões reiniciam toda meia-noite. Complete todos os dias pra manter sua sequência ativa!", placement: "bottom" },
    { target: '[data-tutorial="missoes-weekly"]', title: "⭐ Missões Semanais", description: "Missões que reiniciam toda segunda-feira. Valem mais XP e exigem mais dedicação. Eu acredito em você!", placement: "bottom" },
    { target: '[data-tutorial="missoes-monthly"]', title: "🏆 Missões Mensais", description: "Grandes desafios que reiniciam no dia 1 de cada mês. Conquistar essas garante recompensas enormes!", placement: "bottom" },
  ],
  "/ranking": [
    { target: '[data-tutorial="ranking-header"]', title: "🏆 Ranking Literário", description: "Competição semanal baseada em XP. Suba de Bronze a Lendário lendo e completando desafios! Quem vai ser o campeão?", placement: "bottom" },
    { target: '[data-tutorial="ranking-countdown"]', title: "⏳ Contador Regressivo", description: "Mostra quantos dias faltam pro fechamento da semana. Ao final, os melhores sobem de patamar!", placement: "bottom" },
    { target: '[data-tutorial="ranking-tiers"]', title: "🎖️ Patamares", description: "Explore os diferentes patamares clicando nas abas. Cada patamar tem vagas limitadas pra avançar. Corre!", placement: "bottom" },
    { target: '[data-tutorial="ranking-podium"]', title: "🥇 Pódio", description: "Os 3 primeiros colocados aparecem no pódio com destaque especial. Será que você chega lá?", placement: "bottom" },
  ],
  "/comunidade": [
    { target: '[data-tutorial="comunidade-header"]', title: "💬 Comunidades", description: "Cada livro tem sua comunidade. Discuta, compartilhe teorias e conecte-se com outros leitores! Eu amo uma boa conversa.", placement: "bottom" },
    { target: '[data-tutorial="comunidade-search"]', title: "🔍 Buscar Comunidade", description: "Encontre a comunidade do seu livro favorito usando a busca por título ou autor.", placement: "bottom" },
    { target: '[data-tutorial="comunidade-grid"]', title: "📚 Comunidades Disponíveis", description: "Clique em uma comunidade pra ver discussões, enviar mensagens e participar das conversas.", placement: "bottom" },
  ],
  "/noticias": [
    { target: '[data-tutorial="noticias-header"]', title: "📰 Notícias", description: "Fique por dentro das novidades do BookQuest! Eu trago anúncios, atualizações e curiosidades literárias pra você.", placement: "bottom" },
    { target: '[data-tutorial="noticias-filters"]', title: "🏷️ Filtros", description: "Filtre as notícias por tipo: anúncios, atualizações ou curiosidades. Tudo organizadinho!", placement: "bottom" },
  ],
  "/mentoria": [
    { target: '[data-tutorial="mentoria-header"]', title: "✨ Mentoria Literária", description: "Sessões em grupo com mentores pra ajudar a criar e manter o hábito de leitura. Recurso Premium! Vale muito a pena.", placement: "bottom" },
  ],
  "/perfil": [
    { target: '[data-tutorial="perfil-header"]', title: "👤 Meu Perfil", description: "Veja suas estatísticas, conquistas, ranking e todo seu histórico de leitura num só lugar. Eu tô orgulhosa!", placement: "bottom" },
    { target: '[data-tutorial="perfil-stats"]', title: "📊 Suas Estatísticas", description: "Acompanhe capítulos lidos, tempo de leitura, livros concluídos e seu patamar no ranking.", placement: "bottom" },
    { target: '[data-tutorial="perfil-achievements"]', title: "🏅 Conquistas", description: "Desbloqueie conquistas conforme avança na sua jornada. Colecione todas! Eu vou acompanhar.", placement: "top" },
  ],
  "/configuracoes": [
    { target: '[data-tutorial="config-header"]', title: "⚙️ Configurações", description: "Ajuste tema, notificações e preferências da sua conta. Deixe tudo do seu jeitinho!", placement: "bottom" },
    { target: '[data-tutorial="config-theme"]', title: "🌓 Tema", description: "Alterne entre tema claro e escuro conforme sua preferência. Eu fico bonita nos dois!", placement: "bottom" },
    { target: '[data-tutorial="config-tutorial-reset"]', title: "🔄 Reiniciar Tutoriais", description: "Quer me ver de novo explicando tudo? Clique aqui pra resetar e rever os tutoriais guiados.", placement: "bottom" },
  ],
  "/desafios": [
    { target: '[data-tutorial="desafios-header"]', title: "⚔️ Desafios Sociais", description: "Bem-vindo à arena de desafios! Aqui você pode competir com amigos e colegas em metas de leitura. Quem lê mais?", placement: "bottom" },
    { target: '[data-tutorial="desafios-create"]', title: "📩 Criar Desafio", description: "Clique aqui pra enviar um desafio pro email de um amigo. Escolha o tipo e veja quem vence! Eu aposto em você.", placement: "bottom" },
    { target: '[data-tutorial="desafios-tabs"]', title: "📊 Acompanhe seus Desafios", description: "Navegue entre desafios ativos, enviados e histórico. Cada vitória rende XP e glória! Bora competir!", placement: "bottom" },
  ],
  "/admin": [
    { target: '[data-tutorial="admin-panel"]', title: "🛡️ Painel Administrativo", description: "Bem-vindo ao painel de controle do BookQuest! Aqui você gerencia tudo: trilhas, mentorias e sugestões de livros.", placement: "bottom" },
    { target: '[data-tutorial="admin-suggestions"]', title: "📚 Sugestões de Livros", description: "Revise e aprove sugestões enviadas pelos leitores. Cada sugestão passa por verificação antes de virar uma trilha.", placement: "bottom" },
    { target: '[data-tutorial="admin-tracks"]', title: "🗺️ Gestão de Trilhas", description: "Crie e edite trilhas literárias. Defina capítulos, quizzes e todo o conteúdo das jornadas de leitura.", placement: "bottom" },
  ],
};

function normalizeCategoryPath(pathname: string): string {
  if (pathname.startsWith("/trilhas/")) return "/trilhas";
  return pathname;
}

function getVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) || "[]");
  } catch {
    return [];
  }
}

function markVisited(path: string) {
  const visited = getVisited();
  if (!visited.includes(path)) {
    visited.push(path);
    localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  }
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 300;

const CategoryIntro = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<CategoryStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const retryCountRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Detect first visit to a category
  useEffect(() => {
    const categoryPath = normalizeCategoryPath(location.pathname);

    if (
      categoryPath === "/" ||
      categoryPath === "/home" ||
      categoryPath === "/auth" ||
      categoryPath === "/quiz-onboarding" ||
      categoryPath === "/quiz"
    ) {
      return;
    }

    const stepsForCategory = categorySteps[categoryPath];
    if (!stepsForCategory) return;

    const visited = getVisited();
    if (visited.includes(categoryPath)) return;

    const timer = setTimeout(() => {
      setSteps(stepsForCategory);
      setCurrentStep(0);
      setActive(true);
    }, 650);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Reset when leaving page
  useEffect(() => {
    return () => {
      setActive(false);
      setIsVisible(false);
      setTargetRect(null);
    };
  }, [location.pathname]);

  const dismiss = useCallback(() => {
    setActive(false);
    setIsVisible(false);
    setTargetRect(null);
    markVisited(normalizeCategoryPath(location.pathname));
  }, [location.pathname]);

  const updateRect = useCallback((el: Element) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    };
  }, []);

  const computeTooltip = useCallback(() => {
    const tooltipW = Math.min(340, window.innerWidth - 32);
    const vw = window.innerWidth;
    const agathaPosRight = 16;
    const agathaWidth = 160;
    const agathaCenterX = vw - agathaPosRight - agathaWidth / 2;

    const style: React.CSSProperties = {
      position: "fixed",
      width: tooltipW,
      zIndex: 10002,
      bottom: 200,
      left: Math.max(8, Math.min(agathaCenterX - tooltipW / 2, vw - tooltipW - 8)),
    };

    return style;
  }, []);

  const findAndHighlight = useCallback(() => {
    if (!steps.length || !active) return;

    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      retryCountRef.current += 1;
      if (retryCountRef.current < MAX_RETRIES) {
        setTimeout(findAndHighlight, RETRY_INTERVAL);
        return;
      }
      retryCountRef.current = 0;
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        dismiss();
      }
      return;
    }

    retryCountRef.current = 0;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          setTimeout(() => {
            setTargetRect(updateRect(el));
            setTooltipStyle(computeTooltip());
          }, 200);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    setTimeout(() => {
      observer.disconnect();
      setTargetRect(updateRect(el));
      setTooltipStyle(computeTooltip());
    }, 800);
  }, [steps, currentStep, active, dismiss, updateRect, computeTooltip]);

  // Trigger on step change — don't clear targetRect to avoid Agatha bouncing
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(findAndHighlight, 200);
    return () => clearTimeout(timer);
  }, [active, currentStep, findAndHighlight]);

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!active || !steps.length) return;

    const recalc = () => {
      const step = steps[currentStep];
      if (!step) return;
      const el = document.querySelector(step.target);
      if (!el) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setTargetRect(updateRect(el));
        setTooltipStyle(computeTooltip());
      });
    };

    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, steps, currentStep, updateRect, computeTooltip]);

  // Animate in
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [active]);

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismiss();
    }
  }, [currentStep, steps.length, dismiss]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  if (!active || !steps.length) return null;

  const stepData = steps[currentStep];
  const showContent = isVisible && targetRect;

  return (
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with cutout */}
      <svg
        className="fixed inset-0 w-full h-full"
        style={{
          opacity: showContent ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: showContent ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="cat-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="hsl(var(--background) / 0.82)"
          mask="url(#cat-spotlight-mask)"
        />
      </svg>

      {/* Glow border */}
      {targetRect && (
        <div
          className="fixed rounded-xl border-2 border-accent shadow-[0_0_24px_hsl(var(--accent)/0.4)] pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            opacity: showContent ? 1 : 0,
            transition: "all 0.5s ease, opacity 0.4s ease",
          }}
        />
      )}

      {/* Speech bubble tooltip — positioned above Agatha */}
      <div
        className="bg-card border border-accent/30 rounded-2xl shadow-2xl p-5 relative"
        style={{
          ...tooltipStyle,
          pointerEvents: showContent ? "auto" : "none",
          opacity: showContent ? 1 : 0,
          transform: showContent ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Speech bubble tail pointing down toward Agatha */}
        <div
          className="absolute -bottom-3 right-16 w-6 h-6 bg-card border-b border-r border-accent/30 rotate-45"
          style={{ zIndex: -1 }}
        />

        {/* Step dots */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 overflow-hidden flex-1 mr-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === currentStep
                    ? "w-4 bg-accent"
                    : i < currentStep
                    ? "w-2 bg-accent/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-base font-serif font-semibold mb-1.5 text-accent">{stepData.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {stepData.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={goPrev} className="gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </Button>
            )}
            <Button
              size="sm"
              onClick={goNext}
              className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                "Entendi! 🎉"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Agatha mascot — bottom right */}
      <img
        src={agathaMascot}
        alt="Agatha, guia do tutorial"
        className="fixed bottom-0 right-4 z-[10003] pointer-events-none select-none"
        style={{
          width: 160,
          height: "auto",
          transform: showContent ? "translateY(0)" : "translateY(110%)",
          opacity: showContent ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease",
        }}
      />
    </div>
  );
};

export default CategoryIntro;
