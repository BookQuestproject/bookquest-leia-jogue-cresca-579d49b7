import { Award, BookOpen, Clock, Sparkles, Trophy } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementBadge from './AchievementBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AchievementsSection = () => {
  const { 
    achievements, 
    earnedCount, 
    totalAchievements, 
    categorizedAchievements,
    loading 
  } = useAchievements();

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-16 h-5 ml-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const categoryIcons = {
    reading: BookOpen,
    time: Clock,
    streak: Sparkles,
    special: Trophy,
  };

  const categoryLabels = {
    reading: 'Leitura',
    time: 'Tempo',
    streak: 'Sequência',
    special: 'Especiais',
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-accent" />
          Conquistas
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent">
          <Trophy className="w-4 h-4" />
          <span className="font-bold text-sm">{earnedCount} / {totalAchievements}</span>
        </div>
      </div>

      {/* Progress summary */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progresso geral</span>
          <span className="text-sm font-bold text-primary">
            {Math.round((earnedCount / totalAchievements) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / totalAchievements) * 100}%` }}
          />
        </div>
      </div>

      {/* Tabs for categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all" className="text-xs">
            Todas
          </TabsTrigger>
          <TabsTrigger value="reading" className="text-xs flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Leitura</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="hidden sm:inline">Tempo</span>
          </TabsTrigger>
          <TabsTrigger value="special" className="text-xs flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            <span className="hidden sm:inline">Especiais</span>
          </TabsTrigger>
          <TabsTrigger value="earned" className="text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Ganhas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reading">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categorizedAchievements.reading.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categorizedAchievements.time.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categorizedAchievements.special.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned">
          {achievements.filter(a => a.earned).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.filter(a => a.earned).map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} showProgress={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Você ainda não desbloqueou nenhuma conquista.</p>
              <p className="text-sm">Continue lendo para ganhar badges!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsSection;
