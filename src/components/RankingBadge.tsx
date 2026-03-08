import { Crown, Medal, Star, Diamond, Flame, Sparkles, Shield, Gem } from "lucide-react";
import EssenciaIcon from "@/components/EssenciaIcon";

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
    minEssencia: 0,
    maxEssencia: 99,
    promotionSlots: 10,
  },
  silver: {
    label: "Prata",
    icon: Shield,
    className: "ranking-silver",
    minEssencia: 100,
    maxEssencia: 299,
    promotionSlots: 8,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minEssencia: 300,
    maxEssencia: 599,
    promotionSlots: 7,
  },
  sapphire: {
    label: "Safira",
    icon: Star,
    className: "ranking-sapphire",
    minEssencia: 600,
    maxEssencia: 1099,
    promotionSlots: 6,
  },
  emerald: {
    label: "Esmeralda",
    icon: Sparkles,
    className: "ranking-emerald",
    minEssencia: 1100,
    maxEssencia: 1899,
    promotionSlots: 5,
  },
  amethyst: {
    label: "Ametista",
    icon: Gem,
    className: "ranking-amethyst",
    minEssencia: 1900,
    maxEssencia: 3199,
    promotionSlots: 5,
  },
  ruby: {
    label: "Rubi",
    icon: Flame,
    className: "ranking-ruby",
    minEssencia: 3200,
    maxEssencia: 5199,
    promotionSlots: 4,
  },
  quartz: {
    label: "Quartzo",
    icon: Sparkles,
    className: "ranking-quartz",
    minEssencia: 5200,
    maxEssencia: 7999,
    promotionSlots: 3,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minEssencia: 8000,
    maxEssencia: 12999,
    promotionSlots: 2,
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    className: "ranking-legendary",
    minEssencia: 13000,
    maxEssencia: Infinity,
    promotionSlots: 1,
  },
};

export const getTierFromEssencia = (essencia: number): RankingTier => {
  if (essencia >= 13000) return "legendary";
  if (essencia >= 8000) return "diamond";
  if (essencia >= 5200) return "quartz";
  if (essencia >= 3200) return "ruby";
  if (essencia >= 1900) return "amethyst";
  if (essencia >= 1100) return "emerald";
  if (essencia >= 600) return "sapphire";
  if (essencia >= 300) return "gold";
  if (essencia >= 100) return "silver";
  return "bronze";
};

// Backward compat aliases
export const getTierFromXp = getTierFromEssencia;
export const getTierFromPoints = getTierFromEssencia;
export const getTierFromBooks = getTierFromEssencia;

export const getNextTierInfo = (currentTier: RankingTier) => {
  const tiers: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return null;
  const nextTier = tiers[currentIndex + 1];
  return {
    tier: nextTier,
    essenciaNeeded: tierConfig[nextTier].minEssencia,
    pointsNeeded: tierConfig[nextTier].minEssencia,
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
        <span className="opacity-80 flex items-center gap-1">
          • {points} <EssenciaIcon size="xs" />
        </span>
      )}
    </div>
  );
};

export default RankingBadge;
export { tierConfig };
export type { RankingTier };
