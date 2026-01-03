import { Link } from "react-router-dom";
import { BookOpen, Trophy, Flame, ArrowRight, Star, Target, Lock, CheckCircle, Play } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromBooks, getNextTierInfo } from "@/components/RankingBadge";

const Index = () => {
  // User data - would come from state/backend
  const userStats = {
    booksRead: 2,
    streak: 3,
    currentTrail: "Fantasia",
    currentChapter: 2,
  };

  const currentTier = getTierFromBooks(userStats.booksRead);
  const nextTier = getNextTierInfo(currentTier);

  // Trail nodes representing reading progress
  const trailNodes = [
    { id: 1, title: "Introdução", status: "completed", icon: "📖" },
    { id: 2, title: "Capítulo 1", status: "completed", icon: "✨" },
    { id: 3, title: "Capítulo 2", status: "current", icon: "🎯" },
    { id: 4, title: "Capítulo 3", status: "locked", icon: "📚" },
    { id: 5, title: "Quiz Final", status: "locked", icon: "🏆" },
  ];

  const dailyMissions = [
    {
      title: "Ler 1 capítulo",
      progress: 0,
      goal: 1,
      reward: "+10 pts",
      icon: "📖",
    },
    {
      title: "Completar quiz",
      progress: 0,
      goal: 1,
      reward: "+25 pts",
      icon: "🧠",
    },
    {
      title: "Manter sequência",
      progress: 1,
      goal: 1,
      reward: "+5 pts",
      icon: "🔥",
      completed: true,
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4 lg:py-8">
        {/* Current Trail Header */}
        <div className="glass-card rounded-2xl p-4 lg:p-6 mb-6 animate-fade-in bg-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-foreground/80 mb-1">← Trilha atual</p>
              <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">
                {userStats.currentTrail}
              </h1>
            </div>
            <Button variant="secondary" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Guia
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Trail - Center */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Trail Progress */}
            <div className="flex flex-col items-center py-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {/* Start Button */}
              <Link to="/trilhas/fantasia/capitulo-2">
                <Button variant="hero" size="lg" className="mb-8 gap-2">
                  <Play className="w-5 h-5" />
                  Continuar Leitura
                </Button>
              </Link>

              {/* Trail Nodes */}
              <div className="relative flex flex-col items-center space-y-4">
                {trailNodes.map((node, index) => (
                  <div key={node.id} className="relative">
                    {/* Connection Line */}
                    {index < trailNodes.length - 1 && (
                      <div 
                        className={`absolute left-1/2 top-full w-1 h-4 -translate-x-1/2 ${
                          node.status === "completed" ? "bg-primary" : "bg-muted"
                        }`} 
                      />
                    )}
                    
                    {/* Node */}
                    <button
                      className={`trail-node ${node.status} relative`}
                      disabled={node.status === "locked"}
                    >
                      {node.status === "completed" ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : node.status === "current" ? (
                        <span className="text-2xl">{node.icon}</span>
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                      
                      {node.status === "current" && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-bold text-primary">{node.title}</span>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Trail Info */}
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Progresso na trilha
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(userStats.currentChapter / trailNodes.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {userStats.currentChapter}/{trailNodes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Ranking Card */}
            <div className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Seu Ranking</h3>
                <Link to="/ranking" className="text-xs text-primary font-bold hover:underline">
                  Ver todos
                </Link>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <RankingBadge tier={currentTier} size="sm" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {userStats.booksRead} livros lidos
                  </p>
                </div>
              </div>

              {nextTier && (
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="font-bold">{userStats.booksRead}/{nextTier.booksNeeded}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(userStats.booksRead / nextTier.booksNeeded) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{userStats.streak}</p>
                  <p className="text-sm text-muted-foreground">dias de sequência</p>
                </div>
              </div>
            </div>

            {/* Daily Missions */}
            <div className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Missões do Dia</h3>
                <Link to="/missoes" className="text-xs text-primary font-bold hover:underline">
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-3">
                {dailyMissions.map((mission, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      mission.completed ? "bg-primary/10" : "bg-secondary"
                    }`}
                  >
                    <span className="text-xl">{mission.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        mission.completed ? "line-through text-muted-foreground" : ""
                      }`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              mission.completed ? "bg-primary" : "bg-accent"
                            }`}
                            style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {mission.progress}/{mission.goal}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent">{mission.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Access */}
            <div className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <Link 
                to="/quiz" 
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Quiz Literário</p>
                  <p className="text-xs text-muted-foreground">Descubra seu gênero</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
