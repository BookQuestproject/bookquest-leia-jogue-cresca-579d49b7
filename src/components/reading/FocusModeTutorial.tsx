import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowLeft, Headphones, Pause, CheckCircle, Sparkles, Feather } from "lucide-react";

interface FocusModeTutorialProps {
  onComplete: () => void;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** data-tutorial selector to spotlight; null = centered */
  target: string | null;
  /** Where to anchor the card relative to the target */
  cardSide?: "below" | "above" | "center";
}

const steps: Step[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Bem-vindo ao Modo Leitura",
    description:
      "Um ambiente silencioso para você se concentrar. Vamos passar pelos controles em poucos segundos.",
    target: null,
    cardSide: "center",
  },
  {
    icon: <ArrowLeft className="w-5 h-5" />,
    title: "Sair a qualquer momento",
    description:
      "Use a seta no canto superior esquerdo. Seu progresso é salvo automaticamente.",
    target: "exit",
    cardSide: "below",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Música ambiente",
    description:
      "Abra playlists tranquilas para acompanhar sua leitura.",
    target: "music",
    cardSide: "below",
  },
  {
    icon: <Feather className="w-5 h-5" />,
    title: "Dicionário do livro",
    description:
      "Toque no ícone de pluma para anotar e entender palavras desconhecidas durante a leitura.",
    target: "vocabulary",
    cardSide: "below",
  },
  {
    icon: <Pause className="w-5 h-5" />,
    title: "Pausar quando precisar",
    description:
      "O botão dourado central pausa e retoma o cronômetro. Sem pressa — leia no seu ritmo.",
    target: "play",
    cardSide: "above",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Ao terminar o capítulo",
    description:
      "Toque em \"Finalizar leitura\". Você fará uma reflexão curta e ganhará Essência ✦.",
    target: "finish",
    cardSide: "above",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Que sua jornada seja luminosa",
    description:
      "Abra o livro com calma, deixe que cada página revele um novo mundo. Quando estiver pronto, toque em iniciar e mergulhe na história. Boa leitura, aventureiro!",
    target: null,
    cardSide: "center",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const FocusModeTutorial = ({ onComplete }: FocusModeTutorialProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  // Locate the target element and compute its rect
  useLayoutEffect(() => {
    if (!step.target) {
      setRect(null);
      setCardKey((k) => k + 1);
      return;
    }
    // Vocabulary button is rendered by external slot — find by aria-label fallback
    const selectors = [
      `[data-tutorial="${step.target}"]`,
      step.target === "vocabulary" ? '[aria-label*="ocabul"]' : null,
    ].filter(Boolean) as string[];

    let el: Element | null = null;
    for (const sel of selectors) {
      el = document.querySelector(sel);
      if (el) break;
    }
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    } else {
      setRect(null);
    }
    setCardKey((k) => k + 1);
  }, [stepIndex, step.target]);

  // Recompute on resize/scroll
  useEffect(() => {
    const onResize = () => {
      if (!step.target) return;
      const el = document.querySelector(`[data-tutorial="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step.target]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  // Compute card position based on rect and side
  const cardStyle: React.CSSProperties = (() => {
    const CARD_WIDTH = 320;
    const CARD_HEIGHT_EST = 180;
    const MARGIN = 16;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;

    if (!rect || step.cardSide === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const targetCenterX = rect.left + rect.width / 2;
    let left = targetCenterX - CARD_WIDTH / 2;
    left = Math.max(MARGIN, Math.min(left, vw - CARD_WIDTH - MARGIN));

    let top: number;
    if (step.cardSide === "below") {
      top = rect.top + rect.height + 24;
      if (top + CARD_HEIGHT_EST > vh - MARGIN) {
        top = rect.top - CARD_HEIGHT_EST - 24;
      }
    } else {
      // above
      top = rect.top - CARD_HEIGHT_EST - 24;
      if (top < MARGIN) {
        top = rect.top + rect.height + 24;
      }
    }

    return { top, left, width: CARD_WIDTH };
  })();

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  // Spotlight geometry (circle around target)
  const spot = rect
    ? {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        r: Math.max(rect.width, rect.height) / 2 + 14,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {/* Overlay with a transparent hole over the target (SVG mask) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={handleNext}
        style={{ display: "block" }}
      >
        <defs>
          <mask id="focus-tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spot && (
              <circle cx={spot.cx} cy={spot.cy} r={spot.r} fill="black" />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#focus-tutorial-mask)"
        />
      </svg>

      {/* Spotlight ring removed — the mask hole alone already highlights the target */}


      {/* Tutorial card */}
      <div
        key={cardKey}
        className="absolute pointer-events-auto animate-tutorial-card"
        style={cardStyle}
      >
        <div className="rounded-2xl bg-[#021f53]/95 border border-[#D4AF37]/30 backdrop-blur-md p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              {step.icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                {stepIndex + 1} / {steps.length}
              </p>
              <h3 className="text-white font-serif text-lg leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-white/75 leading-relaxed mb-4 font-serif">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === stepIndex
                      ? "w-5 bg-[#D4AF37]"
                      : i < stepIndex
                      ? "w-1.5 bg-[#D4AF37]/60"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isLast && !isFirst && (
                <button
                  onClick={onComplete}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  Pular
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-full bg-[#D4AF37] text-[#021f53] text-sm font-medium hover:bg-[#e5c252] transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                {isLast ? "Iniciar leitura" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModeTutorial;
