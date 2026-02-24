import { useState, useMemo } from "react";
import { Trophy, Crown, TrendingUp, Flame, Users, Target, Zap, Calendar, BookOpen, Lock, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import RankingBadge, { RankingTier, tierConfig, getTierFromPoints } from "@/components/RankingBadge";
import { Button } from "@/components/ui/button";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  points: number;
  tier: RankingTier;
  streak: number;
}

// Mock users organized by tier with point-based system
const allUsers: RankingUser[] = [
  // Bronze (0-99 tochas)
  { id: 101, name: "Você", avatar: "VC", points: 35, tier: "bronze", streak: 2 },
  { id: 102, name: "Fernanda Rocha", avatar: "FR", points: 80, tier: "bronze", streak: 5 },
  { id: 103, name: "Bruno Dias", avatar: "BD", points: 65, tier: "bronze", streak: 3 },
  { id: 104, name: "Amanda Costa", avatar: "AC", points: 45, tier: "bronze", streak: 1 },
  
  // Prata (100-249 tochas)
  { id: 151, name: "Marcos Ribeiro", avatar: "MR", points: 120, tier: "silver", streak: 7 },
  { id: 152, name: "Letícia Nunes", avatar: "LN", points: 195, tier: "silver", streak: 10 },
  { id: 153, name: "Igor Moreira", avatar: "IM", points: 230, tier: "silver", streak: 8 },

  // Ouro (250-499 tochas)
  { id: 201, name: "Rafael Lima", avatar: "RL", points: 310, tier: "gold", streak: 12 },
  { id: 202, name: "Juliana Mendes", avatar: "JM", points: 420, tier: "gold", streak: 15 },
  { id: 203, name: "Thiago Souza", avatar: "TS", points: 380, tier: "gold", streak: 10 },
  
  // Safira (500-999 tochas)
  { id: 301, name: "Carla Souza", avatar: "CS", points: 580, tier: "sapphire", streak: 18 },
  { id: 302, name: "Felipe Santos", avatar: "FS", points: 750, tier: "sapphire", streak: 22 },
  { id: 303, name: "Mariana Luz", avatar: "ML", points: 890, tier: "sapphire", streak: 25 },
  
  // Esmeralda (1000-1999 tochas)
  { id: 401, name: "Lucas Almeida", avatar: "LA", points: 1200, tier: "emerald", streak: 28 },
  { id: 402, name: "Patricia Gomes", avatar: "PG", points: 1650, tier: "emerald", streak: 32 },
  { id: 403, name: "Ricardo Nunes", avatar: "RN", points: 1800, tier: "emerald", streak: 35 },
  
  // Ametista (2000-3499 tochas)
  { id: 501, name: "Julia Ferreira", avatar: "JF", points: 2200, tier: "amethyst", streak: 38 },
  { id: 502, name: "Eduardo Pinto", avatar: "EP", points: 2800, tier: "amethyst", streak: 42 },
  { id: 503, name: "Isabela Martins", avatar: "IM", points: 3100, tier: "amethyst", streak: 50 },
  
  // Rubi (3500-5499 tochas)
  { id: 601, name: "Pedro Costa", avatar: "PC", points: 3800, tier: "ruby", streak: 45 },
  { id: 602, name: "Camila Araújo", avatar: "CA", points: 4500, tier: "ruby", streak: 55 },
  { id: 603, name: "Guilherme Reis", avatar: "GR", points: 5200, tier: "ruby", streak: 60 },
  
  // Quartzo (5500-7999 tochas)
  { id: 651, name: "Renata Oliveira", avatar: "RO", points: 6000, tier: "quartz", streak: 65 },
  { id: 652, name: "Daniel Vieira", avatar: "DV", points: 7200, tier: "quartz", streak: 72 },
  { id: 653, name: "Beatriz Lima", avatar: "BL", points: 7800, tier: "quartz", streak: 78 },

  // Diamante (8000-11999 tochas)
  { id: 701, name: "João Santos", avatar: "JS", points: 8500, tier: "diamond", streak: 80 },
  { id: 702, name: "Ana Oliveira", avatar: "AO", points: 10200, tier: "diamond", streak: 90 },
  { id: 703, name: "Fernando Lopes", avatar: "FL", points: 11500, tier: "diamond", streak: 100 },
  
  // Lendário (12000+ tochas)
  { id: 801, name: "Maria Silva", avatar: "MS", points: 15000, tier: "legendary", streak: 150 },
  { id: 802, name: "Carlos Pereira", avatar: "CP", points: 13200, tier: "legendary", streak: 120 },
];

const tierOrder: RankingTier[] = ["bronze", "silver", "gold", "sapphire", "emerald", "amethyst", "ruby", "quartz", "diamond", "legendary"];

const rankingTiers: { tier: RankingTier; range: string; label: string }[] = [
  { tier: "bronze", range: "0-99", label: "Bronze" },
  { tier: "silver", range: "100-249", label: "Prata" },
  { tier: "gold", range: "250-499", label: "Ouro" },
  { tier: "sapphire", range: "500-999", label: "Safira" },
  { tier: "emerald", range: "1K-2K", label: "Esmeralda" },
  { tier: "amethyst", range: "2K-3.5K", label: "Ametista" },
  { tier: "ruby", range: "3.5K-5.5K", label: "Rubi" },
  { tier: "quartz", range: "5.5K-8K", label: "Quartzo" },
  { tier: "diamond", range: "8K-12K", label: "Diamante" },
  { tier: "legendary", range: "12K+", label: "Lendário" },
];

const getDaysUntilWeekEnd = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  // Week ends on Sunday (0). Days remaining until next Sunday.
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return daysLeft;
};

const Ranking = () => {
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  const currentUserTier: RankingTier = "bronze";
  const currentTierIndex = tierOrder.indexOf(currentUserTier);
  const daysLeft = getDaysUntilWeekEnd();

  const isTierLocked = (tier: RankingTier) => {
    return tierOrder.indexOf(tier) > currentTierIndex;
  };

  const tierUsers = allUsers
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.points - a.points);

  const top3 = tierUsers.slice(0, 3);
  const restUsers = tierUsers.slice(3);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 section-bg-ranking">
        {/* Header */}
        <header className="mb-10 animate-fade-in" data-tutorial="ranking-header">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Sistema de Evolução</p>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Ranking Literário</h1>
              <p className="text-muted-foreground max-w-xl">
                Evolua através de engajamento, consistência e dedicação. Acumule tochas completando atividades, desafios e mantendo sua sequência.
              </p>
            </div>
            <div className="editorial-card p-4 flex items-center gap-3 shrink-0">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Classificação semanal encerra em</p>
                <p className="font-semibold text-lg">
                  {daysLeft === 0 ? "Hoje!" : `${daysLeft} dia${daysLeft > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* How it works */}
        <div className="editorial-card p-5 mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Como ganhar tochas 🔥
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Missões</p>
                <p className="text-xs text-muted-foreground">Diárias, semanais e mensais</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Atividades</p>
                <p className="text-xs text-muted-foreground">Capítulos, quizzes e trilhas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Flame className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Sequência</p>
                <p className="text-xs text-muted-foreground">Bônus por dias consecutivos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Consistência</p>
                <p className="text-xs text-muted-foreground">Frequência de uso semanal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="editorial-card p-5 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }} data-tutorial="ranking-tiers">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold">Selecione o Patamar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {rankingTiers.map(({ tier, range, label }) => {
              const locked = isTierLocked(tier);
              return (
                <button
                  key={tier}
                  onClick={() => !locked && setSelectedTier(tier)}
                  disabled={locked}
                  className={`text-center p-3 rounded transition-all relative ${
                    locked
                      ? "bg-muted/20 opacity-50 cursor-not-allowed"
                      : selectedTier === tier 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  {locked && (
                    <Lock className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-muted-foreground" />
                  )}
                  <RankingBadge tier={tier} showLabel={false} size="sm" />
                  <p className="font-medium mt-2 text-xs">{label}</p>
                  <p className="text-xs text-muted-foreground">{range} 🔥</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tier Info */}
        <div className="editorial-card p-5 mb-8 border-l-4 border-secondary animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RankingBadge tier={selectedTier} size="lg" />
              <div>
                <h3 className="font-serif text-xl font-semibold">
                  Ranking {tierConfig[selectedTier].label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tierUsers.length} participantes neste patamar
                </p>
              </div>
            </div>
            {currentUserTier === selectedTier && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/10 text-secondary text-sm font-medium">
                <Users className="w-4 h-4" />
                Seu patamar
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {/* 2nd Place */}
            <div className="editorial-card p-5 text-center order-2 md:order-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center mx-auto mb-3 text-lg font-semibold">
                {top3[1]?.avatar}
              </div>
              <p className="text-xl mb-2">🥈</p>
              <h3 className="font-semibold">
                {top3[1]?.name}
                {top3[1]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tochas</p>
                  <p className="font-semibold">{top3[1]?.points} 🔥</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-semibold">{top3[1]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="editorial-card p-5 text-center order-1 md:order-2 border-accent/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Crown className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="w-16 h-16 rounded bg-accent/20 flex items-center justify-center mx-auto mb-3 text-xl font-semibold text-accent">
                {top3[0]?.avatar}
              </div>
              <p className="text-2xl mb-2">🥇</p>
              <h3 className="font-serif text-lg font-semibold">
                {top3[0]?.name}
                {top3[0]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3">
                <div>
                  <p className="text-muted-foreground text-sm">Tochas</p>
                  <p className="font-semibold">{top3[0]?.points} 🔥</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sequência</p>
                  <p className="font-semibold">{top3[0]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="editorial-card p-5 text-center order-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center mx-auto mb-3 text-lg font-semibold">
                {top3[2]?.avatar}
              </div>
              <p className="text-xl mb-2">🥉</p>
              <h3 className="font-semibold">
                {top3[2]?.name}
                {top3[2]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tochas</p>
                  <p className="font-semibold">{top3[2]?.points} 🔥</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-semibold">{top3[2]?.streak} dias</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        {restUsers.length > 0 && (
          <div className="editorial-card overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-4 border-b border-border/60">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                Ranking Completo
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {restUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${
                    user.name === "Você" ? "bg-secondary/5 border-l-2 border-secondary" : ""
                  }`}
                >
                  <span className="text-lg font-medium text-muted-foreground w-8">
                    #{index + 4}
                  </span>
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-medium">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.name}
                      {user.name === "Você" && (
                        <span className="ml-2 text-xs text-secondary">(você)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary">{user.points} 🔥</p>
                    <p className="text-xs text-muted-foreground">{user.streak} dias</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tierUsers.length === 0 && (
          <div className="text-center py-12 editorial-card">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold mb-2">Nenhum participante neste patamar</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a alcançar o nível {tierConfig[selectedTier].label}!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Ranking;
