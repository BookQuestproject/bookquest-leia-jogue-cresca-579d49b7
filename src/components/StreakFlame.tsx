import { Flame } from "lucide-react";

interface StreakFlameProps {
  days: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const getStreakColor = (days: number) => {
  if (days >= 250) return { color: "text-foreground", bg: "bg-foreground/10", label: "Preto" };
  if (days >= 151) return { color: "text-muted-foreground", bg: "bg-muted", label: "Prata" };
  if (days >= 101) return { color: "text-white", bg: "bg-slate-100", label: "Branco" };
  if (days >= 61) return { color: "text-red-500", bg: "bg-red-500/10", label: "Vermelho" };
  if (days >= 31) return { color: "text-purple-500", bg: "bg-purple-500/10", label: "Roxo" };
  if (days >= 15) return { color: "text-blue-500", bg: "bg-blue-500/10", label: "Azul" };
  if (days >= 8) return { color: "text-green-500", bg: "bg-green-500/10", label: "Verde" };
  if (days >= 4) return { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Amarelo" };
  return { color: "text-orange-500", bg: "bg-orange-500/10", label: "Laranja" };
};

const StreakFlame = ({ days, showLabel = true, size = "md" }: StreakFlameProps) => {
  const streak = getStreakColor(days);

  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-sm", container: "w-10 h-10" },
    md: { icon: "w-6 h-6", text: "text-lg", container: "w-12 h-12" },
    lg: { icon: "w-8 h-8", text: "text-2xl", container: "w-16 h-16" },
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size].container} rounded-full ${streak.bg} flex items-center justify-center`}>
        <Flame className={`${sizeClasses[size].icon} ${streak.color}`} />
      </div>
      {showLabel && (
        <div>
          <p className={`${sizeClasses[size].text} font-bold ${streak.color}`}>{days}</p>
          <p className="text-xs text-muted-foreground">dias de sequência</p>
        </div>
      )}
    </div>
  );
};

export default StreakFlame;
export { getStreakColor };
