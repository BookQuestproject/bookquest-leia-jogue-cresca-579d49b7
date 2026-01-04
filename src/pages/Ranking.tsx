import { useState } from "react";
import { Trophy, Crown, TrendingUp, BookOpen, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import RankingBadge, { RankingTier, tierConfig, getTierFromBooks } from "@/components/RankingBadge";
import { Button } from "@/components/ui/button";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  booksRead: number;
  tier: RankingTier;
  streak: number;
}

// Mock users organized by tier
const allUsers: RankingUser[] = [
  // Bronze (0-5 livros)
  { id: 101, name: "Você", avatar: "VC", booksRead: 2, tier: "bronze", streak: 3 },
  { id: 102, name: "Fernanda Rocha", avatar: "FR", booksRead: 4, tier: "bronze", streak: 5 },
  { id: 103, name: "Bruno Dias", avatar: "BD", booksRead: 5, tier: "bronze", streak: 2 },
  { id: 104, name: "Amanda Costa", avatar: "AC", booksRead: 3, tier: "bronze", streak: 1 },
  
  // Ouro (6-15 livros)
  { id: 201, name: "Rafael Lima", avatar: "RL", booksRead: 8, tier: "gold", streak: 8 },
  { id: 202, name: "Juliana Mendes", avatar: "JM", booksRead: 12, tier: "gold", streak: 10 },
  { id: 203, name: "Thiago Souza", avatar: "TS", booksRead: 14, tier: "gold", streak: 6 },
  
  // Safira (16-30 livros)
  { id: 301, name: "Carla Souza", avatar: "CS", booksRead: 18, tier: "sapphire", streak: 12 },
  { id: 302, name: "Felipe Santos", avatar: "FS", booksRead: 25, tier: "sapphire", streak: 15 },
  { id: 303, name: "Mariana Luz", avatar: "ML", booksRead: 28, tier: "sapphire", streak: 20 },
  
  // Esmeralda (31-50 livros)
  { id: 401, name: "Lucas Almeida", avatar: "LA", booksRead: 35, tier: "emerald", streak: 14 },
  { id: 402, name: "Patricia Gomes", avatar: "PG", booksRead: 42, tier: "emerald", streak: 18 },
  { id: 403, name: "Ricardo Nunes", avatar: "RN", booksRead: 48, tier: "emerald", streak: 22 },
  
  // Ametista (51-80 livros)
  { id: 501, name: "Julia Ferreira", avatar: "JF", booksRead: 55, tier: "amethyst", streak: 18 },
  { id: 502, name: "Eduardo Pinto", avatar: "EP", booksRead: 68, tier: "amethyst", streak: 25 },
  { id: 503, name: "Isabela Martins", avatar: "IM", booksRead: 75, tier: "amethyst", streak: 30 },
  
  // Rubi (81-120 livros)
  { id: 601, name: "Pedro Costa", avatar: "PC", booksRead: 85, tier: "ruby", streak: 21 },
  { id: 602, name: "Camila Araújo", avatar: "CA", booksRead: 98, tier: "ruby", streak: 35 },
  { id: 603, name: "Guilherme Reis", avatar: "GR", booksRead: 115, tier: "ruby", streak: 40 },
  
  // Diamante (121-199 livros)
  { id: 701, name: "João Santos", avatar: "JS", booksRead: 130, tier: "diamond", streak: 30 },
  { id: 702, name: "Ana Oliveira", avatar: "AO", booksRead: 156, tier: "diamond", streak: 28 },
  { id: 703, name: "Fernando Lopes", avatar: "FL", booksRead: 180, tier: "diamond", streak: 45 },
  
  // Lendário (200+ livros)
  { id: 801, name: "Maria Silva", avatar: "MS", booksRead: 250, tier: "legendary", streak: 100 },
  { id: 802, name: "Carlos Pereira", avatar: "CP", booksRead: 215, tier: "legendary", streak: 85 },
];

const rankingTiers: { tier: RankingTier; books: string; label: string }[] = [
  { tier: "bronze", books: "0-5", label: "Bronze" },
  { tier: "gold", books: "6-15", label: "Ouro" },
  { tier: "sapphire", books: "16-30", label: "Safira" },
  { tier: "emerald", books: "31-50", label: "Esmeralda" },
  { tier: "amethyst", books: "51-80", label: "Ametista" },
  { tier: "ruby", books: "81-120", label: "Rubi" },
  { tier: "diamond", books: "121-199", label: "Diamante" },
  { tier: "legendary", books: "200+", label: "Lendário" },
];

const Ranking = () => {
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  const currentUserTier: RankingTier = "bronze"; // Would come from user state

  const tierUsers = allUsers
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.booksRead - a.booksRead);

  const top3 = tierUsers.slice(0, 3);
  const restUsers = tierUsers.slice(3);

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>Ranking por Patamar</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Ranking Literário</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Você compete apenas com leitores do seu nível. Suba de patamar lendo mais livros!
          </p>
        </div>

        {/* Tiers Explanation */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Níveis do Ranking
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {rankingTiers.map(({ tier, books, label }) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`text-center p-3 rounded-xl transition-all ${
                  selectedTier === tier 
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" 
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <RankingBadge tier={tier} showLabel={false} size="sm" />
                <p className="font-bold mt-2 text-xs">{label}</p>
                <p className="text-xs opacity-70">{books} livros</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tier Header */}
        <div className="glass-card rounded-2xl p-4 mb-8 bg-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RankingBadge tier={selectedTier} size="lg" />
              <div>
                <h3 className="font-bold text-primary-foreground">
                  Ranking {tierConfig[selectedTier].label}
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  {tierUsers.length} leitores neste patamar
                </p>
              </div>
            </div>
            {currentUserTier === selectedTier && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-primary-foreground text-sm font-bold">
                <Users className="w-4 h-4" />
                Seu patamar
              </div>
            )}
          </div>
        </div>

        {/* Top 3 */}
        {top3.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <div className="glass-card rounded-2xl p-6 text-center order-2 md:order-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className={`w-16 h-16 rounded-full ${tierConfig[selectedTier].className.replace('ranking-', 'bg-')} flex items-center justify-center mx-auto mb-4 text-xl font-bold text-background`}>
                {top3[1]?.avatar}
              </div>
              <div className="text-2xl font-bold mb-1">🥈</div>
              <h3 className="font-bold text-lg mb-1">
                {top3[1]?.name}
                {top3[1]?.name === "Você" && <span className="text-primary ml-1">(você)</span>}
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Livros</p>
                  <p className="font-bold">{top3[1]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-bold">{top3[1]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="glass-card rounded-2xl p-6 text-center order-1 md:order-2 md:-mt-6 border-2 border-accent animate-fade-in">
              <Crown className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className={`w-20 h-20 rounded-full ${tierConfig[selectedTier].className.replace('ranking-', 'bg-')} flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-background pulse-glow`}>
                {top3[0]?.avatar}
              </div>
              <div className="text-3xl font-bold mb-1">🥇</div>
              <h3 className="font-bold text-xl mb-1">
                {top3[0]?.name}
                {top3[0]?.name === "Você" && <span className="text-primary ml-1">(você)</span>}
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-muted-foreground text-sm">Livros</p>
                  <p className="font-bold text-lg">{top3[0]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sequência</p>
                  <p className="font-bold text-lg">{top3[0]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="glass-card rounded-2xl p-6 text-center order-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className={`w-16 h-16 rounded-full ${tierConfig[selectedTier].className.replace('ranking-', 'bg-')} flex items-center justify-center mx-auto mb-4 text-xl font-bold text-background`}>
                {top3[2]?.avatar}
              </div>
              <div className="text-2xl font-bold mb-1">🥉</div>
              <h3 className="font-bold text-lg mb-1">
                {top3[2]?.name}
                {top3[2]?.name === "Você" && <span className="text-primary ml-1">(você)</span>}
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Livros</p>
                  <p className="font-bold">{top3[2]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-bold">{top3[2]?.streak} dias</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        {restUsers.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Ranking {tierConfig[selectedTier].label} - Completo
              </h3>
            </div>
            <div className="divide-y divide-border">
              {restUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors ${
                    user.name === "Você" ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <span className="text-lg font-bold text-muted-foreground w-8">
                    #{index + 4}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {user.name}
                      {user.name === "Você" && (
                        <span className="ml-2 text-xs text-primary">(você)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.booksRead} livros</p>
                    <p className="text-xs text-muted-foreground">{user.streak} dias seguidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tierUsers.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Nenhum leitor neste patamar</h3>
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
