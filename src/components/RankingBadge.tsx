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
    minXp: 0,
    maxXp: 99,
    promotionSlots: 10,
  },
  silver: {
    label: "Prata",
    icon: Shield,
    className: "ranking-silver",
    minXp: 100,
    maxXp: 299,
    promotionSlots: 8,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minXp: 300,
    maxXp: 599,
    promotionSlots: 7,
  },
  sapphire: {
    label: "Safira",
    icon: Star,
    className: "ranking-sapphire",
    minXp: 600,
    maxXp: 1099,
    promotionSlots: 6,
  },
  emerald: {
    label: "Esmeralda",
    icon: Sparkles,
    className: "ranking-emerald",
    minXp: 1100,
    maxXp: 1899,
    promotionSlots: 5,
  },
  amethyst: {
    label: "Ametista",
    icon: Gem,
    className: "ranking-amethyst",
    minXp: 1900,
    maxXp: 3199,
    promotionSlots: 5,
  },
  ruby: {
    label: "Rubi",
    icon: Flame,
    className: "ranking-ruby",
    minXp: 3200,
    maxXp: 5199,
    promotionSlots: 4,
  },
  quartz: {
    label: "Quartzo",
    icon: Sparkles,
    className: "ranking-quartz",
    minXp: 5200,
    maxXp: 7999,
    promotionSlots: 3,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minXp: 8000,
    maxXp: 12999,
    promotionSlots: 2,
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    className: "ranking-legendary",
    minXp: 13000,
    maxXp: Infinity,
    promotionSlots: 1,
  },
};

export const getTierFromXp = (xp: number): RankingTier => {
  if (xp >= 13000) return "legendary";
  if (xp >= 8000) return "diamond";
  if (xp >= 5200) return "quartz";
  if (xp >= 3200) return "ruby";
  if (xp >= 1900) return "amethyst";
  if (xp >= 1100) return "emerald";
  if (xp >= 600) return "sapphire";
  if (xp >= 300) return "gold";
  if (xp >= 100) return "silver";
  return "bronze";
};

// Backward compat aliases
export const getTierFromPoints = getTierFromXp;
export const getTierFromBooks = getTierFromXp;

export const getNextTierInfo = (currentTier: RankingTier) => {
  const tiers: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return null;
  const nextTier = tiers[currentIndex + 1];
  return {
    tier: nextTier,
    xpNeeded: tierConfig[nextTier].minXp,
    pointsNeeded: tierConfig[nextTier].minXp,
    label: tierConfig[nextTier].label,
    promotionSlots: tierConfig[currentTier].promotionSlots,
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
        <span className="opacity-80">• {points} XP</span>
      )}
    </div>
  );
};

export default RankingBadge;
export { tierConfig };
export type { RankingTier };
