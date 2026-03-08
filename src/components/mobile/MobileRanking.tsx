import { useState } from "react";
import { Trophy, Crown, Flame, Lock, Clock, ArrowUp } from "lucide-react";
import RankingBadge, { RankingTier, tierConfig, getTierFromXp } from "@/components/RankingBadge";
import { RankingUser } from "@/hooks/useRanking";

interface MobileRankingProps {
  users: RankingUser[];
  loading: boolean;
}

const tierOrder: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];

const rankingTiers = [
  { tier: "bronze" as RankingTier, label: "Bronze", slots: 10 },
  { tier: "silver" as RankingTier, label: "Prata", slots: 8 },
  { tier: "gold" as RankingTier, label: "Ouro", slots: 7 },
  { tier: "sapphire" as RankingTier, label: "Safira", slots: 6 },
  { tier: "emerald" as RankingTier, label: "Esmeralda", slots: 5 },
  { tier: "amethyst" as RankingTier, label: "Ametista", slots: 5 },
  { tier: "ruby" as RankingTier, label: "Rubi", slots: 4 },
  { tier: "quartz" as RankingTier, label: "Quartzo", slots: 3 },
  { tier: "diamond" as RankingTier, label: "Diamante", slots: 2 },
  { tier: "legendary" as RankingTier, label: "Lendário", slots: 1 },
];

const getDaysUntilWeekEnd = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
};

const MobileRanking = ({ users, loading }: MobileRankingProps) => {
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  
  const currentUser = users.find(u => u.isCurrentUser);
  const currentUserTier: RankingTier = currentUser?.tier || "bronze";
  const currentTierIndex = tierOrder.indexOf(currentUserTier);
  const daysLeft = getDaysUntilWeekEnd();

  const isTierLocked = (tier: RankingTier) => tierOrder.indexOf(tier) > currentTierIndex;

  const tierUsers = users
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.xp - a.xp);

  const selectedTierInfo = rankingTiers.find(t => t.tier === selectedTier)!;
  const currentUserPosition = tierUsers.findIndex(u => u.isCurrentUser) + 1;

  return (
    <div className="px-4 pt-2 pb-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold">Ranking</h1>
          <p className="text-xs text-muted-foreground">Evolua com dedicação</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold">
            {daysLeft === 0 ? "Hoje!" : `${daysLeft}d`}
          </span>
        </div>
      </div>

      {/* Your Position Highlight */}
      {currentUserTier === selectedTier && currentUserPosition > 0 && (
        <div className="rounded-xl p-4 bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">#{currentUserPosition}</p>
              <p className="text-[10px] text-muted-foreground">de {tierUsers.length}</p>
            </div>
            <div className="w-px h-10 bg-accent/20" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <RankingBadge tier={currentUserTier} showLabel={false} size="sm" />
                <span className="text-sm font-semibold">{currentUser?.essencia || 0} ✦</span>
              </div>
              <p className="text-[11px] text-accent font-medium">
                Top {selectedTierInfo.slots} avançam de patamar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {rankingTiers.map(({ tier, label }) => {
          const locked = isTierLocked(tier);
          return (
            <button
              key={tier}
              onClick={() => !locked && setSelectedTier(tier)}
              disabled={locked}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0 text-xs font-medium transition-all active:scale-95 ${
                locked
                  ? "opacity-40 bg-muted/20"
                  : selectedTier === tier
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "bg-card border border-border/40 text-muted-foreground"
              }`}
            >
              <RankingBadge tier={tier} showLabel={false} size="sm" />
              {label}
              {locked && <Lock className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Carregando ranking...</p>
        </div>
      ) : tierUsers.length === 0 ? (
        <div className="text-center py-8 rounded-xl bg-card border border-border/60">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-sm mb-1">Nenhum participante</h3>
          <p className="text-xs text-muted-foreground">
            Seja o primeiro a alcançar o nível {tierConfig[selectedTier].label}!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {tierUsers.length >= 3 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-3 bg-card border border-border/60 text-center pt-6">
                <p className="text-xs font-bold text-muted-foreground mb-1">2º</p>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 text-sm font-semibold">
                  {tierUsers[1]?.avatar}
                </div>
                <p className="text-base mb-0.5">🥈</p>
                <p className="text-[11px] font-semibold truncate">{tierUsers[1]?.isCurrentUser ? 'Você' : tierUsers[1]?.name}</p>
                <p className="text-[11px] font-bold text-accent">{tierUsers[1]?.essencia} ✦</p>
              </div>
              <div className="rounded-xl p-3 bg-card border border-accent/30 text-center">
                <Crown className="w-4 h-4 text-accent mx-auto mb-1" />
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-1 text-sm font-semibold text-accent">
                  {tierUsers[0]?.avatar}
                </div>
                <p className="text-lg mb-0.5">🥇</p>
                <p className="text-[11px] font-bold truncate">{tierUsers[0]?.isCurrentUser ? 'Você' : tierUsers[0]?.name}</p>
                <p className="text-xs font-bold text-accent">{tierUsers[0]?.essencia} ✦</p>
              </div>
              <div className="rounded-xl p-3 bg-card border border-border/60 text-center pt-8">
                <p className="text-xs font-bold text-muted-foreground mb-1">3º</p>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 text-sm font-semibold">
                  {tierUsers[2]?.avatar}
                </div>
                <p className="text-base mb-0.5">🥉</p>
                <p className="text-[11px] font-semibold truncate">{tierUsers[2]?.isCurrentUser ? 'Você' : tierUsers[2]?.name}</p>
                <p className="text-[11px] font-bold text-accent">{tierUsers[2]?.xp} XP</p>
              </div>
            </div>
          )}

          {/* Ranking List */}
          <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
            {tierUsers.slice(tierUsers.length >= 3 ? 3 : 0).map((user, index) => {
              const position = tierUsers.length >= 3 ? index + 4 : index + 1;
              const isCurrentUser = user.isCurrentUser;
              const inPromotion = position <= selectedTierInfo.slots;

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-b-0 ${
                    isCurrentUser ? "bg-accent/5" : ""
                  }`}
                >
                  <span className={`text-sm font-bold w-6 text-center ${inPromotion ? "text-accent" : "text-muted-foreground"}`}>
                    {position}
                  </span>
                  {inPromotion && <ArrowUp className="w-3 h-3 text-accent -ml-1" />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    inPromotion ? "bg-accent/15 text-accent" : "bg-muted"
                  }`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrentUser ? "text-accent" : ""}`}>
                      {isCurrentUser ? 'Você' : user.name}
                      {isCurrentUser && <span className="text-[10px] opacity-60 ml-1">(você)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${inPromotion ? "text-accent" : ""}`}>{user.xp} XP</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <Flame className="w-3 h-3 text-accent/60" />
                      <span className="text-[10px] text-muted-foreground">{user.streak}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileRanking;
