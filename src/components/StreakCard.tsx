import { Flame } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import EssenciaIcon from "@/components/EssenciaIcon";
import { getStreakColor } from "@/components/StreakFlame";

const STREAK_REWARDS = [
  { days: 3, bonus: 15, label: "3 dias" },
  { days: 7, bonus: 30, label: "7 dias" },
  { days: 14, bonus: 50, label: "14 dias" },
  { days: 30, bonus: 100, label: "30 dias" },
];

interface StreakCardProps {
  compact?: boolean;
}

const StreakCard = ({ compact = false }: StreakCardProps) => {
  const { streak } = useUserStats();
  const streakInfo = getStreakColor(streak);
  const nextReward = STREAK_REWARDS.find(r => r.days > streak);
  const daysToReward = nextReward ? nextReward.days - streak : 0;

  const getMessage = () => {
    if (streak === 0) return "Leia hoje para iniciar sua sequência! 🔥";
    if (streak === 1) return "Ótimo começo! Continue lendo amanhã.";
    if (streak < 7) return `${streak} dias seguidos! Continue assim!`;
    if (streak < 30) return `Incrível! ${streak} dias de leitura!`;
    return `Lendário! ${streak} dias de leitura contínua!`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60">
        <Flame
          className="w-5 h-5 flex-shrink-0"
          style={{
            color: streak === 0 ? "hsl(var(--muted-foreground))" : streakInfo.color,
            filter: streak === 0 ? "grayscale(1)" : undefined,
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">
            {streak === 0 ? "Sem sequência" : `${streak} dias seguidos`}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{getMessage()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 bg-card border border-border/60">
      <div className="flex items-center gap-2 mb-3">
        <Flame
          className="w-5 h-5"
          style={{
            color: streak === 0 ? "hsl(var(--muted-foreground))" : streakInfo.color,
            filter: streak === 0 ? "grayscale(1)" : undefined,
          }}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Sequência de Leitura
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span
          className="text-2xl font-bold"
          style={{ color: streak === 0 ? "hsl(var(--muted-foreground))" : streakInfo.color }}
        >
          {streak}
        </span>
        <span className="text-sm text-muted-foreground">
          {streak === 1 ? "dia seguido" : "dias seguidos"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{getMessage()}</p>

      {/* Next reward */}
      {nextReward && (
        <div className="pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Próximo bônus em <strong className="text-accent">{daysToReward} dias</strong>
            </span>
            <div className="flex items-center gap-1">
              <EssenciaIcon size="xs" className="text-accent" />
              <span className="text-[11px] font-bold text-accent">+{nextReward.bonus}</span>
            </div>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${nextReward ? ((streak % nextReward.days) / nextReward.days) * 100 : 100}%`,
                background: streak === 0
                  ? "hsl(var(--muted-foreground))"
                  : `linear-gradient(90deg, ${streakInfo.color}, ${streakInfo.color}88)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Reward milestones */}
      <div className="flex justify-between mt-3 pt-2">
        {STREAK_REWARDS.map(r => (
          <div
            key={r.days}
            className={`text-center ${streak >= r.days ? "opacity-100" : "opacity-40"}`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-0.5 text-[10px] font-bold"
              style={{
                background: streak >= r.days ? `${streakInfo.color}22` : "hsl(var(--muted) / 0.3)",
                color: streak >= r.days ? streakInfo.color : "hsl(var(--muted-foreground))",
                border: streak >= r.days ? `1px solid ${streakInfo.color}44` : "1px solid transparent",
              }}
            >
              {streak >= r.days ? "✓" : r.days}
            </div>
            <span className="text-[9px] text-muted-foreground">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCard;
export { STREAK_REWARDS };
