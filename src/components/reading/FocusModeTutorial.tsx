import { useState } from "react";
import { ArrowLeft, Headphones, BookOpen, Pause, CheckCircle, Sparkles } from "lucide-react";

interface FocusModeTutorialProps {
  onComplete: () => void;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  position: "top-left" | "top-right" | "center" | "bottom";
}

const steps: Step[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Bem-vindo ao Modo Leitura",
    description:
      "Um ambiente silencioso para você se concentrar. Vamos passar pelos controles em poucos segundos.",
    position: "center",
  },
  {
    icon: <ArrowLeft className="w-5 h-5" />,
    title: "Sair a qualquer momento",
    description:
      "Use a seta no canto superior esquerdo. Seu progresso é salvo automaticamente.",
    position: "top-left",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Música & Dicionário",
    description:
      "No canto superior direito você abre playlists ambiente e o dicionário do livro para palavras desconhecidas.",
    position: "top-right",
  },
  {
    icon: <Pause className="w-5 h-5" />,
    title: "Pausar quando precisar",
    description:
      "O botão dourado central pausa e retoma o cronômetro. Sem pressa — leia no seu ritmo.",
    position: "bottom",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Ao terminar o capítulo",
    description:
      "Toque em \"Finalizar leitura\" abaixo do botão. Você fará uma reflexão curta e ganhará Essência ✦.",
    position: "bottom",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Tudo pronto",
    description:
      "Boa leitura. Lembre-se: no mínimo 30 segundos para o capítulo contar.",
    position: "center",
  },
];

const FocusModeTutorial = ({ onComplete }: FocusModeTutorialProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  // Spotlight position per step (relative to the mode UI)
  const spotlightPos: Record<Step["position"], string> = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    center: "inset-0 m-auto",
    bottom: "bottom-24 left-1/2 -translate-x-1/2",
  };

  // Card position per step
  const cardPos: Record<Step["position"], string> = {
    "top-left": "top-24 left-6 sm:left-24",
    "top-right": "top-24 right-6 sm:right-24",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-32 left-1/2 -translate-x-1/2",
  };

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {/* Soft dark overlay — lets the actual UI breathe through */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] pointer-events-auto animate-fade-in"
        onClick={handleNext}
      />

      {/* Spotlight ring (decorative pointer) */}
      {step.position !== "center" && (
        <div
          className={`absolute ${spotlightPos[step.position]} w-14 h-14 rounded-full border-2 border-[#D4AF37] animate-[pulse_1.6s_ease-in-out_infinite] pointer-events-none`}
          style={{
            boxShadow:
              "0 0 0 4px rgba(212,175,55,0.15), 0 0 30px rgba(212,175,55,0.4)",
          }}
        />
      )}

      {/* Tutorial card */}
      <div
        className={`absolute ${cardPos[step.position]} max-w-[320px] w-[88vw] sm:w-[320px] pointer-events-auto animate-fade-in`}
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

          <p className="text-sm text-white/75 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Progress dots */}
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
              {!isLast && (
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
                {isLast ? "Começar" : "Próximo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModeTutorial;
