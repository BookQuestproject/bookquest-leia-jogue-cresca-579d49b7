import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repertoriosCompletos } from '@/data/repertorios';
import { useRepertoireMastery } from '@/hooks/useRepertoireMastery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, BookOpen, Target, FileText, MessageSquare, Lightbulb,
  Link2, Map, List, Sparkles, Dumbbell, Award, Loader2
} from 'lucide-react';

export default function RepertoireDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getMasteryLevel, 
    getProgressPercentage, 
    markSectionExplored, 
    markChallengeCompleted 
  } = useRepertoireMastery();

  const repertoire = repertoriosCompletos.find(r => r.id === id);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [generatedArguments, setGeneratedArguments] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    if (repertoire) {
      markSectionExplored(repertoire.id, 'resumo');
    }
  }, [repertoire, markSectionExplored]);

  if (!repertoire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Repertório não encontrado</p>
          <Button onClick={() => navigate('/enem')}>Voltar</Button>
        </div>
      </div>
    );
  }

  const level = getMasteryLevel(repertoire.id);
  const progress = getProgressPercentage(repertoire.id);

  const handleGenerateArguments = async () => {
    if (!selectedTheme) {
      toast({
        title: 'Selecione um tema',
        description: 'Escolha um tema antes de gerar argumentos',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-arguments', {
        body: {
          repertoireTitle: repertoire.titulo,
          repertoireContext: repertoire.contexto,
          tema: selectedTheme
        }
      });

      if (error) throw error;

      setGeneratedArguments(data.argumentos || []);
      markSectionExplored(repertoire.id, 'ai-generation');
      
      toast({
        title: '✨ Argumentos gerados!',
        description: 'Use-os como inspiração para suas redações'
      });
    } catch (error: any) {
      console.error('Error generating arguments:', error);
      toast({
        title: 'Erro ao gerar argumentos',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitChallenge = () => {
    if (challengeAnswer.trim().length < 50) {
      toast({
        title: 'Resposta muito curta',
        description: 'Escreva pelo menos 2-3 linhas',
        variant: 'destructive'
      });
      return;
    }

    markChallengeCompleted(repertoire.id, 'mini-desafio');
    setShowChallengeResult(true);
    
    toast({
      title: '🎉 Desafio completo!',
      description: '+15 XP de experiência'
    });
  };

  return (
    <ScrollArea className="h-screen">
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/enem')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Badge className="text-sm px-3 py-1">
            Domínio: {Math.round(progress)}%
          </Badge>
        </div>

        {/* Título e Info Principal */}
        <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-accent" />
                  <CardTitle className="text-3xl">{repertoire.titulo}</CardTitle>
                </div>
                <p className="text-lg text-muted-foreground">{repertoire.autor}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{repertoire.tipo}</Badge>
                  <Badge variant="outline">{repertoire.categoria}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Seções Principais */}
        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="resumo">Resumo & Uso</TabsTrigger>
            <TabsTrigger value="pratica">Prática</TabsTrigger>
            <TabsTrigger value="conexoes">Conexões</TabsTrigger>
          </TabsList>

          {/* Tab 1: Resumo & Uso */}
          <TabsContent value="resumo" className="space-y-6">
            {/* 1. Resumo Estratégico */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'resumo')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Resumo Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Contexto</h4>
                  <p className="text-sm leading-relaxed">{repertoire.contexto}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Problema Social</h4>
                  <p className="text-sm leading-relaxed">{repertoire.problemaSocial}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Ideia Central</h4>
                  <p className="text-sm leading-relaxed font-medium text-accent/90">
                    {repertoire.ideiaCentral}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 2. Temas Aplicáveis */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'temas')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5 text-accent" />
                  Temas Aplicáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {repertoire.temasAplicaveis.map((tema, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="px-3 py-1 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                      onClick={() => setSelectedTheme(tema)}
                    >
                      {tema}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. Estrutura de Uso */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'estrutura')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-accent" />
                  Como Usar na Redação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Apresente a obra</p>
                      <p className="text-sm text-muted-foreground">{repertoire.estruturaUso.passo1}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Contextualize</p>
                      <p className="text-sm text-muted-foreground">{repertoire.estruturaUso.passo2}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Conecte ao tema</p>
                      <p className="text-sm text-muted-foreground">{repertoire.estruturaUso.passo3}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-medium mb-2">Exemplos de frases:</p>
                  <ul className="space-y-2">
                    {repertoire.estruturaUso.exemplos.map((exemplo, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground italic">
                        • {exemplo}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 4. Parágrafo Pronto */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'paragrafo')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Exemplo de Parágrafo Argumentativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm leading-relaxed text-foreground/90 italic">
                    {repertoire.paragrafoPronto}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. Frases Inteligentes */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'frases')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  Frases Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {repertoire.frasesInteligentes.map((frase, idx) => (
                    <AccordionItem key={idx} value={`frase-${idx}`}>
                      <AccordionTrigger className="text-sm hover:text-accent">
                        Frase {idx + 1}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-foreground/90 italic p-3 bg-secondary/20 rounded">
                          {frase}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* 7. Uso Estratégico */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'estrategico')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-accent" />
                  Uso Estratégico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Funciona melhor em:
                  </h4>
                  <div className="flex gap-2">
                    {repertoire.melhorPara.map((parte, idx) => (
                      <Badge key={idx} variant="secondary">
                        {parte === 'introducao' ? 'Introdução' : 
                         parte === 'desenvolvimento' ? 'Desenvolvimento' : 
                         'Comparação de ideias'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Tipos de argumento:
                  </h4>
                  <ul className="space-y-1">
                    {repertoire.tiposArgumento.map((tipo, idx) => (
                      <li key={idx} className="text-sm text-foreground/80">
                        • {tipo}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Prática */}
          <TabsContent value="pratica" className="space-y-6">
            {/* 9. Gerador de Argumentos com AI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Gerar Argumentos com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione um tema:</label>
                  <div className="flex flex-wrap gap-2">
                    {repertoire.temasAplicaveis.slice(0, 5).map((tema, idx) => (
                      <Button
                        key={idx}
                        variant={selectedTheme === tema ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTheme(tema)}
                      >
                        {tema}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateArguments}
                  disabled={isGenerating || !selectedTheme}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Argumentos
                    </>
                  )}
                </Button>

                {generatedArguments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <p className="text-sm font-medium">Argumentos Gerados:</p>
                    {generatedArguments.map((arg, idx) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                        <Badge variant="outline">{arg.tipo}</Badge>
                        <p className="text-sm leading-relaxed">{arg.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 11. Mini Desafio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-accent" />
                  Mini Desafio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Desafio:</p>
                  <p className="text-sm text-foreground">
                    {repertoire.miniDesafio.pergunta}
                  </p>
                </div>

                {!showChallengeResult ? (
                  <>
                    <Textarea
                      value={challengeAnswer}
                      onChange={(e) => setChallengeAnswer(e.target.value)}
                      placeholder="Escreva sua resposta aqui (2-3 linhas)..."
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleSubmitChallenge}
                      disabled={challengeAnswer.trim().length < 50}
                      className="w-full"
                    >
                      Ver Resposta Exemplo
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-2 text-accent mb-2">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-sm font-semibold">Exemplo de Resposta:</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {repertoire.miniDesafio.respostaExemplo}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Sua Resposta:</p>
                      <p className="text-sm text-foreground/90 italic">{challengeAnswer}</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setChallengeAnswer('');
                        setShowChallengeResult(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Conexões */}
          <TabsContent value="conexoes" className="space-y-6">
            {/* 6. Conexões Inteligentes */}
            <Card onClick={() => markSectionExplored(repertoire.id, 'conexoes')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-accent" />
                  Conexões Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repertoire.conexoes.map((conexao, idx) => (
                    <div key={idx} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {conexao.tipo}
                        </Badge>
                        <span className="font-medium text-sm">{conexao.id}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{conexao.explicacao}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer com Progresso */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-semibold">Nível de Domínio</p>
                  <p className="text-sm text-muted-foreground">
                    {level === 'novo' ? 'Novo' :
                     level === 'conhecido' ? 'Conhecido' :
                     level === 'entendido' ? 'Entendido' : 'Dominado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-accent">{Math.round(progress)}%</p>
                <p className="text-sm text-muted-foreground">Completo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
