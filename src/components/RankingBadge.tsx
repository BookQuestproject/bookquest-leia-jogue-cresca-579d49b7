import { Crown, Medal, Star, Diamond, Flame, Sparkles } from "lucide-react";

type RankingTier = "bronze" | "gold" | "sapphire" | "emerald" | "amethyst" | "ruby" | "diamond" | "legendary";

interface RankingBadgeProps {
  tier: RankingTier;
  booksRead?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const tierConfig = {
  bronze: {
    label: "Bronze",
    icon: Medal,
    className: "ranking-bronze",
    minBooks: 0,
    maxBooks: 4,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minBooks: 5,
    maxBooks: 9,
  },
  sapphire: {
    label: "Safira",
    icon: Star,
    className: "ranking-sapphire",
    minBooks: 10,
    maxBooks: 19,
  },
  emerald: {
    label: "Esmeralda",
    icon: Sparkles,
    className: "ranking-emerald",
    minBooks: 20,
    maxBooks: 34,
  },
  amethyst: {
    label: "Ametista",
    icon: Sparkles,
    className: "ranking-amethyst",
    minBooks: 35,
    maxBooks: 49,
  },
  ruby: {
    label: "Rubi",
    icon: Flame,
    className: "ranking-ruby",
    minBooks: 50,
    maxBooks: 69,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minBooks: 70,
    maxBooks: 99,
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    className: "ranking-legendary",
    minBooks: 100,
    maxBooks: Infinity,
  },
};

export const getTierFromBooks = (booksRead: number): RankingTier => {
  if (booksRead >= 100) return "legendary";
  if (booksRead >= 70) return "diamond";
  if (booksRead >= 50) return "ruby";
  if (booksRead >= 35) return "amethyst";
  if (booksRead >= 20) return "emerald";
  if (booksRead >= 10) return "sapphire";
  if (booksRead >= 5) return "gold";
  return "bronze";
};

export const getNextTierInfo = (currentTier: RankingTier) => {
  const tiers: RankingTier[] = ["bronze", "gold", "sapphire", "emerald", "amethyst", "ruby", "diamond", "legendary"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return null;
  const nextTier = tiers[currentIndex + 1];
  return {
    tier: nextTier,
    booksNeeded: tierConfig[nextTier].minBooks,
    label: tierConfig[nextTier].label,
  };
};

const RankingBadge = ({ tier, booksRead, showLabel = true, size = "md" }: RankingBadgeProps) => {
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
      {booksRead !== undefined && (
        <span className="opacity-80">• {booksRead} livros</span>
      )}
    </div>
  );
};

export default RankingBadge;
export { tierConfig };
export type { RankingTier };
