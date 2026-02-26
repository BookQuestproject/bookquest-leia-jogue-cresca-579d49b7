import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VISITED_KEY = "bookquest_visited_categories";

interface CategoryStep {
  target: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
}

/** Per-category guided tutorial steps */
const categorySteps: Record<string, CategoryStep[]> = {
  "/biblioteca": [
    {
      target: '[data-tutorial="biblioteca-header"]',
      title: "📚 Biblioteca",
      description: "Bem-vindo à Biblioteca! Aqui você encontra todos os livros disponíveis no BookQuest.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="biblioteca-search"]',
      title: "🔍 Busca e Filtros",
      description: "Use a busca e os filtros de gênero para encontrar exatamente o livro que procura.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="biblioteca-genres"]',
      title: "🏷️ Gêneros",
      description: "Filtre rapidamente por gênero clicando nas categorias disponíveis.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="biblioteca-suggest"]',
      title: "💡 Sugerir Livro",
      description: "Não encontrou um livro? Sugira e nossa equipe avaliará para adicionar à plataforma.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="biblioteca-grid"]',
      title: "📖 Catálogo de Livros",
      description: "Clique em um livro para ver detalhes, sinopse e adicioná-lo à sua estante.",
      placement: "top",
    },
  ],
  "/trilhas": [
    {
      target: '[data-tutorial="trilhas-header"]',
      title: "🗺️ Trilhas Literárias",
      description: "Cada trilha é um livro completo dividido em capítulos para você ler no seu ritmo.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="trilhas-grid"]',
      title: "📖 Escolha sua Trilha",
      description: "Clique em uma trilha para ver os capítulos, cronômetro de leitura e quizzes de compreensão.",
      placement: "bottom",
    },
  ],
  "/estante": [
    {
      target: '[data-tutorial="estante-header"]',
      title: "📖 Minha Estante",
      description: "Aqui ficam todos os seus livros organizados por status de leitura.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="estante-tabs"]',
      title: "📂 Categorias",
      description: "Organize seus livros entre: Lendo, Reelendo, Quero Ler, Lido, Abandonado e Favoritos.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="estante-add"]',
      title: "➕ Adicionar Livro",
      description: "Clique aqui para ir à Biblioteca e adicionar novos livros à sua estante.",
      placement: "bottom",
    },
  ],
  "/missoes": [
    {
      target: '[data-tutorial="missoes-header"]',
      title: "🎯 Missões",
      description: "Complete missões para ganhar XP e subir no ranking. Veja seu progresso, sequência e nível aqui!",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="missoes-daily"]',
      title: "⏰ Missões Diárias",
      description: "Essas missões reiniciam toda meia-noite. Complete-as todos os dias para manter sua sequência!",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="missoes-weekly"]',
      title: "⭐ Missões Semanais",
      description: "Missões que reiniciam toda segunda-feira. Valem mais XP e exigem mais dedicação.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="missoes-monthly"]',
      title: "🏆 Missões Mensais",
      description: "Grandes desafios que reiniciam no dia 1 de cada mês. Conquistar essas missões garante recompensas enormes!",
      placement: "bottom",
    },
  ],
  "/ranking": [
    {
      target: '[data-tutorial="ranking-header"]',
      title: "🏆 Ranking Literário",
      description: "Competição semanal baseada em XP. Suba de Bronze a Lendário lendo e completando desafios!",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="ranking-countdown"]',
      title: "⏳ Contador Regressivo",
      description: "Mostra quantos dias faltam para o fechamento da semana. Ao final, os melhores sobem de patamar!",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="ranking-tiers"]',
      title: "🎖️ Patamares",
      description: "Explore os diferentes patamares clicando nas abas. Cada patamar tem vagas limitadas para avançar.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="ranking-podium"]',
      title: "🥇 Pódio",
      description: "Os 3 primeiros colocados aparecem no pódio com destaque especial.",
      placement: "bottom",
    },
  ],
  "/comunidade": [
    {
      target: '[data-tutorial="comunidade-header"]',
      title: "💬 Comunidades",
      description: "Cada livro tem sua comunidade. Discuta, compartilhe teorias e conecte-se com outros leitores!",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="comunidade-search"]',
      title: "🔍 Buscar Comunidade",
      description: "Encontre a comunidade do seu livro favorito usando a busca por título ou autor.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="comunidade-grid"]',
      title: "📚 Comunidades Disponíveis",
      description: "Clique em uma comunidade para ver discussões, enviar mensagens e participar das conversas.",
      placement: "bottom",
    },
  ],
  "/noticias": [
    {
      target: '[data-tutorial="noticias-header"]',
      title: "📰 Notícias",
      description: "Fique por dentro das novidades do BookQuest: anúncios, atualizações e curiosidades literárias.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="noticias-filters"]',
      title: "🏷️ Filtros",
      description: "Filtre as notícias por tipo: anúncios, atualizações ou curiosidades.",
      placement: "bottom",
    },
  ],
  "/mentoria": [
    {
      target: '[data-tutorial="mentoria-header"]',
      title: "✨ Mentoria Literária",
      description: "Sessões em grupo com mentores para ajudar a criar e manter o hábito de leitura. Recurso Premium!",
      placement: "bottom",
    },
  ],
  "/perfil": [
    {
      target: '[data-tutorial="perfil-header"]',
      title: "👤 Meu Perfil",
      description: "Veja suas estatísticas, conquistas, ranking e todo seu histórico de leitura num só lugar.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="perfil-stats"]',
      title: "📊 Suas Estatísticas",
      description: "Acompanhe capítulos lidos, tempo de leitura, livros concluídos e seu patamar no ranking.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="perfil-achievements"]',
      title: "🏅 Conquistas",
      description: "Desbloqueie conquistas conforme avança na sua jornada. Colecione todas!",
      placement: "top",
    },
  ],
  "/configuracoes": [
    {
      target: '[data-tutorial="config-header"]',
      title: "⚙️ Configurações",
      description: "Ajuste tema, notificações e preferências da sua conta.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="config-theme"]',
      title: "🌓 Tema",
      description: "Alterne entre tema claro e escuro conforme sua preferência.",
      placement: "bottom",
    },
    {
      target: '[data-tutorial="config-tutorial-reset"]',
      title: "🔄 Reiniciar Tutoriais",
      description: "Quer rever os tutoriais guiados? Clique aqui para resetar e vê-los novamente.",
      placement: "bottom",
    },
  ],
};

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

const CategoryIntro = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<CategoryStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const retryCountRef = useRef(0);

  // Detect first visit to a category
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/auth" || path === "/quiz-onboarding" || path === "/quiz") return;

    const stepsForCategory = categorySteps[path];
    if (!stepsForCategory) return;

    const visited = getVisited();
    if (visited.includes(path)) return;

    const timer = setTimeout(() => {
      setSteps(stepsForCategory);
      setCurrentStep(0);
      setActive(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const dismiss = useCallback(() => {
    setActive(false);
    setIsVisible(false);
    markVisited(location.pathname);
  }, [location.pathname]);

  const findAndHighlight = useCallback(() => {
    if (!steps.length || !active) return;

    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (!el) {
      retryCountRef.current += 1;
      if (retryCountRef.current < 3) {
        setTimeout(findAndHighlight, 400);
        return;
      }
      // Auto-skip this step if element doesn't exist
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

    setTimeout(() => {
      const rect = el.getBoundingClientRect();

      const newRect: Rect = {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };
      setTargetRect(newRect);

      const placement = step.placement || "bottom";
      const tooltipW = 320;
      const tooltipH = 200;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const style: React.CSSProperties = { position: "fixed", width: tooltipW, zIndex: 10002 };

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let top = 0;
      let left = 0;

      if (placement === "bottom" && rect.bottom + 12 + tooltipH < vh) {
        top = rect.bottom + 12;
        left = centerX - tooltipW / 2;
      } else if (placement === "top" && rect.top - 12 - tooltipH > 0) {
        top = rect.top - 12 - tooltipH;
        left = centerX - tooltipW / 2;
      } else if (placement === "right" && rect.right + 12 + tooltipW < vw) {
        top = centerY - tooltipH / 2;
        left = rect.right + 12;
      } else if (placement === "left" && rect.left - 12 - tooltipW > 0) {
        top = centerY - tooltipH / 2;
        left = rect.left - 12 - tooltipW;
      } else {
        if (rect.bottom + 12 + tooltipH < vh) {
          top = rect.bottom + 12;
          left = centerX - tooltipW / 2;
        } else if (rect.top - 12 - tooltipH > 0) {
          top = rect.top - 12 - tooltipH;
          left = centerX - tooltipW / 2;
        } else {
          top = vh / 2 - tooltipH / 2;
          left = vw / 2 - tooltipW / 2;
        }
      }

      style.top = Math.max(8, Math.min(top, vh - tooltipH - 8));
      style.left = Math.max(8, Math.min(left, vw - tooltipW - 8));

      setTooltipStyle(style);
    }, 500);
  }, [steps, currentStep, active, dismiss]);

  // Recalculate on step change
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(findAndHighlight, 300);
    return () => clearTimeout(timer);
  }, [active, currentStep, findAndHighlight]);

  // Recalculate on resize
  useEffect(() => {
    if (!active) return;
    const handler = () => findAndHighlight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [active, findAndHighlight]);

  // Don't block scroll — let scrollIntoView work naturally

  // Animate in
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [active]);

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      dismiss();
    }
  }, [currentStep, steps.length, dismiss]);

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  if (!active || !steps.length) return null;

  const stepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with cutout — fixed coords */}
      <svg
        className="fixed inset-0 w-full h-full transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0, pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="category-spotlight-mask">
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
          mask="url(#category-spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="fixed rounded-xl border-2 border-primary shadow-[0_0_24px_hsl(var(--primary)/0.4)] transition-all duration-500 pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip card — always interactive */}
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-5 transition-all duration-500"
        style={{
          ...tooltipStyle,
          pointerEvents: "auto",
          opacity: isVisible && targetRect ? 1 : 0,
          transform: isVisible && targetRect ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 overflow-hidden flex-1 mr-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                    ? "w-2 bg-primary/50"
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

        <h4 className="text-base font-serif font-semibold mb-1.5">{stepData.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {stepData.description}
        </p>

        {/* Navigation */}
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
              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                "Entendi!"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryIntro;
