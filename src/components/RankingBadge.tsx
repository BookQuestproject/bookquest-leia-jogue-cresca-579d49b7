import { Crown, Medal, Star, Diamond, Flame, Sparkles } from "lucide-react";

type RankingTier = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary";

interface RankingBadgeProps {
  tier: RankingTier;
  points?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const tierConfig = {
  bronze: {
    label: "Bronze",
    icon: Medal,
    className: "ranking-bronze",
    minPoints: 0,
    maxPoints: 499,
  },
  silver: {
    label: "Prata",
    icon: Star,
    className: "ranking-silver",
    minPoints: 500,
    maxPoints: 1499,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minPoints: 1500,
    maxPoints: 2999,
  },
  platinum: {
    label: "Platina",
    icon: Sparkles,
    className: "ranking-platinum",
    minPoints: 3000,
    maxPoints: 4999,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minPoints: 5000,
    maxPoints: 9999,
  },
  legendary: {
    label: "Lendário",
    icon: Flame,
    className: "ranking-legendary",
    minPoints: 10000,
    maxPoints: Infinity,
  },
};

export const getTierFromPoints = (points: number): RankingTier => {
  if (points >= 10000) return "legendary";
  if (points >= 5000) return "diamond";
  if (points >= 3000) return "platinum";
  if (points >= 1500) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
};

const RankingBadge = ({ tier, points, showLabel = true, size = "md" }: RankingBadgeProps) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={`ranking-badge ${config.className} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
      {points !== undefined && (
        <span className="opacity-80">• {points.toLocaleString("pt-BR")} pts</span>
      )}
    </div>
  );
};

export default RankingBadge;
export { tierConfig };
export type { RankingTier };
