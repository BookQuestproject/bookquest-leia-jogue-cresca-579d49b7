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

const Index = () => {
  const navigate = useNavigate();
  const { activeTrail } = useActiveTrail();
  const { isAdmin } = useAdmin();
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const hasActiveTrailData = !!activeTrail;
  const currentChapter = activeTrail?.chapters.find(c => c.status === "current");
  const completedChapters = activeTrail?.chapters.filter(c => c.status === "completed").length || 0;

  const userStats = {
    points: 35,
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
    { title: "Responder pergunta de capítulo", progress: 0, goal: 1, reward: "+10 pts", icon: BookOpen },
    { title: "Completar unidade de trilha", progress: 0, goal: 1, reward: "+25 pts", icon: Target },
    { title: "Fazer login hoje", progress: 1, goal: 1, reward: "+5 pts", icon: CheckCircle, completed: true },
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

  const themeColor = currentBookTheme?.color || "220 60% 50%";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10 relative">

        {/* Header */}
        <header className="mb-8 animate-fade-in" data-tutorial="welcome-header">
          {hasActiveTrail ? (
            <>
              <p className="text-xs text-accent font-semibold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Sua Jornada Atual
              </p>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-1">
                {userStats.currentBook}
              </h1>
              <p className="text-muted-foreground text-sm">
                Capítulo {userStats.currentChapter} de {userStats.totalChapters} • {currentBookTheme?.genre}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-accent font-semibold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Bem-vindo ao BookQuest
              </p>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-1">
                Comece sua jornada literária
              </h1>
              <p className="text-muted-foreground text-sm">
                Escolha uma trilha para iniciar sua aventura
              </p>
            </>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content — col-span-2 */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            {hasActiveTrail ? (
              <>
                {/* Current Trail Card — premium feel */}
                <div
                  data-tutorial="current-trail"
                  className="rounded-xl overflow-hidden animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  {/* Card body */}
                  <div
                    className="p-6 relative rounded-xl bg-card border border-border"
                  >
                    {/* Accent glow */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                      style={{ background: `hsl(${themeColor} / 0.08)` }}
                    />

                    <div className="flex items-start justify-between relative z-10 gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, hsl(${themeColor} / 0.25), hsl(${themeColor} / 0.1))`,
                            border: `1px solid hsl(${themeColor} / 0.3)`,
                          }}
                        >
                          <span className="text-3xl">{activeTrail?.cover || '📖'}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
                            <BookOpen className="w-3 h-3" />
                            Trilha atual
                          </div>
                          <h3 className="text-lg font-serif font-bold text-foreground mb-0.5 truncate">
                            {userStats.currentBook}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Capítulo {userStats.currentChapter} de {userStats.totalChapters}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          onClick={(e) => { e.stopPropagation(); navigate('/trilhas'); }}
                          title="Trocar de trilha"
                        >
                          <Repeat className="w-5 h-5" />
                        </Button>
                        <Button
                          size="lg"
                          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg shadow-accent/20"
                          onClick={() => handleContinueReading()}
                        >
                          <Play className="w-5 h-5" />
                          Continuar Leitura
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-5 pt-4 border-t border-border/40 relative z-10">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Progresso da jornada</span>
                        <span className="font-bold text-accent">
                          {Math.round((userStats.currentChapter / userStats.totalChapters) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(userStats.currentChapter / userStats.totalChapters) * 100}%`,
                            background: `linear-gradient(90deg, hsl(var(--accent)), hsl(40 80% 55%))`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter list */}
                <div className="animate-fade-in space-y-2.5" data-tutorial="chapter-list" style={{ animationDelay: "0.2s" }}>
                  {chapters.map((chapter) => {
                    const isLocked = chapter.status === "locked";
                    const isCurrent = chapter.status === "current";
                    const isCompleted = chapter.status === "completed";
                    const isOpenBook = !isLocked;

                    const handlePageUpdate = (page: number) => {
                      console.log(`Saving page ${page} for chapter ${chapter.id}`);
                    };

                    return (
                      <div
                        key={chapter.id}
                        onClick={() => !isLocked && handleContinueReading(chapter.id)}
                        className={`
                          relative w-full rounded-lg overflow-visible transition-all duration-300 text-left
                          ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5'}
                        `}
                        style={{
                          background: isOpenBook
                            ? `linear-gradient(145deg, hsl(43 30% 94%), hsl(35 25% 88%))`
                            : `linear-gradient(145deg, hsl(${themeColor} / 0.08), hsl(${themeColor} / 0.03))`,
                          border: isCurrent
                            ? `2px solid hsl(var(--accent))`
                            : `1px solid hsl(${themeColor} / ${isOpenBook ? '0.25' : '0.15'})`,
                          boxShadow: isCurrent
                            ? `0 4px 20px hsl(var(--accent) / 0.15)`
                            : 'none',
                        }}
                      >
                        {/* Paper texture */}
                        {isOpenBook && (
                          <div
                            className="absolute inset-0 opacity-15 rounded-lg"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            }}
                          />
                        )}

                        {/* Book spine */}
                        {isOpenBook && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-lg"
                            style={{
                              background: isCurrent
                                ? `linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent) / 0.6))`
                                : `linear-gradient(90deg, hsl(${themeColor} / 0.2), transparent)`,
                            }}
                          />
                        )}

                        <div className="relative p-4 flex items-center gap-4">
                          <div
                            className="w-14 h-18 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, hsl(${themeColor} / ${isOpenBook ? '0.15' : '0.1'}), hsl(${themeColor} / 0.05))`,
                              border: `1px solid hsl(${themeColor} / 0.2)`,
                            }}
                          >
                            <span className={`text-2xl ${isLocked ? 'opacity-40' : ''}`}>{chapter.icon}</span>
                          </div>

                          <div className="flex-1">
                            <p
                              className="text-[11px] font-semibold mb-0.5 uppercase tracking-wider"
                              style={{ color: isCurrent ? `hsl(var(--accent))` : `hsl(${themeColor})`, opacity: isLocked ? 0.5 : 0.8 }}
                            >
                              Capítulo {chapter.id}
                            </p>
                            <p className={`font-serif text-sm font-semibold line-clamp-2 mb-1 ${isLocked ? 'text-foreground/50' : 'text-foreground'}`}>
                              {chapter.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {chapter.totalPages} páginas
                            </p>
                          </div>

                          {isLocked ? (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-muted/30 border border-border/30">
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
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

                        {isCurrent && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg"
                            style={{
                              background: `linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.3))`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="rounded-xl p-12 text-center animate-fade-in bg-card border border-border" data-tutorial="explore-trails-cta">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Nenhuma trilha ativa</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  Explore nossas trilhas literárias e escolha um livro para começar sua jornada de leitura.
                </p>
                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg shadow-accent/20" size="lg" onClick={() => navigate('/trilhas')}>
                  <BookOpen className="w-5 h-5" />
                  Explorar Trilhas
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Ranking Card */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="ranking-card"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-[0.12em] text-muted-foreground/60">Seu Ranking</h3>
                <Link to="/ranking" className="text-[11px] text-accent hover:underline font-semibold">
                  Ver ranking →
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <RankingBadge tier={currentTier} size="sm" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userStats.points} XP
                  </p>
                </div>
              </div>

              {nextTier && (
                <div className="pt-3 border-t border-border/30">
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="font-bold text-accent">{userStats.points}/{nextTier.pointsNeeded} XP</span>
                  </div>
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(userStats.points / nextTier.pointsNeeded) * 100}%`,
                        background: `linear-gradient(90deg, hsl(var(--accent)), hsl(40 80% 55%))`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="streak-card"
              style={{ animationDelay: "0.3s" }}
            >
              <StreakFlame days={userStats.streak} showInfo={true} isAdmin={isAdmin} />
            </div>

            {/* Daily Missions */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="missions-card"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-[0.12em] text-muted-foreground/60">Missões do Dia</h3>
                <Link to="/missoes" className="text-[11px] text-accent hover:underline font-semibold">
                  Ver todas →
                </Link>
              </div>

              <div className="space-y-2.5">
                {dailyMissions.map((mission, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      mission.completed ? "bg-accent/5 border border-accent/10" : "bg-muted/20 border border-border/20"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      mission.completed ? "bg-accent/15 text-accent" : "bg-muted/40 text-muted-foreground"
                    }`}>
                      <mission.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${
                        mission.completed ? "line-through text-muted-foreground/60" : "text-foreground"
                      }`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(mission.progress / mission.goal) * 100}%`,
                              background: mission.completed
                                ? `hsl(var(--accent))`
                                : `hsl(var(--secondary))`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {mission.progress}/{mission.goal}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-accent">{mission.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Link */}
            <Link
              to="/quiz"
              className="rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-md hover:shadow-accent/5 animate-fade-in group bg-card border border-border"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/15">
                <Star className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[13px]">Quiz Literário</p>
                <p className="text-[11px] text-muted-foreground">Descubra seu gênero ideal</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
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
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    showResult
                      ? index === currentChapterQuestion.correctAnswer
                        ? "bg-emerald/10 border-emerald"
                        : selectedAnswer === index
                        ? "bg-destructive/10 border-destructive"
                        : "bg-muted/30 border-border"
                      : selectedAnswer === index
                      ? "border-accent bg-accent/10"
                      : "bg-muted/30 border-border hover:border-accent/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {showResult && (
              <div className={`p-4 rounded-lg ${
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
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
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
