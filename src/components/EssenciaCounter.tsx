import { useState, useEffect } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { cn } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EssenciaCounterProps {
  className?: string;
  size?: "sm" | "md";
}

const EssenciaCounter = ({ className, size = "sm" }: EssenciaCounterProps) => {
  const { essencia, recentGain } = useUserStats();
  const [animating, setAnimating] = useState(false);
  const [showGain, setShowGain] = useState(false);
  const [gainAmount, setGainAmount] = useState(0);

  useEffect(() => {
    if (recentGain > 0) {
      setGainAmount(recentGain);
      setAnimating(true);
      setShowGain(true);

      const animTimer = setTimeout(() => setAnimating(false), 600);
      const gainTimer = setTimeout(() => setShowGain(false), 2500);

      return () => {
        clearTimeout(animTimer);
        clearTimeout(gainTimer);
      };
    }
  }, [recentGain]);

  const sizeStyles = {
    sm: "px-2.5 py-1 gap-1.5 text-xs",
    md: "px-3 py-1.5 gap-2 text-sm",
  };

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <div
        className={cn(
          "inline-flex items-center rounded-full font-bold transition-all duration-300",
          "bg-accent/10 border border-accent/20 text-accent",
          sizeStyles[size],
          animating && "scale-110 border-accent/50 bg-accent/20 shadow-[0_0_12px_hsl(var(--accent)/0.3)]"
        )}
      >
        <span
          className={cn(
            "text-accent transition-transform duration-300",
            animating && "scale-125"
          )}
        >
          ✦
        </span>
        <span>{essencia}</span>
      </div>

      {/* Floating gain animation */}
      {showGain && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-50"
          style={{
            animation: "essencia-float 2.5s ease-out forwards",
          }}
        >
          <span className="text-xs font-bold text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]">
            +{gainAmount} ✦
          </span>
        </div>
      )}

      <style>{`
        @keyframes essencia-float {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default EssenciaCounter;
