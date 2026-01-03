import { BookOpen, Trophy, Flame, Star, Award, Crown, Settings, Edit2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints } from "@/components/RankingBadge";
import ProgressBar from "@/components/ProgressBar";

interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

const userProfile = {
  name: "Você",
  avatar: "VC",
  email: "usuario@email.com",
  points: 150,
  booksRead: 2,
  streak: 3,
  quizzesCompleted: 1,
  memberSince: "Janeiro 2024",
  literaryGenre: "Fantasia",
  isPremium: false,
};

const badges: Badge[] = [
  { id: 1, name: "Primeiro Livro", icon: "📖", description: "Registrou seu primeiro livro", earned: true },
  { id: 2, name: "Quiz Master", icon: "🧠", description: "Completou o quiz literário", earned: true },
  { id: 3, name: "Sequência de 3", icon: "🔥", description: "3 dias seguidos lendo", earned: true },
  { id: 4, name: "Leitor Ávido", icon: "📚", description: "Leia 10 livros", earned: false },
  { id: 5, name: "Sequência de 7", icon: "⚡", description: "7 dias seguidos lendo", earned: false },
  { id: 6, name: "Social Reader", icon: "💬", description: "10 posts na comunidade", earned: false },
];

const readingHistory = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", completedAt: "Dez 2023", pages: 208 },
  { id: 2, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", completedAt: "Jan 2024", pages: 96 },
];

const tierThresholds = [
  { tier: "bronze", min: 0, max: 500 },
  { tier: "silver", min: 500, max: 1500 },
  { tier: "gold", min: 1500, max: 3000 },
  { tier: "platinum", min: 3000, max: 5000 },
  { tier: "diamond", min: 5000, max: 10000 },
  { tier: "legendary", min: 10000, max: Infinity },
];

const Perfil = () => {
  const currentTier = getTierFromPoints(userProfile.points);
  const currentThreshold = tierThresholds.find(t => t.tier === currentTier)!;
  const nextThreshold = tierThresholds[tierThresholds.findIndex(t => t.tier === currentTier) + 1];
  const progressToNext = nextThreshold 
    ? ((userProfile.points - currentThreshold.min) / (nextThreshold.min - currentThreshold.min)) * 100
    : 100;

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex-1 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                  {userProfile.avatar}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                  <RankingBadge tier={currentTier} size="sm" />
                  {userProfile.isPremium ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-bold">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{userProfile.email}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-primary">{userProfile.booksRead}</div>
                    <div className="text-xs text-muted-foreground">Livros</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-warning">{userProfile.points}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-legendary flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4" />
                      {userProfile.streak}
                    </div>
                    <div className="text-xs text-muted-foreground">Sequência</div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress to next tier */}
            {nextThreshold && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Próximo nível: <span className="text-foreground font-medium capitalize">{nextThreshold.tier === "silver" ? "Prata" : nextThreshold.tier}</span>
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {userProfile.points} / {nextThreshold.min} XP
                  </span>
                </div>
                <ProgressBar value={userProfile.points} max={nextThreshold.min} />
              </div>
            )}
          </div>

          {/* Literary Genre Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 w-full lg:w-80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">Seu gênero literário</h3>
              <p className="text-2xl font-bold text-primary mb-2">{userProfile.literaryGenre}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Identificado pelo quiz literário
              </p>
              <Button variant="outline" size="sm">
                Refazer quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-warning" />
            Conquistas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  badge.earned
                    ? "bg-secondary"
                    : "bg-secondary/50 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-medium text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reading History */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Histórico de Leitura
          </h2>
          <div className="space-y-4">
            {readingHistory.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary"
              >
                <div className="w-12 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{book.completedAt}</p>
                  <p className="text-xs text-muted-foreground">{book.pages} páginas</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Adicionar livro lido
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Perfil;
