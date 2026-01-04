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
    maxBooks: 5,
  },
  gold: {
    label: "Ouro",
    icon: Crown,
    className: "ranking-gold",
    minBooks: 6,
    maxBooks: 15,
  },
  sapphire: {
    label: "Safira",
    icon: Star,
    className: "ranking-sapphire",
    minBooks: 16,
    maxBooks: 30,
  },
  emerald: {
    label: "Esmeralda",
    icon: Sparkles,
    className: "ranking-emerald",
    minBooks: 31,
    maxBooks: 50,
  },
  amethyst: {
    label: "Ametista",
    icon: Sparkles,
    className: "ranking-amethyst",
    minBooks: 51,
    maxBooks: 80,
  },
  ruby: {
    label: "Rubi",
    icon: Flame,
    className: "ranking-ruby",
    minBooks: 81,
    maxBooks: 120,
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    className: "ranking-diamond",
    minBooks: 121,
    maxBooks: 199,
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    className: "ranking-legendary",
    minBooks: 200,
    maxBooks: Infinity,
  },
};

export const getTierFromBooks = (booksRead: number): RankingTier => {
  if (booksRead >= 200) return "legendary";
  if (booksRead >= 121) return "diamond";
  if (booksRead >= 81) return "ruby";
  if (booksRead >= 51) return "amethyst";
  if (booksRead >= 31) return "emerald";
  if (booksRead >= 16) return "sapphire";
  if (booksRead >= 6) return "gold";
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
