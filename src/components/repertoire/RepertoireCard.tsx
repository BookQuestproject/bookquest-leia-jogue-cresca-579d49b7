import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp } from 'lucide-react';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';
import { RepertorioCompleto } from '@/types/repertoire';

interface RepertoireCardProps {
  repertoire: RepertorioCompleto;
  onClick: () => void;
}

const masteryColors = {
  novo: 'bg-muted text-muted-foreground',
  conhecido: 'bg-blue-500/20 text-blue-400',
  entendido: 'bg-purple-500/20 text-purple-400',
  dominado: 'bg-accent text-accent-foreground'
};

const masteryLabels = {
  novo: 'Novo',
  conhecido: 'Conhecido',
  entendido: 'Entendido',
  dominado: 'Dominado'
};

export function RepertoireCard({ repertoire, onClick }: RepertoireCardProps) {
  const { getMasteryLevel, getProgressPercentage } = useRepertoireMastery();
  const level = getMasteryLevel(repertoire.id);
  const progress = getProgressPercentage(repertoire.id);

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 overflow-hidden"
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-accent transition-colors">
                {repertoire.titulo}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{repertoire.autor}</p>
          </div>
          <Badge className={masteryColors[level]}>
            {masteryLabels[level]}
          </Badge>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2">
          {repertoire.ideiaCentral}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Progresso
            </span>
            <span className="text-accent font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {repertoire.temasAplicaveis.slice(0, 3).map((tema, idx) => (
            <span 
              key={idx} 
              className="text-xs px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full"
            >
              {tema}
            </span>
          ))}
          {repertoire.temasAplicaveis.length > 3 && (
            <span className="text-xs px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-full">
              +{repertoire.temasAplicaveis.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
