import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, ArrowRight, Star, Target, Lock, CheckCircle, Play, HelpCircle, MapPin, Bookmark } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromBooks, getNextTierInfo } from "@/components/RankingBadge";
import StreakFlame from "@/components/StreakFlame";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // User data - estado inicial para conta nova (0 streak, 0 livros)
  const userStats = {
    booksRead: 0,
    streak: 0,
    currentBook: "Harry Potter e a Pedra Filosofal",
    currentChapter: 1,
    totalChapters: 17,
  };

  const currentTier = getTierFromBooks(userStats.booksRead);
  const nextTier = getNextTierInfo(currentTier);

  // Trail nodes representing chapters of current book - editorial style
  const trailNodes = [
    { id: 1, title: "O Menino que Sobreviveu", status: "current" },
    { id: 2, title: "O Vidro que Sumiu", status: "locked" },
    { id: 3, title: "As Cartas de Ninguém", status: "locked" },
    { id: 4, title: "O Guardião das Chaves", status: "locked" },
    { id: 5, title: "O Beco Diagonal", status: "locked" },
  ];

  // Pergunta do capítulo atual
  const currentChapterQuestion = {
    text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?",
    options: [
      "Porque os Potter eram criminosos procurados",
      "Porque não queriam ser associados a algo 'anormal'",
      "Porque deviam dinheiro aos Potter",
      "Porque os Potter eram celebridades famosas",
      "Porque tinham vergonha de serem parentes de bruxos"
    ],
    correctAnswer: 1,
    explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico."
  };

  const dailyMissions = [
    {
      title: "Responder pergunta de capítulo",
      progress: 0,
      goal: 1,
      reward: "+10 pts",
      icon: BookOpen,
    },
    {
      title: "Completar unidade de trilha",
      progress: 0,
      goal: 1,
      reward: "+25 pts",
      icon: Target,
    },
    {
      title: "Fazer login hoje",
      progress: 1,
      goal: 1,
      reward: "+5 pts",
      icon: CheckCircle,
      completed: true,
    },
  ];

  const handleContinueReading = () => {
    setShowChapterQuestion(true);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10">
        {/* Header - Current Journey */}
        <header className="mb-10 animate-fade-in">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Sua Jornada Atual</p>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-1">
            {userStats.currentBook}
          </h1>
          <p className="text-muted-foreground">
            Capítulo {userStats.currentChapter} de {userStats.totalChapters}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Journey Timeline */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Continue Reading Card */}
            <div className="journey-card current p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-1">Continue sua jornada</h2>
                  <p className="text-sm text-muted-foreground">Capítulo {userStats.currentChapter}: {trailNodes[0].title}</p>
                </div>
                <div className="flex items-center gap-1 text-accent text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Em progresso
                </div>
              </div>
              
              <Button variant="hero" size="lg" className="gap-2" onClick={handleContinueReading}>
                <Play className="w-5 h-5" />
                Iniciar Leitura
              </Button>
            </div>

            {/* Chapter Timeline - Editorial Style */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Trilha de Capítulos</h2>
                <Link to="/trilhas/harry-potter-1" className="text-sm text-secondary hover:underline font-medium">
                  Ver trilha completa →
                </Link>
              </div>
              
              <div className="space-y-3">
                {trailNodes.map((node, index) => (
                  <button
                    key={node.id}
                    onClick={() => node.status === "current" && handleContinueReading()}
                    disabled={node.status === "locked"}
                    className={`chapter-node w-full ${node.status} text-left`}
                  >
                    <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                      node.status === "completed" 
                        ? "bg-accent/20 text-accent" 
                        : node.status === "current"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {node.status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : node.status === "current" ? (
                        <Bookmark className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Capítulo {node.id}</p>
                      <p className="text-sm text-muted-foreground truncate">{node.title}</p>
                    </div>

                    {node.status === "current" && (
                      <span className="text-xs text-secondary font-medium px-2 py-1 rounded bg-secondary/10">
                        Atual
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso da jornada</span>
                  <span className="font-semibold">{userStats.currentChapter}/{trailNodes.length}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${(userStats.currentChapter / trailNodes.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Ranking Card */}
            <div className="editorial-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Seu Ranking</h3>
                <Link to="/ranking" className="text-xs text-secondary hover:underline font-medium">
                  Ver ranking
                </Link>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <RankingBadge tier={currentTier} size="sm" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {userStats.booksRead} livros lidos
                  </p>
                </div>
              </div>

              {nextTier && (
                <div className="pt-4 border-t border-border/60">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="font-semibold text-accent">{userStats.booksRead}/{nextTier.booksNeeded}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill achievement"
                      style={{ width: `${(userStats.booksRead / nextTier.booksNeeded) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div className="editorial-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <StreakFlame days={userStats.streak} showInfo={true} />
            </div>

            {/* Daily Missions */}
            <div className="editorial-card p-5 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Missões do Dia</h3>
                <Link to="/missoes" className="text-xs text-secondary hover:underline font-medium">
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-3">
                {dailyMissions.map((mission, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded ${
                      mission.completed ? "bg-accent/10" : "bg-muted/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      mission.completed ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      <mission.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        mission.completed ? "line-through text-muted-foreground" : ""
                      }`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-muted/60 rounded overflow-hidden">
                          <div 
                            className={`h-full rounded ${
                              mission.completed ? "bg-accent" : "bg-secondary"
                            }`}
                            style={{ width: `${(mission.progress / mission.goal) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {mission.progress}/{mission.goal}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-accent">{mission.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Link */}
            <Link 
              to="/quiz" 
              className="editorial-card p-5 flex items-center gap-4 hover:border-secondary/50 transition-colors animate-fade-in"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Quiz Literário</p>
                <p className="text-xs text-muted-foreground">Descubra seu gênero ideal</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Chapter Question Modal */}
      <Dialog open={showChapterQuestion} onOpenChange={setShowChapterQuestion}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <HelpCircle className="w-5 h-5 text-secondary" />
              Pergunta do Capítulo {userStats.currentChapter}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <p className="text-lg">{currentChapterQuestion.text}</p>
            
            <div className="space-y-2">
              {currentChapterQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded border transition-all ${
                    showResult
                      ? index === currentChapterQuestion.correctAnswer
                        ? "bg-emerald/10 border-emerald"
                        : selectedAnswer === index
                        ? "bg-destructive/10 border-destructive"
                        : "bg-muted/30 border-border"
                      : selectedAnswer === index
                      ? "bg-secondary/10 border-secondary"
                      : "bg-muted/30 border-border hover:border-secondary/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {showResult && (
              <div className={`p-4 rounded ${
                selectedAnswer === currentChapterQuestion.correctAnswer
                  ? "bg-emerald/10 border border-emerald/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}>
                <p className="font-semibold mb-2">
                  {selectedAnswer === currentChapterQuestion.correctAnswer
                    ? "✓ Correto! +10 pts"
                    : "✗ Incorreto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentChapterQuestion.explanation}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {!showResult ? (
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => setShowChapterQuestion(false)}
                >
                  {selectedAnswer === currentChapterQuestion.correctAnswer ? "Avançar na Trilha" : "Tentar Novamente"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;