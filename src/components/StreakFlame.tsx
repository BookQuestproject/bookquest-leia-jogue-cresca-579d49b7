import { useState } from "react";
import { Flame, Info, ChevronRight, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StreakFlameProps {
  days: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
  isAdmin?: boolean;
}

export const streakLevels = [
  { min: 365, color: "#FFFFFF", label: "Primordial", description: "365 dias", glow: true },
  { min: 301, color: "#90E0EF", label: "Celestial", description: "301-364 dias", glow: false },
  { min: 241, color: "#9D0208", label: "Soberano", description: "241-300 dias", glow: false },
  { min: 181, color: "#7B2CBF", label: "Rúnico", description: "181-240 dias", glow: false },
  { min: 121, color: "#00B4D8", label: "Místico", description: "121-180 dias", glow: false },
  { min: 76, color: "#3A86FF", label: "Arcano", description: "76-120 dias", glow: false },
  { min: 46, color: "#F4A261", label: "Incandescente", description: "46-75 dias", glow: false },
  { min: 21, color: "#FFB000", label: "Fogo Consagrado", description: "21-45 dias", glow: false },
  { min: 7, color: "#FF5400", label: "Chama Vigente", description: "7-20 dias", glow: false },
  { min: 0, color: "#FF7A00", label: "Início Ígneo", description: "1-6 dias", glow: false },
];

export const getStreakColor = (days: number) => {
  for (const level of streakLevels) {
    if (days >= level.min) {
      return level;
    }
  }
  return streakLevels[streakLevels.length - 1];
};

const getNextLevel = (days: number) => {
  // Find the next level above current
  const sorted = [...streakLevels].sort((a, b) => a.min - b.min);
  for (const level of sorted) {
    if (level.min > days) {
      return level;
    }
  }
  return null; // Already at max
};

const StreakFlame = ({ days, showLabel = true, size = "md", showInfo = true, isAdmin = false }: StreakFlameProps) => {
  const streak = getStreakColor(days);
  const nextLevel = getNextLevel(days);
  const [showEvolution, setShowEvolution] = useState(false);
  const [simulatedLevel, setSimulatedLevel] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const daysToNext = nextLevel ? nextLevel.min - days : 0;
  const currentLevelStart = streak.min;
  const currentLevelEnd = nextLevel ? nextLevel.min : 365;
  const progressInLevel = nextLevel
    ? ((days - currentLevelStart) / (currentLevelEnd - currentLevelStart)) * 100
    : 100;

  const simulateTransition = (targetIndex: number) => {
    setAnimating(true);
    const sortedLevels = [...streakLevels].sort((a, b) => a.min - b.min);
    let step = 0;
    const interval = setInterval(() => {
      if (step <= targetIndex) {
        setSimulatedLevel(step);
        step++;
      } else {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 800);
  };

  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-sm", container: "w-12 h-12" },
    md: { icon: "w-8 h-8", text: "text-lg", container: "w-14 h-14" },
    lg: { icon: "w-10 h-10", text: "text-2xl", container: "w-16 h-16" },
  };

  const sortedLevelsAsc = [...streakLevels].sort((a, b) => a.min - b.min);
  const currentSimLevel = simulatedLevel !== null ? sortedLevelsAsc[simulatedLevel] : null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Sequência</h3>
        {showInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs p-4">
                <p className="font-semibold mb-2">Ordem da Chama</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Mantenha sua sequência realizando atividades diárias. Se ficar um dia sem atividade, a sequência zera.
                </p>
                <div className="space-y-1.5 text-xs">
                  {sortedLevelsAsc.map((level) => (
                    <div key={level.min} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Flame className="w-3 h-3" style={{ color: level.color, filter: level.glow ? `drop-shadow(0 0 4px ${level.color})` : undefined }} />
                        <span style={{ color: level.color }}>{level.label}</span>
                      </div>
                      <span className="text-muted-foreground">{level.description}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Central torch icon */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div
          className={`${sizeClasses[size].container} rounded-full flex items-center justify-center transition-all duration-500`}
          style={{
            background: `${streak.color}15`,
            boxShadow: streak.glow
              ? `0 0 20px ${streak.color}40, 0 0 40px ${streak.color}20`
              : `0 0 12px ${streak.color}20`,
          }}
        >
          <Flame
            className={`${sizeClasses[size].icon} transition-colors duration-500 ${days > 0 ? "animate-pulse" : ""}`}
            style={{
              color: streak.color,
              filter: streak.glow
                ? `drop-shadow(0 0 8px ${streak.color}) drop-shadow(0 0 16px ${streak.color}80)`
                : `drop-shadow(0 0 4px ${streak.color}80)`,
            }}
          />
        </div>

        {/* Level name */}
        <p
          className="text-sm font-bold tracking-wide transition-colors duration-500"
          style={{ color: streak.color, filter: streak.glow ? `drop-shadow(0 0 6px ${streak.color}80)` : undefined }}
        >
          {streak.label}
        </p>

        {/* Days count */}
        {showLabel && (
          <p className="text-xs text-muted-foreground">
            {days === 0
              ? "Complete uma atividade para iniciar"
              : `${days} ${days === 1 ? "dia" : "dias"} consecutivo${days === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      {/* Progress bar to next level */}
      {nextLevel && days > 0 && (
        <div className="space-y-2">
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressInLevel}%`,
                background: `linear-gradient(90deg, ${streak.color}, ${nextLevel.color})`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Faltam <span className="font-semibold text-foreground">{daysToNext}</span> dias para evoluir
            </span>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3" style={{ color: nextLevel.color }} />
              <span style={{ color: nextLevel.color }} className="font-medium">{nextLevel.label}</span>
            </div>
          </div>
        </div>
      )}

      {days >= 365 && (
        <p className="text-xs text-center mt-2 font-medium" style={{ color: streak.color, filter: `drop-shadow(0 0 6px ${streak.color}80)` }}>
          🏆 Marco máximo alcançado!
        </p>
      )}

      {days === 0 && (
        <div className="h-2 rounded-full overflow-hidden bg-muted mt-1">
          <div className="h-full rounded-full w-0" />
        </div>
      )}

      {/* All levels list */}
      <div className="mt-4 pt-4 border-t border-border/60 space-y-1">
        {sortedLevelsAsc.map((level) => {
          const isCurrent = streak.label === level.label && days > 0;
          return (
            <div
              key={level.min}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${isCurrent ? "bg-muted" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Flame
                  className="w-3.5 h-3.5"
                  style={{
                    color: level.color,
                    filter: level.glow ? `drop-shadow(0 0 4px ${level.color})` : undefined,
                    opacity: isCurrent || days === 0 ? 1 : 0.5,
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color: level.color,
                    opacity: isCurrent || days === 0 ? 1 : 0.6,
                  }}
                >
                  {level.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{level.description}</span>
                {isCurrent && (
                  <ChevronRight className="w-3 h-3 text-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin evolution viewer */}
      {isAdmin && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2 text-xs"
            onClick={() => {
              setSimulatedLevel(null);
              setShowEvolution(true);
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            Visualizar Evoluções da Chama
          </Button>

          <Dialog open={showEvolution} onOpenChange={setShowEvolution}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif">
                  <Flame className="w-5 h-5 text-accent" />
                  Simulador de Evolução
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4 py-4">
                {/* Animated torch display */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700"
                  style={{
                    background: currentSimLevel ? `${currentSimLevel.color}15` : `${sortedLevelsAsc[0].color}15`,
                    boxShadow: currentSimLevel?.glow
                      ? `0 0 30px ${currentSimLevel.color}50, 0 0 60px ${currentSimLevel.color}25`
                      : currentSimLevel
                      ? `0 0 16px ${currentSimLevel.color}30`
                      : "none",
                  }}
                >
                  <Flame
                    className="w-12 h-12 transition-all duration-700"
                    style={{
                      color: currentSimLevel?.color || sortedLevelsAsc[0].color,
                      filter: currentSimLevel?.glow
                        ? `drop-shadow(0 0 12px ${currentSimLevel.color}) drop-shadow(0 0 24px ${currentSimLevel.color}80)`
                        : currentSimLevel
                        ? `drop-shadow(0 0 6px ${currentSimLevel.color}80)`
                        : "none",
                    }}
                  />
                </div>

                <p
                  className="text-lg font-bold transition-colors duration-700"
                  style={{ color: currentSimLevel?.color || "var(--muted-foreground)" }}
                >
                  {currentSimLevel?.label || "Selecione uma simulação"}
                </p>
                {currentSimLevel && (
                  <p className="text-xs text-muted-foreground">{currentSimLevel.description}</p>
                )}
              </div>

              {/* Simulation controls */}
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2"
                  disabled={animating}
                  onClick={() => simulateTransition(sortedLevelsAsc.length - 1)}
                >
                  ▶ Simular promoção completa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={animating}
                  onClick={() => {
                    setAnimating(true);
                    const total = sortedLevelsAsc.length - 1;
                    let step = total;
                    setSimulatedLevel(total);
                    const interval = setInterval(() => {
                      if (step >= 0) {
                        setSimulatedLevel(step);
                        step--;
                      } else {
                        clearInterval(interval);
                        setAnimating(false);
                      }
                    }, 800);
                  }}
                >
                  ◀ Simular rebaixamento completo
                </Button>
              </div>

              {/* Quick jump buttons */}
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {sortedLevelsAsc.map((level, index) => (
                  <button
                    key={level.min}
                    disabled={animating}
                    onClick={() => setSimulatedLevel(index)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors hover:bg-muted ${
                      simulatedLevel === index ? "bg-muted ring-1 ring-border" : ""
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: level.color, filter: level.glow ? `drop-shadow(0 0 4px ${level.color})` : undefined }} />
                    <span className="font-medium truncate" style={{ color: level.color }}>{level.label}</span>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default StreakFlame;
