import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, CheckCircle2, Lightbulb } from 'lucide-react';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';
import { useToast } from '@/hooks/use-toast';

export function DailyChallenge() {
  const { getDailyChallenge, markChallengeCompleted } = useRepertoireMastery();
  const { toast } = useToast();
  const dailyChallenge = getDailyChallenge();
  
  const [userAnswer, setUserAnswer] = useState('');
  const [showExample, setShowExample] = useState(false);

  const handleSubmit = () => {
    if (userAnswer.trim().length < 50) {
      toast({
        title: 'Resposta muito curta',
        description: 'Escreva pelo menos 2-3 linhas (mínimo 50 caracteres)',
        variant: 'destructive'
      });
      return;
    }

    markChallengeCompleted(dailyChallenge.repertoire.id, dailyChallenge.challengeId);
    setShowExample(true);
    
    toast({
      title: '🎉 Desafio concluído!',
      description: `+20 XP de experiência em ${dailyChallenge.repertoire.titulo}`,
    });
  };

  const handleReset = () => {
    setUserAnswer('');
    setShowExample(false);
  };

  if (dailyChallenge.completed && !showExample) {
    return (
      <Card className="bg-gradient-to-br from-accent/10 via-card to-card border-accent/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Desafio Diário Completo!</h3>
              <p className="text-sm text-muted-foreground">
                Volte amanhã para um novo desafio de repertório
              </p>
            </div>
            <Trophy className="w-8 h-8 text-accent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Flame className="w-5 h-5 text-accent" />
            </div>
            Desafio de Repertório do Dia
          </CardTitle>
          <Badge className="bg-accent text-accent-foreground">+20 XP</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
          <p className="text-sm font-medium text-secondary-foreground">
            Obra: <span className="text-accent font-semibold">{dailyChallenge.repertoire.titulo}</span>
          </p>
          <p className="text-sm text-foreground">
            {dailyChallenge.prompt}
          </p>
        </div>

        {!showExample ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Sua Resposta <span className="text-muted-foreground">(2-3 linhas)</span>
              </label>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Escreva como você usaria este repertório para argumentar sobre o tema proposto..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {userAnswer.length} / 50 caracteres mínimos
              </p>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={userAnswer.trim().length < 50}
              className="w-full"
            >
              Ver Exemplo de Resposta
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-semibold">Exemplo de Resposta:</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {dailyChallenge.repertoire.miniDesafio.respostaExemplo}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
              <p className="text-sm font-medium">Sua Resposta:</p>
              <p className="text-sm text-foreground/90 italic">
                {userAnswer}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => window.location.href = `/enem/repertorio/${dailyChallenge.repertoire.id}`}
                className="flex-1"
              >
                Explorar Obra Completa
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
