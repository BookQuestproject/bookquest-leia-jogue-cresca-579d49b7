import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, Brain, Users, History, Palette } from 'lucide-react';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';

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
  const { getCategoryProgress, getTotalProgress } = useRepertoireMastery();
  
  const categories = ['Literatura', 'Filosofia', 'Sociologia', 'História', 'Artes'] as const;
  
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const progress = getCategoryProgress(category);
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${categoryColors[category]}`} />
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  <span className="text-sm font-semibold text-accent">
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
