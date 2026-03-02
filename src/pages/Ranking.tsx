import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Crown, TrendingUp, Flame, Users, Target, Zap, Calendar, BookOpen, Lock, Clock, ArrowUp, ChevronUp, Eye } from "lucide-react";
import Layout from "@/components/layout/Layout";
import RankingBadge, { RankingTier, tierConfig, getTierFromXp } from "@/components/RankingBadge";
import { Button } from "@/components/ui/button";
import TierTransitionModal from "@/components/TierTransitionModal";
import { useAdmin } from "@/hooks/useAdmin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileRanking from "@/components/mobile/MobileRanking";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  tier: RankingTier;
  streak: number;
}

// Mock users organized by tier with XP-based system
const allUsers: RankingUser[] = [
  // Bronze (0-99 XP)
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
  { id: 111, name: "Henrique Barros", avatar: "HB", xp: 15, tier: "bronze", streak: 0 },
  { id: 112, name: "Sofia Duarte", avatar: "SD", xp: 10, tier: "bronze", streak: 0 },

  // Prata (100-299 XP)
  { id: 151, name: "Marcos Ribeiro", avatar: "MR", xp: 120, tier: "silver", streak: 7 },
  { id: 152, name: "Letícia Nunes", avatar: "LN", xp: 195, tier: "silver", streak: 10 },
  { id: 153, name: "Igor Moreira", avatar: "IM", xp: 230, tier: "silver", streak: 8 },
  { id: 154, name: "Renata Silva", avatar: "RS", xp: 175, tier: "silver", streak: 6 },
  { id: 155, name: "Tomás Alves", avatar: "TA", xp: 260, tier: "silver", streak: 9 },
  { id: 156, name: "Bruna Cardoso", avatar: "BC", xp: 145, tier: "silver", streak: 5 },
  { id: 157, name: "André Monteiro", avatar: "AM", xp: 110, tier: "silver", streak: 4 },
  { id: 158, name: "Luísa Teixeira", avatar: "LT", xp: 280, tier: "silver", streak: 11 },
  { id: 159, name: "Caio Martins", avatar: "CM", xp: 205, tier: "silver", streak: 7 },
  { id: 160, name: "Helena Barbosa", avatar: "HB", xp: 155, tier: "silver", streak: 5 },

  // Ouro (300-599 XP)
  { id: 201, name: "Rafael Lima", avatar: "RL", xp: 380, tier: "gold", streak: 12 },
  { id: 202, name: "Juliana Mendes", avatar: "JM", xp: 520, tier: "gold", streak: 15 },
  { id: 203, name: "Thiago Souza", avatar: "TS", xp: 450, tier: "gold", streak: 10 },

  // Safira (600-1099 XP)
  { id: 301, name: "Carla Souza", avatar: "CS", xp: 680, tier: "sapphire", streak: 18 },
  { id: 302, name: "Felipe Santos", avatar: "FS", xp: 850, tier: "sapphire", streak: 22 },
  { id: 303, name: "Mariana Luz", avatar: "ML", xp: 990, tier: "sapphire", streak: 25 },

  // Esmeralda (1100-1899 XP)
  { id: 401, name: "Lucas Almeida", avatar: "LA", xp: 1200, tier: "emerald", streak: 28 },
  { id: 402, name: "Patricia Gomes", avatar: "PG", xp: 1650, tier: "emerald", streak: 32 },
  { id: 403, name: "Ricardo Nunes", avatar: "RN", xp: 1800, tier: "emerald", streak: 35 },

  // Ametista (1900-3199 XP)
  { id: 501, name: "Julia Ferreira", avatar: "JF", xp: 2200, tier: "amethyst", streak: 38 },
  { id: 502, name: "Eduardo Pinto", avatar: "EP", xp: 2800, tier: "amethyst", streak: 42 },
  { id: 503, name: "Isabela Martins", avatar: "IM", xp: 3100, tier: "amethyst", streak: 50 },

  // Rubi (3200-5199 XP)
  { id: 601, name: "Pedro Costa", avatar: "PC", xp: 3800, tier: "ruby", streak: 45 },
  { id: 602, name: "Camila Araújo", avatar: "CA", xp: 4500, tier: "ruby", streak: 55 },
  { id: 603, name: "Guilherme Reis", avatar: "GR", xp: 5100, tier: "ruby", streak: 60 },

  // Quartzo (5200-7999 XP)
  { id: 651, name: "Renata Oliveira", avatar: "RO", xp: 6000, tier: "quartz", streak: 65 },
  { id: 652, name: "Daniel Vieira", avatar: "DV", xp: 7200, tier: "quartz", streak: 72 },
  { id: 653, name: "Beatriz Lima", avatar: "BL", xp: 7800, tier: "quartz", streak: 78 },

  // Diamante (8000-12999 XP)
  { id: 701, name: "João Santos", avatar: "JS", xp: 8500, tier: "diamond", streak: 80 },
  { id: 702, name: "Ana Oliveira", avatar: "AO", xp: 10200, tier: "diamond", streak: 90 },
  { id: 703, name: "Fernando Lopes", avatar: "FL", xp: 12500, tier: "diamond", streak: 100 },

  // Lendário (13000+ XP)
  { id: 801, name: "Maria Silva", avatar: "MS", xp: 15000, tier: "legendary", streak: 150 },
  { id: 802, name: "Carlos Pereira", avatar: "CP", xp: 13500, tier: "legendary", streak: 120 },
];

const tierOrder: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];

const rankingTiers: { tier: RankingTier; range: string; label: string; slots: number }[] = [
  { tier: "bronze", range: "0-99", label: "Bronze", slots: 10 },
  { tier: "silver", range: "100-299", label: "Prata", slots: 8 },
  { tier: "gold", range: "300-599", label: "Ouro", slots: 7 },
  { tier: "sapphire", range: "600-1.1K", label: "Safira", slots: 6 },
  { tier: "emerald", range: "1.1K-1.9K", label: "Esmeralda", slots: 5 },
  { tier: "amethyst", range: "1.9K-3.2K", label: "Ametista", slots: 5 },
  { tier: "ruby", range: "3.2K-5.2K", label: "Rubi", slots: 4 },
  { tier: "quartz", range: "5.2K-8K", label: "Quartzo", slots: 3 },
  { tier: "diamond", range: "8K-13K", label: "Diamante", slots: 2 },
  { tier: "legendary", range: "13K+", label: "Lendário", slots: 1 },
];

const getDaysUntilWeekEnd = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  // Week ends on Sunday (0). Days remaining until next Sunday.
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return daysLeft;
};

const ROW_HEIGHT = 52; // px per row

const Ranking = () => {
  const isMobile = useIsMobile();
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  const [userXpBoost, setUserXpBoost] = useState(0);
  const [climbingFrom, setClimbingFrom] = useState<number | null>(null);
  const [showClimbEffect, setShowClimbEffect] = useState(false);
  const [animatingPositions, setAnimatingPositions] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'start' | 'move'>('idle');
  const prevPositionsRef = useRef<Map<number, number>>(new Map());
  const currentUserTier: RankingTier = "bronze";
  const currentTierIndex = tierOrder.indexOf(currentUserTier);
  const daysLeft = getDaysUntilWeekEnd();

  // Tier transition modal state
  const [tierTransition, setTierTransition] = useState<{ from: RankingTier; to: RankingTier } | null>(null);
  const [adminFromTier, setAdminFromTier] = useState<RankingTier>("bronze");
  const [adminToTier, setAdminToTier] = useState<RankingTier>("silver");
  const { isAdmin } = useAdmin();

  const handleCloseTierTransition = useCallback(() => {
    setTierTransition(null);
  }, []);

  const isTierLocked = (tier: RankingTier) => {
    return tierOrder.indexOf(tier) > currentTierIndex;
  };

  // Apply XP boost to the current user for demo
  const boostedUsers = allUsers.map(u =>
    u.name === "Você" && u.tier === selectedTier
      ? { ...u, xp: u.xp + userXpBoost }
      : u
  );

  const tierUsers = boostedUsers
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.xp - a.xp);

  const selectedTierInfo = rankingTiers.find(t => t.tier === selectedTier)!;
  const top3 = tierUsers.slice(0, 3);
  const restUsers = tierUsers.slice(3);

  const currentUserPosition = tierUsers.findIndex(u => u.name === "Você") + 1;

  // Store previous positions for animation
  useEffect(() => {
    const map = new Map<number, number>();
    restUsers.forEach((user, idx) => {
      map.set(user.id, idx);
    });
    // Only update ref AFTER animation completes
    if (!animatingPositions) {
      prevPositionsRef.current = map;
    }
  }, [restUsers, animatingPositions]);

  const handleSimulateClimb = (amount: number) => {
    // Snapshot positions before the boost
    const snapshotMap = new Map<number, number>();
    restUsers.forEach((user, idx) => {
      snapshotMap.set(user.id, idx);
    });
    prevPositionsRef.current = snapshotMap;

    setUserXpBoost(prev => prev + amount);
    // Phase 1: render at OLD positions (no transition)
    setAnimatingPositions(true);
    setAnimationPhase('start');
    setShowClimbEffect(true);
    setClimbingFrom(currentUserPosition);

    // Phase 2: after a frame, animate to NEW positions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationPhase('move');
      });
    });

    setTimeout(() => {
      setAnimatingPositions(false);
      setAnimationPhase('idle');
      setShowClimbEffect(false);
      setClimbingFrom(null);
    }, 2800);
  };

  const handleResetXp = () => {
    setUserXpBoost(0);
    setShowClimbEffect(false);
    setClimbingFrom(null);
    setAnimatingPositions(false);
  };

  const isInPromotionZone = (position: number) => {
    return position <= selectedTierInfo.slots;
  };

  if (isMobile) {
    return (
      <Layout>
        <MobileRanking />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 section-bg-ranking">
        {/* Header compact */}
        <header className="mb-6 animate-fade-in" data-tutorial="ranking-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold">Ranking Literário</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Evolua através de engajamento, consistência e dedicação.
              </p>
            </div>
            <div className="ranking-countdown-card flex items-center gap-3 shrink-0" data-tutorial="ranking-countdown">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Semana encerra em</p>
                <p className="font-semibold text-lg">
                  {daysLeft === 0 ? "Hoje!" : `${daysLeft} dia${daysLeft > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tier Selector - compact */}
        <div className="ranking-tier-selector mb-6 animate-fade-in" data-tutorial="ranking-tiers">
          <div className="flex flex-wrap gap-1.5">
            {rankingTiers.map(({ tier, range, label, slots }) => {
              const locked = isTierLocked(tier);
              return (
                <button
                  key={tier}
                  onClick={() => !locked && setSelectedTier(tier)}
                  disabled={locked}
                  className={`ranking-tier-btn relative ${
                    locked
                      ? "ranking-tier-btn-locked"
                      : selectedTier === tier 
                        ? "ranking-tier-btn-active" 
                        : "ranking-tier-btn-default"
                  }`}
                >
                  {locked && (
                    <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
                  )}
                  <RankingBadge tier={tier} showLabel={false} size="sm" />
                  <span className="text-xs font-medium mt-1">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Layout: Classification (main) + Info (sidebar) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Classification Area - Primary */}
          <div className="flex-1 min-w-0">
            {/* Selected Tier Header */}
            <div className="ranking-classification-header mb-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <RankingBadge tier={selectedTier} size="lg" />
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Ranking {tierConfig[selectedTier].label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tierUsers.length} participantes • Top {selectedTierInfo.slots} avançam
                  </p>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in" data-tutorial="ranking-podium">
                {/* 2nd Place */}
                <div className={`ranking-podium-card mt-4 ${isInPromotionZone(2) ? 'ranking-promotion-zone' : ''}`}>
                  <span className="ranking-podium-position">2º</span>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-base font-semibold">
                    {top3[1]?.avatar}
                  </div>
                  <p className="text-lg mb-1">🥈</p>
                  <h3 className="font-semibold text-sm truncate">
                    {top3[1]?.name}
                  </h3>
                  <p className="font-bold text-sm mt-1">{top3[1]?.xp} XP</p>
                  <p className="text-xs text-muted-foreground">{top3[1]?.streak} dias</p>
                </div>

                {/* 1st Place */}
                <div className={`ranking-podium-card ranking-podium-first ${isInPromotionZone(1) ? 'ranking-promotion-zone' : ''}`}>
                  <span className="ranking-podium-position ranking-podium-position-first">1º</span>
                  <Crown className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2 text-lg font-semibold text-accent">
                    {top3[0]?.avatar}
                  </div>
                  <p className="text-xl mb-1">🥇</p>
                  <h3 className="font-serif font-semibold text-sm truncate">
                    {top3[0]?.name}
                  </h3>
                  <p className="font-bold text-sm mt-1">{top3[0]?.xp} XP</p>
                  <p className="text-xs text-muted-foreground">{top3[0]?.streak} dias</p>
                </div>

                {/* 3rd Place */}
                <div className={`ranking-podium-card mt-6 ${isInPromotionZone(3) ? 'ranking-promotion-zone' : ''}`}>
                  <span className="ranking-podium-position">3º</span>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-base font-semibold">
                    {top3[2]?.avatar}
                  </div>
                  <p className="text-lg mb-1">🥉</p>
                  <h3 className="font-semibold text-sm truncate">
                    {top3[2]?.name}
                  </h3>
                  <p className="font-bold text-sm mt-1">{top3[2]?.xp} XP</p>
                  <p className="text-xs text-muted-foreground">{top3[2]?.streak} dias</p>
                </div>
              </div>
            )}

            {/* Full Ranking List (starting from #4) */}
            {restUsers.length > 0 && (
              <div className="ranking-list-card overflow-hidden animate-fade-in">
                <div className="relative" style={{ height: restUsers.length * ROW_HEIGHT }}>
                  {restUsers.map((user, index) => {
                    const position = index + 4;
                    const inPromotion = isInPromotionZone(position);
                    const isCurrentUser = user.name === "Você";
                    const isLastPromoted = position === selectedTierInfo.slots;

                    // Calculate translateY for smooth position transitions
                    const prevIdx = prevPositionsRef.current.get(user.id);
                    const currentY = index * ROW_HEIGHT;
                    // In 'start' phase, show at old position; in 'move' phase, animate to new
                    const displayY = animationPhase === 'start' && prevIdx !== undefined
                      ? prevIdx * ROW_HEIGHT
                      : currentY;
                    const shouldAnimate = animationPhase === 'move';
                    const isDisplaced = shouldAnimate && prevIdx !== undefined && prevIdx !== index && !isCurrentUser;

                    return (
                      <div
                        key={user.id}
                        className="absolute left-0 right-0"
                        style={{
                          top: 0,
                          transform: `translateY(${displayY}px)`,
                          transition: shouldAnimate ? 'transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                          zIndex: isCurrentUser && animatingPositions ? 10 : 1,
                        }}
                      >
                        <div
                          className={`flex items-center gap-3 px-4 transition-colors duration-500 ${
                            inPromotion ? 'ranking-row-promotion' : 'hover:bg-muted/20'
                          } ${isCurrentUser ? 'ranking-row-current' : ''} ${
                            isCurrentUser && showClimbEffect ? 'ranking-climb-animation' : ''
                          }`}
                          style={{ height: ROW_HEIGHT }}
                        >
                          <span className={`text-base font-bold w-7 text-center ${
                            inPromotion ? 'text-accent' : 'text-muted-foreground'
                          }`}>
                            {position}
                          </span>
                          {inPromotion && (
                            <ArrowUp className="w-3.5 h-3.5 text-accent -ml-1" />
                          )}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm ${
                            inPromotion ? 'bg-accent/20 text-accent' : 'bg-muted'
                          }`}>
                            {user.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${isCurrentUser ? 'text-accent' : ''}`}>
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs opacity-70">(você)</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${inPromotion ? 'text-accent' : 'text-foreground'}`}>
                              {user.xp} XP
                            </p>
                            <p className="text-xs text-muted-foreground">{user.streak}d</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Zona de classificação divider */}
                {selectedTierInfo.slots > 3 && (
                  <div
                    className="ranking-zone-divider absolute left-0 right-0 pointer-events-none"
                    style={{
                      top: (selectedTierInfo.slots - 3) * ROW_HEIGHT,
                      transition: 'top 1.6s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <div className="ranking-zone-line" />
                    <span className="ranking-zone-label">
                      <ArrowUp className="w-3.5 h-3.5" />
                      Zona de Classificação
                    </span>
                    <div className="ranking-zone-line" />
                  </div>
                )}
              </div>
            )}

            {tierUsers.length === 0 && (
              <div className="text-center py-12 ranking-list-card">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">Nenhum participante</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a alcançar o nível {tierConfig[selectedTier].label}!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Info Sidebar */}
          <div className="lg:w-72 shrink-0 space-y-4">
            {/* Your Position */}
            {currentUserTier === selectedTier && (
              <div className="ranking-info-card animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-sm">Sua Posição</h3>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">
                    #{currentUserPosition}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">de {tierUsers.length} participantes</p>
                  {showClimbEffect && climbingFrom && climbingFrom > currentUserPosition && (
                    <div className="ranking-climb-badge mt-2">
                      <ChevronUp className="w-3.5 h-3.5" />
                      Subiu {climbingFrom - currentUserPosition} posição{climbingFrom - currentUserPosition > 1 ? 'ões' : ''}!
                    </div>
                  )}
                </div>
                <div className="space-y-2 mt-3">
                  <p className="text-xs text-muted-foreground">XP atual: <span className="text-accent font-bold">{35 + userXpBoost}</span></p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[5, 10, 20].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleSimulateClimb(amount)}
                        className="ranking-simulate-btn"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleResetXp}
                    className="ranking-simulate-btn w-full opacity-60 hover:opacity-100"
                  >
                    Resetar
                  </button>
                </div>
              </div>
            )}

            {/* How to earn XP */}
            <div className="ranking-info-card animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Como ganhar XP</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Missões</p>
                    <p className="text-xs text-muted-foreground">Diárias e semanais</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Atividades</p>
                    <p className="text-xs text-muted-foreground">Capítulos e quizzes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Sequência</p>
                    <p className="text-xs text-muted-foreground">Bônus consecutivo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Consistência</p>
                    <p className="text-xs text-muted-foreground">Frequência semanal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion info */}
            <div className="ranking-info-card animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUp className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Promoção Semanal</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Os <span className="text-accent font-bold">Top {selectedTierInfo.slots}</span> do ranking semanal avançam para o próximo patamar. Quanto maior o nível, menos vagas disponíveis.
              </p>
            </div>
          </div>
        </div>
        {/* Admin Tier Transition Preview */}
        {isAdmin && (
          <div className="mt-8 ranking-info-card animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-sm">Admin: Simular Transição de Patamar</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground mb-1 block">De</label>
                <Select value={adminFromTier} onValueChange={(v) => setAdminFromTier(v as RankingTier)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOrder.map(t => (
                      <SelectItem key={t} value={t}>{tierConfig[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground mb-1 block">Para</label>
                <Select value={adminToTier} onValueChange={(v) => setAdminToTier(v as RankingTier)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOrder.map(t => (
                      <SelectItem key={t} value={t}>{tierConfig[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="shrink-0"
                disabled={adminFromTier === adminToTier}
                onClick={() => setTierTransition({ from: adminFromTier, to: adminToTier })}
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Visualizar
              </Button>
            </div>
          </div>
        )}

        {/* Tier Transition Modal */}
        <TierTransitionModal
          isOpen={!!tierTransition}
          fromTier={tierTransition?.from ?? "bronze"}
          toTier={tierTransition?.to ?? "silver"}
          onClose={handleCloseTierTransition}
        />
      </div>
    </Layout>
  );
};

export default Ranking;
