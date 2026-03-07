import { useEffect, useState } from "react";
import { RankingTier, tierConfig } from "@/components/RankingBadge";
import { Progress } from "@/components/ui/progress";
import { playSound } from "@/hooks/useSoundEffects";

interface TierTransitionModalProps {
  isOpen: boolean;
  fromTier: RankingTier;
  toTier: RankingTier;
  onClose: () => void;
}

const tierOrder: RankingTier[] = [
  "bronze", "silver", "gold", "sapphire", "emerald",
  "amethyst", "ruby", "quartz", "diamond", "legendary",
];

const tierColors: Record<RankingTier, string> = {
  bronze: "180 60% 45%",
  silver: "210 15% 65%",
  gold: "43 96% 56%",
  sapphire: "217 91% 60%",
  emerald: "152 69% 45%",
  amethyst: "270 50% 55%",
  ruby: "0 72% 51%",
  quartz: "280 30% 70%",
  diamond: "199 89% 68%",
  legendary: "43 96% 56%",
};

const TierTransitionModal = ({ isOpen, fromTier, toTier, onClose }: TierTransitionModalProps) => {
  const [phase, setPhase] = useState<"hidden" | "backdrop" | "icon-in" | "text-in" | "xp-bar" | "fade-out">("hidden");

  const isPromotion = tierOrder.indexOf(toTier) > tierOrder.indexOf(fromTier);
  const targetConfig = tierConfig[toTier];
  const fromConfig = tierConfig[fromTier];
  const TargetIcon = targetConfig.icon;
  const FromIcon = fromConfig.icon;

  useEffect(() => {
    if (!isOpen) {
      setPhase("hidden");
      return;
    }

    setPhase("backdrop");
    const t1 = setTimeout(() => { setPhase("icon-in"); playSound(isPromotion ? "achievement" : "error"); }, 150);
    const t2 = setTimeout(() => setPhase("text-in"), 500);
    const t3 = setTimeout(() => setPhase("xp-bar"), 900);
    const t4 = setTimeout(() => setPhase("fade-out"), 1800);
    const t5 = setTimeout(() => {
      setPhase("hidden");
      onClose();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, onClose]);

  if (phase === "hidden") return null;

  const isFadingOut = phase === "fade-out";
  const showIcon = ["icon-in", "text-in", "xp-bar", "fade-out"].includes(phase);
  const showText = ["text-in", "xp-bar", "fade-out"].includes(phase);
  const showXpBar = ["xp-bar", "fade-out"].includes(phase);

  const bgColor = tierColors[toTier];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        transition: "opacity 0.4s ease",
        opacity: isFadingOut ? 0 : 1,
      }}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, hsla(${bgColor} / 0.25) 0%, hsla(0 0% 0% / 0.7) 100%)`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Tier Icon */}
        <div
          className="relative mb-6"
          style={{
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
            transform: showIcon ? "scale(1)" : "scale(0.3)",
            opacity: showIcon ? 1 : 0,
          }}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              width: 120,
              height: 120,
              background: `radial-gradient(circle, hsla(${bgColor} / 0.4) 0%, transparent 70%)`,
              filter: "blur(20px)",
              transform: "translate(-10px, -10px)",
            }}
          />

          {/* Icon container */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${bgColor}), hsla(${bgColor} / 0.6))`,
              boxShadow: `0 0 40px hsla(${bgColor} / 0.5), 0 0 80px hsla(${bgColor} / 0.2)`,
            }}
          >
            {isPromotion ? (
              <TargetIcon className="w-12 h-12 text-white drop-shadow-lg" />
            ) : (
              <div className="relative">
                {/* Demotion: show crack overlay on old icon transitioning to new */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: showText ? 0 : 1,
                    transition: "opacity 0.5s ease",
                  }}
                >
                  <FromIcon className="w-12 h-12 text-white/60 drop-shadow-lg" />
                </div>
                <div
                  style={{
                    opacity: showText ? 1 : 0,
                    transition: "opacity 0.5s ease 0.2s",
                  }}
                >
                  <TargetIcon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                {/* Crack lines for demotion */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 48 48"
                  style={{
                    opacity: showIcon && !showText ? 0.7 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <path
                    d="M24 4 L22 16 L26 20 L21 28 L25 36 L24 44"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="60"
                    strokeDashoffset="0"
                    style={{
                      animation: "crack-draw 0.4s ease-out forwards",
                    }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Tier Name */}
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-2"
          style={{
            color: `hsl(${bgColor})`,
            transition: "opacity 0.4s ease, transform 0.4s ease",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {targetConfig.label}
        </p>

        {/* Main Text */}
        <h2
          className="text-xl md:text-2xl font-serif font-semibold text-white mb-4"
          style={{
            transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(12px)",
          }}
        >
          {isPromotion
            ? "Novo Patamar Alcançado"
            : `Você voltou para ${targetConfig.label}`}
        </h2>

        {/* XP Bar */}
        <div
          className="w-full max-w-[240px]"
          style={{
            transition: "opacity 0.4s ease, transform 0.4s ease",
            opacity: showXpBar ? 1 : 0,
            transform: showXpBar ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>{targetConfig.minXp} XP</span>
            <span>{targetConfig.maxXp === Infinity ? "∞" : `${targetConfig.maxXp} XP`}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: showXpBar ? (isPromotion ? "5%" : "95%") : "0%",
                background: `linear-gradient(90deg, hsl(${bgColor}), hsla(${bgColor} / 0.7))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Crack animation keyframe */}
      <style>{`
        @keyframes crack-draw {
          from { stroke-dashoffset: 60; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default TierTransitionModal;
