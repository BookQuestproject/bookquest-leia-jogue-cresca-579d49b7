import { Trophy, Crown, TrendingUp, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import RankingBadge, { RankingTier, tierConfig, getTierFromBooks } from "@/components/RankingBadge";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  booksRead: number;
  tier: RankingTier;
  streak: number;
}

const mockUsers: RankingUser[] = [
  { id: 1, name: "Maria Silva", avatar: "MS", booksRead: 156, tier: "legendary", streak: 45 },
  { id: 2, name: "João Santos", avatar: "JS", booksRead: 87, tier: "diamond", streak: 30 },
  { id: 3, name: "Ana Oliveira", avatar: "AO", booksRead: 72, tier: "diamond", streak: 28 },
  { id: 4, name: "Pedro Costa", avatar: "PC", booksRead: 58, tier: "ruby", streak: 21 },
  { id: 5, name: "Julia Ferreira", avatar: "JF", booksRead: 42, tier: "amethyst", streak: 18 },
  { id: 6, name: "Lucas Almeida", avatar: "LA", booksRead: 28, tier: "emerald", streak: 14 },
  { id: 7, name: "Carla Souza", avatar: "CS", booksRead: 15, tier: "sapphire", streak: 12 },
  { id: 8, name: "Rafael Lima", avatar: "RL", booksRead: 8, tier: "gold", streak: 8 },
  { id: 9, name: "Fernanda Rocha", avatar: "FR", booksRead: 4, tier: "bronze", streak: 5 },
  { id: 10, name: "Você", avatar: "VC", booksRead: 2, tier: "bronze", streak: 3 },
];

const rankingTiers = [
  { tier: "bronze" as RankingTier, books: "0-4", label: "Bronze" },
  { tier: "gold" as RankingTier, books: "5-9", label: "Ouro" },
  { tier: "sapphire" as RankingTier, books: "10-19", label: "Safira" },
  { tier: "emerald" as RankingTier, books: "20-34", label: "Esmeralda" },
  { tier: "amethyst" as RankingTier, books: "35-49", label: "Ametista" },
  { tier: "ruby" as RankingTier, books: "50-69", label: "Rubi" },
  { tier: "diamond" as RankingTier, books: "70-99", label: "Diamante" },
  { tier: "legendary" as RankingTier, books: "100+", label: "Lendário" },
];

const Ranking = () => {
  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>Ranking Literário</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Os Maiores Leitores</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            O ranking é baseado na quantidade de livros lidos. Quanto mais você lê, mais sobe!
          </p>
        </div>

        {/* Tiers Explanation */}
        <div className="glass-card rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Níveis do Ranking
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {rankingTiers.map(({ tier, books, label }) => (
              <div key={tier} className="text-center p-3 rounded-xl bg-secondary">
                <RankingBadge tier={tier} showLabel={false} size="lg" />
                <p className="font-bold mt-2 text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{books} livros</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <div className="glass-card rounded-2xl p-6 text-center order-2 md:order-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 rounded-full bg-sapphire flex items-center justify-center mx-auto mb-4 text-xl font-bold text-background">
              {mockUsers[1].avatar}
            </div>
            <div className="text-2xl font-bold mb-1">🥈</div>
            <h3 className="font-bold text-lg mb-1">{mockUsers[1].name}</h3>
            <RankingBadge tier={mockUsers[1].tier} booksRead={mockUsers[1].booksRead} size="sm" />
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Livros</p>
                <p className="font-bold">{mockUsers[1].booksRead}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sequência</p>
                <p className="font-bold">{mockUsers[1].streak} dias</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="glass-card rounded-2xl p-6 text-center order-1 md:order-2 md:-mt-6 border-2 border-accent animate-fade-in">
            <Crown className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="w-20 h-20 rounded-full bg-legendary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-background pulse-glow">
              {mockUsers[0].avatar}
            </div>
            <div className="text-3xl font-bold mb-1">🥇</div>
            <h3 className="font-bold text-xl mb-1">{mockUsers[0].name}</h3>
            <RankingBadge tier={mockUsers[0].tier} booksRead={mockUsers[0].booksRead} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-muted-foreground text-sm">Livros</p>
                <p className="font-bold text-lg">{mockUsers[0].booksRead}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Sequência</p>
                <p className="font-bold text-lg">{mockUsers[0].streak} dias</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="glass-card rounded-2xl p-6 text-center order-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-16 rounded-full bg-bronze flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">
              {mockUsers[2].avatar}
            </div>
            <div className="text-2xl font-bold mb-1">🥉</div>
            <h3 className="font-bold text-lg mb-1">{mockUsers[2].name}</h3>
            <RankingBadge tier={mockUsers[2].tier} booksRead={mockUsers[2].booksRead} size="sm" />
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Livros</p>
                <p className="font-bold">{mockUsers[2].booksRead}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sequência</p>
                <p className="font-bold">{mockUsers[2].streak} dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Ranking List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Ranking Completo
            </h3>
          </div>
          <div className="divide-y divide-border">
            {mockUsers.slice(3).map((user, index) => (
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
                  <RankingBadge tier={user.tier} size="sm" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{user.booksRead} livros</p>
                  <p className="text-xs text-muted-foreground">{user.streak} dias seguidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Ranking;
