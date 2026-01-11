import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, ArrowRight, Star, Target, Lock, CheckCircle, Play, HelpCircle, MapPin, Bookmark, Castle, Sparkles } from "lucide-react";
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

// Book theme colors based on genre/book
const bookThemes = {
  "harry-potter": {
    name: "Harry Potter e a Pedra Filosofal",
    color: "350 45% 38%", // Ruby wine
    icon: Castle,
    genre: "Fantasia",
  },
  "percy-jackson": {
    name: "Percy Jackson",
    color: "210 55% 35%", // Navy ocean
    icon: Sparkles,
    genre: "Mitologia",
  },
};

const Index = () => {
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // User data - new account starts at 0
  const userStats = {
    booksRead: 0,
    streak: 0,
    currentBook: "Harry Potter e a Pedra Filosofal",
    currentBookId: "harry-potter",
    currentChapter: 1,
    totalChapters: 17,
  };

  const currentBookTheme = bookThemes[userStats.currentBookId as keyof typeof bookThemes];
  const currentTier = getTierFromBooks(userStats.booksRead);
  const nextTier = getNextTierInfo(currentTier);

  // Chapters as mini-books
  const chapters = [
    { id: 1, title: "O Menino que Sobreviveu", status: "current", icon: "🏠" },
    { id: 2, title: "O Vidro que Sumiu", status: "locked", icon: "🐍" },
    { id: 3, title: "As Cartas de Ninguém", status: "locked", icon: "✉️" },
    { id: 4, title: "O Guardião das Chaves", status: "locked", icon: "🗝️" },
    { id: 5, title: "O Beco Diagonal", status: "locked", icon: "🏪" },
  ];

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

  // Dynamic styles based on current book theme
  const themeColor = currentBookTheme?.color || "350 45% 38%";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10 relative">
        {/* Mini Stars Background */}
        <div className="mini-stars-bg" />
        {/* Header - Current Journey */}
        <header className="mb-10 animate-fade-in">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: `hsl(${themeColor})` }} />
            Sua Jornada Atual
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-1">
            {userStats.currentBook}
          </h1>
          <p className="text-muted-foreground">
            Capítulo {userStats.currentChapter} de {userStats.totalChapters} • {currentBookTheme?.genre}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Continue Reading Card with glow */}
            <div 
              className="journey-card current p-6 mb-8 animate-fade-in active-glow" 
              style={{ 
                animationDelay: "0.1s",
                borderColor: `hsl(${themeColor} / 0.5)`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-1">Continue sua jornada</h2>
                  <p className="text-sm text-muted-foreground">Capítulo {userStats.currentChapter}: {chapters[0].title}</p>
                </div>
                <div 
                  className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `hsl(${themeColor} / 0.15)`,
                    color: `hsl(${themeColor})` 
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Em progresso
                </div>
              </div>
              
              <Button 
                variant="hero" 
                size="lg" 
                className="gap-2" 
                onClick={handleContinueReading}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                <Play className="w-5 h-5" />
                Iniciar Leitura
              </Button>
            </div>

            {/* Current Trail Card - Styled like Trilhas page */}
            <div 
              className="rounded-xl p-5 mb-8 animate-fade-in relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                animationDelay: "0.15s"
              }}
            >
              {/* Decorative stars inside card */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-3 right-8 w-1 h-1 bg-white/20 rounded-full" />
                <div className="absolute top-6 right-16 w-0.5 h-0.5 bg-white/15 rounded-full" />
                <div className="absolute bottom-4 right-12 w-1 h-1 bg-white/10 rounded-full" />
                <div className="absolute top-8 right-24 w-0.5 h-0.5 bg-white/20 rounded-full" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm"
                  >
                    <span className="text-2xl">🏰</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                      <BookOpen className="w-3 h-3" />
                      Trilha atual
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-white mb-0.5">
                      {userStats.currentBook}
                    </h3>
                    <p className="text-white/70 text-sm">
                      Capítulo {userStats.currentChapter} de {userStats.totalChapters}
                    </p>
                  </div>
                </div>
                <Link to="/trilhas/harry-potter-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Ver Trilha
                  </Button>
                </Link>
              </div>

              {/* Progress bar inside trail card */}
              <div className="mt-4 pt-3 border-t border-white/20 relative z-10">
                <div className="flex justify-between text-xs text-white/70 mb-2">
                  <span>Progresso</span>
                  <span className="font-semibold text-white">{Math.round((userStats.currentChapter / userStats.totalChapters) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${(userStats.currentChapter / userStats.totalChapters) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chapter Timeline as Mini-Books */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Trilha de Capítulos</h2>
                <Link 
                  to="/trilhas/harry-potter-1" 
                  className="text-sm hover:underline font-medium"
                  style={{ color: `hsl(${themeColor})` }}
                >
                  Ver trilha completa →
                </Link>
              </div>
              
              {/* Journey Path with Mini-Books */}
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0"
                  style={{ 
                    background: `linear-gradient(90deg, hsl(${themeColor} / 0.5) 0%, hsl(var(--muted) / 0.3) 100%)` 
                  }}
                />
                
                <div className="flex gap-4 overflow-x-auto pb-4 relative z-10">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => chapter.status === "current" && handleContinueReading()}
                      disabled={chapter.status === "locked"}
                      className={`mini-book ${chapter.status} flex-shrink-0`}
                      style={chapter.status === "current" ? { 
                        borderColor: `hsl(${themeColor} / 0.6)`,
                        boxShadow: `0 0 20px hsl(${themeColor} / 0.2)`,
                      } : {}}
                    >
                      {/* Book spine indicator */}
                      <div 
                        className="absolute left-1 top-2 bottom-2 w-1 rounded"
                        style={{ 
                          background: chapter.status === "current" 
                            ? `hsl(${themeColor})` 
                            : chapter.status === "completed" 
                            ? `hsl(var(--accent))` 
                            : `hsl(var(--muted-foreground) / 0.2)`,
                          boxShadow: chapter.status === "current" ? `0 0 8px hsl(${themeColor} / 0.6)` : 'none',
                        }}
                      />
                      
                      {/* Book content */}
                      <div className="text-2xl mb-2 ml-2">
                        {chapter.status === "locked" ? (
                          <Lock className="w-6 h-6 text-muted-foreground/50" />
                        ) : chapter.status === "completed" ? (
                          <CheckCircle className="w-6 h-6 text-accent" />
                        ) : (
                          <span>{chapter.icon}</span>
                        )}
                      </div>
                      
                      <span className="text-xs font-semibold text-muted-foreground ml-2">
                        Cap. {chapter.id}
                      </span>
                      <span className="text-xs text-muted-foreground/70 line-clamp-2 text-center mt-1 ml-2 max-w-[80px]">
                        {chapter.title}
                      </span>
                      
                      {chapter.status === "current" && (
                        <span 
                          className="absolute -top-2 -right-2 text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `hsl(${themeColor})`,
                            color: 'white',
                          }}
                        >
                          Atual
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso da jornada</span>
                  <span className="font-semibold">{userStats.currentChapter}/{chapters.length}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${(userStats.currentChapter / chapters.length) * 100}%`,
                      background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 12 + '%')}))`,
                    }}
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
              <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
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
                      ? "border-secondary bg-secondary/10"
                      : "bg-muted/30 border-border hover:border-secondary/50"
                  }`}
                  style={selectedAnswer === index && !showResult ? {
                    borderColor: `hsl(${themeColor})`,
                    backgroundColor: `hsl(${themeColor} / 0.1)`,
                  } : {}}
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
                  className="w-full"
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                  }}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setShowChapterQuestion(false)}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                  }}
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
