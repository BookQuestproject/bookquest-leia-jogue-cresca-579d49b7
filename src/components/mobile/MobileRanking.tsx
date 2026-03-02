import { useState } from "react";
import { Trophy, Crown, Flame, Lock, Clock, ArrowUp } from "lucide-react";
import RankingBadge, { RankingTier, tierConfig, getTierFromXp } from "@/components/RankingBadge";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  tier: RankingTier;
  streak: number;
}

const allUsers: RankingUser[] = [
  { id: 101, name: "Você", avatar: "VC", xp: 35, tier: "bronze", streak: 2 },
  { id: 102, name: "Fernanda Rocha", avatar: "FR", xp: 80, tier: "bronze", streak: 5 },
  { id: 103, name: "Bruno Dias", avatar: "BD", xp: 65, tier: "bronze", streak: 3 },
  { id: 104, name: "Amanda Costa", avatar: "AC", xp: 45, tier: "bronze", streak: 1 },
  { id: 105, name: "Gustavo Pereira", avatar: "GP", xp: 72, tier: "bronze", streak: 4 },
  { id: 106, name: "Clara Melo", avatar: "CM", xp: 58, tier: "bronze", streak: 2 },
  { id: 107, name: "Diego Farias", avatar: "DF", xp: 41, tier: "bronze", streak: 1 },
  { id: 108, name: "Natália Reis", avatar: "NR", xp: 33, tier: "bronze", streak: 1 },
  { id: 109, name: "Otávio Cruz", avatar: "OC", xp: 28, tier: "bronze", streak: 0 },
  { id: 110, name: "Valentina Lopes", avatar: "VL", xp: 22, tier: "bronze", streak: 0 },
];

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

const MobileRanking = () => {
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  const currentUserTier: RankingTier = "bronze";
  const currentTierIndex = tierOrder.indexOf(currentUserTier);
  const daysLeft = getDaysUntilWeekEnd();

  const isTierLocked = (tier: RankingTier) => tierOrder.indexOf(tier) > currentTierIndex;

  const tierUsers = allUsers
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.xp - a.xp);

  const selectedTierInfo = rankingTiers.find(t => t.tier === selectedTier)!;
  const currentUserPosition = tierUsers.findIndex(u => u.name === "Você") + 1;

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
                <span className="text-sm font-semibold">35 XP</span>
              </div>
              <p className="text-[11px] text-accent font-medium">
                Top {selectedTierInfo.slots} avançam de patamar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Selector — Horizontal Scroll */}
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

      {/* Top 3 Podium — Compact */}
      {tierUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-2">
          {/* 2nd */}
          <div className="rounded-xl p-3 bg-card border border-border/60 text-center pt-6">
            <p className="text-xs font-bold text-muted-foreground mb-1">2º</p>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 text-sm font-semibold">
              {tierUsers[1]?.avatar}
            </div>
            <p className="text-base mb-0.5">🥈</p>
            <p className="text-[11px] font-semibold truncate">{tierUsers[1]?.name}</p>
            <p className="text-[11px] font-bold text-accent">{tierUsers[1]?.xp} XP</p>
          </div>
          {/* 1st */}
          <div className="rounded-xl p-3 bg-card border border-accent/30 text-center">
            <Crown className="w-4 h-4 text-accent mx-auto mb-1" />
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-1 text-sm font-semibold text-accent">
              {tierUsers[0]?.avatar}
            </div>
            <p className="text-lg mb-0.5">🥇</p>
            <p className="text-[11px] font-bold truncate">{tierUsers[0]?.name}</p>
            <p className="text-xs font-bold text-accent">{tierUsers[0]?.xp} XP</p>
          </div>
          {/* 3rd */}
          <div className="rounded-xl p-3 bg-card border border-border/60 text-center pt-8">
            <p className="text-xs font-bold text-muted-foreground mb-1">3º</p>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 text-sm font-semibold">
              {tierUsers[2]?.avatar}
            </div>
            <p className="text-base mb-0.5">🥉</p>
            <p className="text-[11px] font-semibold truncate">{tierUsers[2]?.name}</p>
            <p className="text-[11px] font-bold text-accent">{tierUsers[2]?.xp} XP</p>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="rounded-xl bg-card border border-border/60 overflow-hidden">
        {tierUsers.slice(3).map((user, index) => {
          const position = index + 4;
          const isCurrentUser = user.name === "Você";
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
                  {user.name}
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
    </div>
  );
};

export default MobileRanking;
