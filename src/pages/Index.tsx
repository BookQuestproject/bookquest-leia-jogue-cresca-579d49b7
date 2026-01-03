import { Link } from "react-router-dom";
import { BookOpen, Trophy, Users, Sparkles, ArrowRight, Star, Zap, Target } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import MissionCard from "@/components/MissionCard";
import RankingBadge from "@/components/RankingBadge";

const Index = () => {
  const dailyMissions = [
    {
      title: "Ganhe 50 XP",
      description: "Complete atividades para ganhar XP",
      progress: 20,
      goal: 50,
      xpReward: 10,
    },
    {
      title: "Complete o Quiz",
      description: "Responda todas as perguntas do quiz literário",
      progress: 0,
      goal: 1,
      xpReward: 100,
    },
    {
      title: "Participe da Comunidade",
      description: "Faça um comentário ou recomendação",
      progress: 0,
      goal: 1,
      xpReward: 25,
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Transforme leitura em aventura</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Sua jornada<br />
              <span className="text-gradient">literária</span> começa aqui
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Descubra seu gênero literário, suba no ranking, complete missões e 
              conecte-se com outros leitores. O BookQuest transforma a leitura em 
              uma experiência gamificada e divertida.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/quiz">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/ranking">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver ranking
                  <Trophy className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration / Stats Card */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Seu Progresso</h3>
                <RankingBadge tier="bronze" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Livros lidos</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="text-2xl font-bold text-warning">0</div>
                  <div className="text-xs text-muted-foreground">XP total</div>
                </div>
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-xs text-muted-foreground">Dias seguidos</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Próximo nível: Prata</span>
                  <span className="text-sm font-bold text-primary">0 / 500 XP</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: "0%" }} />
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center floating-animation">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Por que usar o BookQuest?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Aumente seu hábito</h3>
            <p className="text-muted-foreground text-sm">
              Missões diárias e metas semanais que mantêm você motivado a ler todos os dias.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-lg font-bold mb-2">Suba no ranking</h3>
            <p className="text-muted-foreground text-sm">
              Do Bronze ao Lendário. Compita com outros leitores e mostre sua dedicação.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-2">Descubra livros</h3>
            <p className="text-muted-foreground text-sm">
              Recomendações personalizadas baseadas no seu perfil literário único.
            </p>
          </div>
        </div>
      </section>

      {/* Daily Missions */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Missões do Dia</h2>
          <Link to="/missoes" className="text-primary font-bold text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="space-y-4">
          {dailyMissions.map((mission, index) => (
            <MissionCard key={index} {...mission} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="glass-card rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative z-10">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Faça o quiz literário e descubra qual é o seu gênero favorito. 
              É rápido, gratuito e vai te ajudar a encontrar os melhores livros.
            </p>
            <Link to="/quiz">
              <Button variant="hero" size="xl">
                Fazer o Quiz Literário
                <BookOpen className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
