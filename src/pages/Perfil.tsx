import { BookOpen, Star, Crown, Settings, Edit2, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromBooks, getNextTierInfo } from "@/components/RankingBadge";
import ProgressBar from "@/components/ProgressBar";
import { useProfile } from "@/hooks/useProfile";
import { useReadingStats } from "@/hooks/useReadingStats";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementsSection from "@/components/AchievementsSection";

const readingHistory = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", completedAt: "Dez 2023", pages: 208 },
  { id: 2, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", completedAt: "Jan 2024", pages: 96 },
];

const Perfil = () => {
  const { profile, isPremium, loading: profileLoading } = useProfile();
  const { stats, loading: statsLoading, formatTime } = useReadingStats();

  // Use real data from profile or fallback to defaults
  const userName = profile?.full_name || "Você";
  const userEmail = profile?.email || "usuario@email.com";
  const literaryProfile = profile?.literary_profile as { genre?: string } | null;
  const literaryGenre = literaryProfile?.genre || "Não definido";

  // Use reading stats for books read count
  const booksRead = stats.booksCompleted || 0;
  const currentTier = getTierFromBooks(booksRead);
  const nextTier = getNextTierInfo(currentTier);

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
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{userName}</h1>
                  <RankingBadge tier={currentTier} size="sm" />
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-bold">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{userEmail}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <div className="text-xl font-bold text-primary">{booksRead}</div>
                    )}
                    <div className="text-xs text-muted-foreground">Livros</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    ) : (
                      <div className="text-xl font-bold text-accent flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {stats.completedChapters}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">Capítulos</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    ) : (
                      <div className="text-xl font-bold text-info flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(stats.totalReadingTime)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">Tempo</div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress to next tier */}
            {nextTier && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Próximo nível: <span className="text-foreground font-medium">{nextTier.label}</span>
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {booksRead} / {nextTier.booksNeeded} livros
                  </span>
                </div>
                <ProgressBar value={booksRead} max={nextTier.booksNeeded} />
              </div>
            )}
          </div>

          {/* Reading Stats Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 w-full lg:w-80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">Estatísticas de Leitura</h3>
              
              {statsLoading ? (
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                    <span className="text-sm text-muted-foreground">Tempo total</span>
                    <span className="font-bold text-primary">{formatTime(stats.totalReadingTime)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                    <span className="text-sm text-muted-foreground">Livros iniciados</span>
                    <span className="font-bold text-info">{stats.booksStarted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                    <span className="text-sm text-muted-foreground">Média por capítulo</span>
                    <span className="font-bold text-accent">{formatTime(Math.round(stats.averageReadingTime))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Literary Genre Card */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-muted-foreground mb-1">Seu gênero literário</h3>
              <p className="text-2xl font-bold text-primary mb-1">{literaryGenre}</p>
              <p className="text-sm text-muted-foreground">
                Identificado pelo quiz literário
              </p>
            </div>
            <Button variant="outline" size="sm">
              Refazer quiz
            </Button>
          </div>
        </div>

        {/* Achievements Section - Dynamic */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <AchievementsSection />
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
