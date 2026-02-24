import { Crown, Medal, Star, Diamond, Flame, Sparkles, Shield, Gem } from "lucide-react";

type RankingTier = "bronze" | "silver" | "gold" | "sapphire" | "emerald" | "amethyst" | "ruby" | "quartz" | "diamond" | "legendary";

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
    maxPoints: 99,
  },
  silver: {
    label: "Prata",
    icon: Shield,
    className: "ranking-silver",
    minPoints: 100,
    maxPoints: 249,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minPoints: 250,
    maxPoints: 499,
  },
  sapphire: {
    label: "Safira",
    icon: Star,
    className: "ranking-sapphire",
    minPoints: 500,
    maxPoints: 999,
  },
  emerald: {
    label: "Esmeralda",
    icon: Sparkles,
    className: "ranking-emerald",
    minPoints: 1000,
    maxPoints: 1999,
  },
  amethyst: {
    label: "Ametista",
    icon: Gem,
    className: "ranking-amethyst",
    minPoints: 2000,
    maxPoints: 3499,
  },
  ruby: {
    label: "Rubi",
    icon: Flame,
    className: "ranking-ruby",
    minPoints: 3500,
    maxPoints: 5499,
  },
  quartz: {
    label: "Quartzo",
    icon: Sparkles,
    className: "ranking-quartz",
    minPoints: 5500,
    maxPoints: 7999,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minPoints: 8000,
    maxPoints: 11999,
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    className: "ranking-legendary",
    minPoints: 12000,
    maxPoints: Infinity,
  },
};

export const getTierFromPoints = (points: number): RankingTier => {
  if (points >= 12000) return "legendary";
  if (points >= 8000) return "diamond";
  if (points >= 5500) return "quartz";
  if (points >= 3500) return "ruby";
  if (points >= 2000) return "amethyst";
  if (points >= 1000) return "emerald";
  if (points >= 500) return "sapphire";
  if (points >= 250) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
};

// Keep backward compat alias
export const getTierFromBooks = getTierFromPoints;

export const getNextTierInfo = (currentTier: RankingTier) => {
  const tiers: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return null;
  const nextTier = tiers[currentIndex + 1];
  return {
    tier: nextTier,
    pointsNeeded: tierConfig[nextTier].minPoints,
    // Keep backward compat
    booksNeeded: tierConfig[nextTier].minPoints,
    label: tierConfig[nextTier].label,
  };
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
        <span className="opacity-80">• {points} 🔥</span>
      )}
    </div>
  );
};

export default RankingBadge;
export { tierConfig };
export type { RankingTier };
