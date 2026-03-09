import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, Brain, Users, History, Palette, ArrowUpDown, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';
import { repertoriosCompletos } from '@/data/repertorios';

const categoryIcons: Record<string, any> = {
  Literatura: Book,
  Filosofia: Brain,
  Sociologia: Users,
  História: History,
  Artes: Palette,
};

const categoryColors: Record<string, string> = {
  Literatura: 'text-blue-400',
  Filosofia: 'text-purple-400',
  Sociologia: 'text-green-400',
  História: 'text-orange-400',
  Artes: 'text-pink-400',
};

type SortMode = 'default' | 'progress-desc' | 'progress-asc';

export function RepertoireProgressPanel() {
  const { getProgressPercentage, getTotalProgress } = useRepertoireMastery();
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const totalProgress = getTotalProgress();

  const sortedRepertorios = useMemo(() => {
    const items = repertoriosCompletos.map(r => ({
      ...r,
      progress: getProgressPercentage(r.id),
    }));

    if (sortMode === 'progress-desc') {
      return items.sort((a, b) => b.progress - a.progress);
    }
    if (sortMode === 'progress-asc') {
      return items.sort((a, b) => a.progress - b.progress);
    }
    return items;
  }, [sortMode, getProgressPercentage]);

  const cycleSortMode = () => {
    setSortMode(prev => {
      if (prev === 'default') return 'progress-desc';
      if (prev === 'progress-desc') return 'progress-asc';
      return 'default';
    });
  };

  const sortLabel = sortMode === 'default' ? 'Padrão' : sortMode === 'progress-desc' ? 'Maior → Menor' : 'Menor → Maior';

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            Seu Domínio de Repertórios
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={cycleSortMode} className="gap-1.5 text-xs text-muted-foreground">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-2xl font-bold text-accent">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {sortedRepertorios.map((repertorio) => {
            const Icon = categoryIcons[repertorio.categoria] || Book;
            const progress = repertorio.progress;
            const isMastered = progress >= 100;

            return (
              <div
                key={repertorio.id}
                className={`space-y-2 rounded-xl p-3 transition-colors ${
                  isMastered
                    ? 'bg-accent/10 border border-accent/30 ring-1 ring-accent/20'
                    : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isMastered ? (
                      <Trophy className="w-4 h-4 flex-shrink-0 text-accent" />
                    ) : (
                      <Icon className={`w-4 h-4 flex-shrink-0 ${categoryColors[repertorio.categoria] || 'text-muted-foreground'}`} />
                    )}
                    <span className="text-sm font-medium truncate" title={repertorio.titulo}>
                      {repertorio.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isMastered && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] px-1.5 py-0 gap-1">
                        <Star className="w-3 h-3" />
                        Dominado
                      </Badge>
                    )}
                    <span className={`text-sm font-semibold ${isMastered ? 'text-accent' : 'text-muted-foreground'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <Progress value={progress} className={`h-2 ${isMastered ? '[&>div]:bg-accent' : ''}`} />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            Continue explorando repertórios e completando desafios para aumentar seu domínio
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
