import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { BookOpen, Trophy, ArrowRight, Star, Target, Lock, CheckCircle, Play, HelpCircle, MapPin, Castle, Sparkles, Repeat } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BookmarkMarker from "@/components/BookmarkMarker";
import { useActiveTrail } from "@/hooks/useActiveTrail";

import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
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
  const navigate = useNavigate();
  const { activeTrail } = useActiveTrail();
  const { isAdmin } = useAdmin();
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Derive stats from active trail
  const hasActiveTrailData = !!activeTrail;
  const currentChapter = activeTrail?.chapters.find(c => c.status === "current");
  const completedChapters = activeTrail?.chapters.filter(c => c.status === "completed").length || 0;

  const userStats = {
    points: 35, // Will come from real data
    streak: 0,
    currentBook: activeTrail?.title || null,
    currentBookId: activeTrail?.bookId || null,
    currentChapter: currentChapter?.id || 0,
    totalChapters: activeTrail?.totalChapters || 0,
  };

  const hasActiveTrail = hasActiveTrailData;
  const currentBookTheme = hasActiveTrail ? { color: activeTrail!.themeColor, genre: activeTrail!.genre } : null;
  const currentTier = getTierFromPoints(userStats.points);
  const nextTier = getNextTierInfo(currentTier);

  const chapters = activeTrail?.chapters || [];

  const currentChapterQuestion = currentChapter?.question || {
    text: "",
    options: [],
    correctAnswer: 0,
    explanation: ""
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

  const handleContinueReading = (chapterId?: number) => {
    if (!activeTrail) return;
    const targetChapter = chapterId || userStats.currentChapter;
    navigate(`/ler/${activeTrail.bookId}/${targetChapter}`);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true);
    }
  };

  // Dynamic styles based on current book theme
  const themeColor = currentBookTheme?.color || "220 60% 50%";

  return (
    <Layout>
      
      <div className="max-w-5xl mx-auto py-6 lg:py-10 relative">
        {/* Header - Current Journey */}
        <header className="mb-10 animate-fade-in" data-tutorial="welcome-header">
          {hasActiveTrail ? (
            <>
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
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Bem-vindo ao BookQuest
              </p>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-1">
                Comece sua jornada literária
              </h1>
              <p className="text-muted-foreground">
                Escolha uma trilha para iniciar sua aventura
              </p>
            </>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {hasActiveTrail ? (
            <>
            {/* Current Trail Card */}
            <div
              data-tutorial="current-trail"
              className="rounded-xl p-5 mb-8 animate-fade-in relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                animationDelay: "0.1s"
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
                    <span className="text-2xl">{activeTrail?.cover || '📖'}</span>
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
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); navigate('/trilhas'); }}
                    title="Trocar de trilha"
                  >
                    <Repeat className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="gap-2" 
                    onClick={() => handleContinueReading()}
                    style={{ 
                      background: `linear-gradient(135deg, hsl(0 0% 100% / 0.15), hsl(0 0% 100% / 0.05))`,
                      border: '1px solid hsl(0 0% 100% / 0.3)',
                    }}
                  >
                    <Play className="w-5 h-5" />
                    Continuar Leitura
                  </Button>
                </div>
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

            {/* Complete Chapter Trail */}
            <div className="animate-fade-in space-y-3" data-tutorial="chapter-list" style={{ animationDelay: "0.2s" }}>
              {chapters.map((chapter) => {
                const isLocked = chapter.status === "locked";
                const isCurrent = chapter.status === "current";
                const isCompleted = chapter.status === "completed";
                const isOpenBook = !isLocked;

                const handlePageUpdate = (page: number) => {
                  // TODO: Save page to database
                  console.log(`Saving page ${page} for chapter ${chapter.id}`);
                };

                return (
                  <div
                    key={chapter.id}
                    onClick={() => !isLocked && handleContinueReading(chapter.id)}
                    className={`
                      relative w-full rounded-lg overflow-visible transition-all duration-300 text-left
                      ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
                    `}
                    style={{
                      background: isOpenBook 
                        ? `linear-gradient(145deg, hsl(43 30% 94%), hsl(35 25% 88%))`
                        : `linear-gradient(145deg, hsl(${themeColor} / 0.12), hsl(${themeColor} / 0.06))`,
                      border: isCurrent 
                        ? `2px solid hsl(${themeColor})` 
                        : `1px solid hsl(${themeColor} / ${isOpenBook ? '0.35' : '0.2'})`,
                      minHeight: '80px',
                      boxShadow: isCurrent 
                        ? `0 8px 32px hsl(${themeColor} / 0.25)`
                        : isOpenBook
                        ? `0 4px 16px hsl(${themeColor} / 0.1)`
                        : 'none',
                    }}
                  >
                    {/* Paper texture for open books */}
                    {isOpenBook && (
                      <div 
                        className="absolute inset-0 opacity-20 rounded-lg"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                      />
                    )}

                    {/* Left book spine effect for open books */}
                    {isOpenBook && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-3 rounded-l-lg"
                        style={{
                          background: `linear-gradient(90deg, hsl(${themeColor} / 0.25), transparent)`,
                        }}
                      />
                    )}

                    <div className="relative p-4 flex items-center gap-4">
                      {/* Book cover / illustration area */}
                      <div 
                        className="w-16 h-20 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, hsl(${themeColor} / ${isOpenBook ? '0.2' : '0.15'}), hsl(${themeColor} / 0.08))`,
                          border: `1px solid hsl(${themeColor} / 0.25)`,
                        }}
                      >
                        <span className={`text-2xl ${isLocked ? 'opacity-50' : ''}`}>{chapter.icon}</span>
                      </div>

                      {/* Chapter info */}
                      <div className="flex-1">
                        <p 
                          className="text-xs font-medium mb-1"
                          style={{ color: `hsl(${themeColor})`, opacity: isLocked ? 0.6 : 1 }}
                        >
                          Capítulo {chapter.id}
                        </p>
                        <p className={`font-serif text-sm font-semibold line-clamp-2 mb-1 ${isLocked ? 'text-foreground/60' : 'text-foreground'}`}>
                          {chapter.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chapter.totalPages} páginas
                        </p>
                      </div>

                      {/* Right side: Lock or Bookmark */}
                      {isLocked ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `hsl(${themeColor} / 0.1)`,
                            border: `1px solid hsl(${themeColor} / 0.2)`,
                          }}
                        >
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      ) : (
                        <BookmarkMarker
                          themeColor={themeColor}
                          currentPage={chapter.currentPage}
                          totalPages={chapter.totalPages}
                          isCompleted={isCompleted}
                          onPageUpdate={handlePageUpdate}
                        />
                      )}
                    </div>

                    {/* Current chapter indicator bar */}
                    {isCurrent && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                        style={{
                          background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor} / 0.6))`,
                        }}
                      />
                    )}
                  </div>
                );
              })}

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
            </>
            ) : (
              /* Empty state - No active trail */
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-10 text-center animate-fade-in mb-8" data-tutorial="explore-trails-cta">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">Nenhuma trilha ativa</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Explore nossas trilhas literárias e escolha um livro para começar sua jornada de leitura.
                </p>
                <Button variant="hero" size="lg" className="gap-2" onClick={() => navigate('/trilhas')}>
                  <BookOpen className="w-5 h-5" />
                  Explorar Trilhas
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Ranking Card */}
            <div className="editorial-card p-5 animate-fade-in" data-tutorial="ranking-card" style={{ animationDelay: "0.2s" }}>
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
                    {userStats.points} XP ⚡
                  </p>
                </div>
              </div>

              {nextTier && (
                <div className="pt-4 border-t border-border/60">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="font-semibold text-accent">{userStats.points}/{nextTier.pointsNeeded} XP</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill achievement"
                      style={{ width: `${(userStats.points / nextTier.pointsNeeded) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div className="editorial-card p-5 animate-fade-in" data-tutorial="streak-card" style={{ animationDelay: "0.3s" }}>
              <StreakFlame days={userStats.streak} showInfo={true} isAdmin={isAdmin} />
            </div>

            {/* Daily Missions */}
            <div className="editorial-card p-5 animate-fade-in" data-tutorial="missions-card" style={{ animationDelay: "0.4s" }}>
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
                              mission.completed ? "bg-accent" : "bg-primary"
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
