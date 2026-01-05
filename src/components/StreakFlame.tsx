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
  { min: 250, color: "text-foreground", bg: "bg-foreground/10", label: "Preto (Máximo)" },
  { min: 151, color: "text-gray-400", bg: "bg-gray-400/10", label: "Prata" },
  { min: 101, color: "text-white", bg: "bg-slate-200/20", label: "Branco" },
  { min: 61, color: "text-red-500", bg: "bg-red-500/10", label: "Vermelho" },
  { min: 31, color: "text-purple-500", bg: "bg-purple-500/10", label: "Roxo" },
  { min: 15, color: "text-blue-500", bg: "bg-blue-500/10", label: "Azul" },
  { min: 8, color: "text-green-500", bg: "bg-green-500/10", label: "Verde" },
  { min: 4, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Amarelo" },
  { min: 0, color: "text-orange-500", bg: "bg-orange-500/10", label: "Laranja" },
];

const getStreakColor = (days: number) => {
  for (const level of streakLevels) {
    if (days >= level.min) {
      return { color: level.color, bg: level.bg, label: level.label };
    }
  }
  return streakLevels[streakLevels.length - 1];
};

const StreakFlame = ({ days, showLabel = true, size = "md", showInfo = true }: StreakFlameProps) => {
  const streak = getStreakColor(days);

  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-sm", container: "w-10 h-10" },
    md: { icon: "w-6 h-6", text: "text-lg", container: "w-12 h-12" },
    lg: { icon: "w-8 h-8", text: "text-2xl", container: "w-16 h-16" },
  };

  const tooltipContent = (
    <div className="space-y-3 p-2">
      <div>
        <p className="font-bold text-sm mb-1">Sistema de Tocha (Streak)</p>
        <p className="text-xs text-muted-foreground">
          A tocha representa seus dias consecutivos de atividade. 
          Faça qualquer atividade diária para manter a sequência!
        </p>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-bold">Níveis por dias consecutivos:</p>
        {[...streakLevels].reverse().map((level, index) => {
          const nextLevel = [...streakLevels].reverse()[index + 1];
          const range = nextLevel 
            ? `${level.min}-${nextLevel.min - 1} dias` 
            : `${level.min}+ dias`;
          
          return (
            <div 
              key={level.min} 
              className={`flex items-center gap-2 text-xs ${days >= level.min && (nextLevel ? days < nextLevel.min : true) ? 'font-bold' : 'opacity-70'}`}
            >
              <Flame className={`w-3 h-3 ${level.color}`} />
              <span className={level.color}>{level.label}</span>
              <span className="text-muted-foreground">({range})</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size].container} rounded-full ${streak.bg} flex items-center justify-center`}>
        <Flame className={`${sizeClasses[size].icon} ${streak.color}`} />
      </div>
      {showLabel && (
        <div className="flex items-center gap-2">
          <div>
            <p className={`${sizeClasses[size].text} font-bold ${streak.color}`}>{days}</p>
            <p className="text-xs text-muted-foreground">dias de sequência</p>
          </div>
          {showInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-secondary transition-colors">
                    <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {tooltipContent}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
};

export default StreakFlame;
export { getStreakColor, streakLevels };
