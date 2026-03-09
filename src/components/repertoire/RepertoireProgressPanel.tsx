import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, Brain, Users, History, Palette } from 'lucide-react';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';
import { repertoriosCompletos } from '@/data/repertorios';

const categoryIcons = {
  Literatura: Book,
  Filosofia: Brain,
  Sociologia: Users,
  História: History,
  Artes: Palette
};

const categoryColors = {
  Literatura: 'text-blue-400',
  Filosofia: 'text-purple-400',
  Sociologia: 'text-green-400',
  História: 'text-orange-400',
  Artes: 'text-pink-400'
};

export function RepertoireProgressPanel() {
  const { getProgressPercentage, getTotalProgress } = useRepertoireMastery();
  
  const totalProgress = getTotalProgress();

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/20">
            <Brain className="w-5 h-5 text-accent" />
          </div>
          Seu Domínio de Repertórios
        </CardTitle>
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
          {repertoriosCompletos.map((repertorio) => {
            const Icon = categoryIcons[repertorio.categoria];
            const progress = getProgressPercentage(repertorio.id);
            
            return (
              <div key={repertorio.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${categoryColors[repertorio.categoria]}`} />
                    <span className="text-sm font-medium truncate" title={repertorio.titulo}>
                      {repertorio.titulo}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-accent flex-shrink-0">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
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
