import { Flame, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakFlameProps {
  days: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
}

const streakLevels = [
  { min: 250, color: "text-foreground", label: "Lendário", description: "250+ dias" },
  { min: 151, color: "text-muted-foreground", label: "Transcendente", description: "151-249 dias" },
  { min: 101, color: "text-foreground dark:text-primary-foreground", label: "Iluminado", description: "101-150 dias" },
  { min: 61, color: "text-ruby", label: "Infernal", description: "61-100 dias" },
  { min: 31, color: "text-amethyst", label: "Místico", description: "31-60 dias" },
  { min: 15, color: "text-sapphire", label: "Dedicado", description: "15-30 dias" },
  { min: 8, color: "text-emerald", label: "Constante", description: "8-14 dias" },
  { min: 4, color: "text-accent", label: "Crescente", description: "4-7 dias" },
  { min: 0, color: "text-secondary", label: "Iniciante", description: "1-3 dias" },
];

const getStreakColor = (days: number) => {
  for (const level of streakLevels) {
    if (days >= level.min) {
      return { color: level.color, label: level.label };
    }
  }
  return streakLevels[streakLevels.length - 1];
};

const StreakFlame = ({ days, showLabel = true, size = "md", showInfo = true }: StreakFlameProps) => {
  const streak = getStreakColor(days);

  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-sm", container: "w-10 h-10" },
    md: { icon: "w-5 h-5", text: "text-lg", container: "w-10 h-10" },
    lg: { icon: "w-8 h-8", text: "text-2xl", container: "w-14 h-14" },
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
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
                <p className="font-semibold mb-2">Sistema de Sequência</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Mantenha sua sequência realizando atividades diárias. Se ficar um dia sem atividade, a sequência zera.
                </p>
                <div className="space-y-1.5 text-xs">
                  {[...streakLevels].reverse().map((level) => (
                    <div key={level.min} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Flame className={`w-3 h-3 ${level.color}`} />
                        <span className={level.color}>{level.label}</span>
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
      
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size].container} rounded bg-muted/50 flex items-center justify-center`}>
          <Flame className={`${sizeClasses[size].icon} ${streak.color} ${days > 0 ? "animate-pulse" : ""}`} />
        </div>
        {showLabel && (
          <div>
            <p className={`${sizeClasses[size].text} font-bold ${streak.color}`}>{days}</p>
            <p className="text-xs text-muted-foreground">
              {days === 1 ? "dia" : "dias"} de sequência
            </p>
          </div>
        )}
      </div>
      
      {days === 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Complete uma atividade para iniciar sua sequência
        </p>
      )}
      
      {days > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Nível: <span className={`font-medium ${streak.color}`}>{streak.label}</span>
        </p>
      )}
    </div>
  );
};

export default StreakFlame;
export { getStreakColor, streakLevels };