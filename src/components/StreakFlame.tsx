import { useState } from "react";
import { Flame, ChevronRight, Snowflake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStreakFreeze } from "@/hooks/useStreakFreeze";

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
    if (days >= level.min) return level;
  }
  return streakLevels[streakLevels.length - 1];
};

const getNextLevel = (days: number) => {
  const sorted = [...streakLevels].sort((a, b) => a.min - b.min);
  for (const level of sorted) {
    if (level.min > days) return level;
  }
  return null;
};

const StreakFlame = ({ days }: StreakFlameProps) => {
  const streak = getStreakColor(days);
  const nextLevel = getNextLevel(days);
  const [showLevels, setShowLevels] = useState(false);
  const { quantity: freezeCount, useFreeze, wasFrozenToday } = useStreakFreeze();

  const daysToNext = nextLevel ? nextLevel.min - days : 0;
  const currentLevelStart = streak.min;
  const currentLevelEnd = nextLevel ? nextLevel.min : 365;
  const progressInLevel = nextLevel
    ? ((days - currentLevelStart) / (currentLevelEnd - currentLevelStart)) * 100
    : 100;

  const sortedLevelsAsc = [...streakLevels].sort((a, b) => a.min - b.min);

  const isInactive = days === 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Sequência</h3>
        <span className="text-xs font-bold text-muted-foreground">{days} {days === 1 ? "dia" : "dias"}</span>
      </div>

      {/* Current level — compact */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 streak-flame-container ${isInactive ? "" : "streak-flame-active"}`}
          style={{
            background: isInactive ? "hsl(var(--muted) / 0.4)" : `${streak.color}12`,
            boxShadow: streak.glow ? `0 0 12px ${streak.color}30` : undefined,
          }}
        >
          <Flame
            className={`w-5 h-5 ${isInactive ? "" : "streak-flame-pulse"}`}
            style={{
              color: isInactive ? "hsl(var(--muted-foreground) / 0.35)" : streak.color,
              filter: isInactive
                ? "grayscale(1) opacity(0.5)"
                : streak.glow
                ? `drop-shadow(0 0 6px ${streak.color})`
                : `drop-shadow(0 0 3px ${streak.color}60)`,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: isInactive ? "hsl(var(--muted-foreground))" : streak.color }}>
            {isInactive ? "Sem sequência" : streak.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {isInactive ? "Leia hoje para começar!" : `${days} ${days === 1 ? "dia" : "dias"} consecutivo${days === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {days > 0 && nextLevel && (
        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full overflow-hidden bg-muted/60">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressInLevel}%`,
                background: `linear-gradient(90deg, ${streak.color}, ${nextLevel.color})`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{daysToNext}</span> dias para evoluir
            </span>
            <span className="font-medium" style={{ color: nextLevel.color }}>{nextLevel.label}</span>
          </div>
        </div>
      )}

      {days >= 365 && (
        <p className="text-[11px] text-center font-medium" style={{ color: streak.color }}>
          🏆 Marco máximo alcançado!
        </p>
      )}

      {days === 0 && (
        <div className="h-1.5 rounded-full overflow-hidden bg-muted/60">
          <div className="h-full rounded-full w-0" />
        </div>
      )}

      {/* Streak Freeze */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Snowflake className="w-3.5 h-3.5 text-blue-400" />
          <span>{freezeCount} congelamento{freezeCount !== 1 ? "s" : ""}</span>
        </div>
        {days > 0 && !wasFrozenToday() && freezeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-2 text-blue-400 hover:text-blue-300"
            onClick={useFreeze}
          >
            <Snowflake className="w-3 h-3 mr-1" />
            Usar
          </Button>
        )}
        {wasFrozenToday() && (
          <span className="text-[10px] text-blue-400 font-medium">❄️ Congelado hoje</span>
        )}
      </div>

      {/* View levels button */}
      <button
        onClick={() => setShowLevels(true)}
        className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        Ver todos os níveis
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* Levels modal */}
      <Dialog open={showLevels} onOpenChange={setShowLevels}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              Ordem da Chama
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Complete atividades diárias para evoluir. Um dia sem atividade zera a sequência.
          </p>
          <div className="space-y-0.5 mt-2">
            {sortedLevelsAsc.map((level) => {
              const isCurrent = streak.label === level.label && days > 0;
              return (
                <div
                  key={level.min}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${isCurrent ? "bg-muted" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Flame
                      className="w-3 h-3 flex-shrink-0"
                      style={{
                        color: level.color,
                        opacity: isCurrent ? 1 : 0.5,
                        filter: level.glow ? `drop-shadow(0 0 3px ${level.color})` : undefined,
                      }}
                    />
                    <span className="font-medium" style={{ color: level.color, opacity: isCurrent ? 1 : 0.65 }}>
                      {level.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{level.description}</span>
                    {isCurrent && <ChevronRight className="w-3 h-3 text-foreground" />}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreakFlame;
