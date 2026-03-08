import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { BookOpen, Trophy, ArrowRight, Star, Target, Lock, CheckCircle, Play, HelpCircle, MapPin, Sparkles, Repeat, Zap, Clock, Flame, Settings } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BookmarkMarker from "@/components/BookmarkMarker";
import { useActiveTrail } from "@/hooks/useActiveTrail";
import { useProfile } from "@/hooks/useProfile";
import { usePageBookmark } from "@/hooks/usePageBookmark";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStats } from "@/hooks/useUserStats";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import MobileHome from "@/components/mobile/MobileHome";
import MissionCompletionToast from "@/components/MissionCompletionToast";
import StreakCard from "@/components/StreakCard";

import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
import StreakFlame from "@/components/StreakFlame";
import { ReadingPlanCard } from "@/components/ReadingPlanWidget";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { activeTrail } = useActiveTrail();
  const { isAdmin } = useAdmin();
  const { quizCompleted, isPremium } = useProfile();
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { getPageBookmark, setPageBookmark } = usePageBookmark(activeTrail?.bookId);
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
    { title: "Complete 1 capítulo hoje", progress: 0, goal: 1, reward: "+10 ✦", icon: BookOpen },
    { title: "Completar unidade de trilha", progress: 0, goal: 1, reward: "+25 ✦", icon: Target },
    { title: "Fazer login hoje", progress: 1, goal: 1, reward: "+5 ✦", icon: CheckCircle, completed: true },
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

  // Dynamic motivational message
  const getMotivationalMessage = () => {
    if (!hasActiveTrail) return null;
    if (userStats.streak === 0) return { icon: Flame, text: "Leia hoje para iniciar sua sequência!", color: "text-accent" };
    if (nextTier) {
      const xpToNext = nextTier.pointsNeeded - userStats.points;
      if (xpToNext <= 30) return { icon: Zap, text: `Você está a ${xpToNext} Essência de subir para ${nextTier.label}!`, color: "text-accent" };
    }
    return { icon: Zap, text: `Continue lendo para manter sua sequência de ${userStats.streak} dias!`, color: "text-accent" };
  };

  const motivational = getMotivationalMessage();
  const progressPercent = userStats.totalChapters > 0 ? Math.round((completedChapters / userStats.totalChapters) * 100) : 0;

  if (isMobile) {
    return (
      <Layout>
        <MobileHome />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10 relative">

        {/* Top Bar: Settings */}
        <div className="flex items-center justify-end mb-4 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            onClick={() => navigate('/configuracoes')}
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* ═══════════ HERO SECTION — Call to Action ═══════════ */}
        {hasActiveTrail ? (
          <div className="mb-8 animate-fade-in" data-tutorial="welcome-header">
            {/* Motivational banner */}
            {motivational && (
              <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-accent/8 border border-accent/15">
                <motivational.icon className={`w-4 h-4 ${motivational.color} flex-shrink-0`} />
                <p className={`text-sm font-semibold ${motivational.color}`}>{motivational.text}</p>
              </div>
            )}

            {/* Main hero card */}
            <div
              className="rounded-2xl p-6 lg:p-8 relative overflow-hidden border border-border group/hero journey-hero-card"
              style={{
                '--book-color': `hsl(${themeColor})`,
                '--book-color-20': `hsl(${themeColor} / 0.20)`,
                '--book-color-10': `hsl(${themeColor} / 0.10)`,
                '--book-color-05': `hsl(${themeColor} / 0.05)`,
                background: `linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--card)) 40%, hsl(${themeColor} / 0.06) 100%)`,
                borderColor: `hsl(${themeColor} / 0.15)`,
              } as React.CSSProperties}
            >
              {/* === FULL BACKGROUND animated gradient === */}
              <div
                className="absolute inset-0 pointer-events-none opacity-100 transition-opacity duration-700"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 80% 20%, hsl(${themeColor} / 0.12), transparent 60%),
                    radial-gradient(ellipse 60% 80% at 20% 80%, hsl(${themeColor} / 0.08), transparent 60%),
                    radial-gradient(ellipse 50% 50% at 50% 50%, hsl(${themeColor} / 0.04), transparent 70%)
                  `,
                  animation: 'journeyBgBreath 8s ease-in-out infinite',
                }}
              />

              {/* Sweeping color wash across full card */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06] group-hover/hero:opacity-[0.12] transition-opacity duration-700"
                style={{
                  background: `linear-gradient(105deg, transparent 20%, hsl(${themeColor} / 0.3) 50%, transparent 80%)`,
                  backgroundSize: '250% 100%',
                  animation: 'journeySweep 10s ease-in-out infinite',
                }}
              />

              {/* Large radial glow — book color */}
              <div
                className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl pointer-events-none group-hover/hero:opacity-30 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle, hsl(${themeColor} / 0.35), transparent 65%)`,
                  opacity: 0.18,
                  animation: 'journeyGlowPulse 7s ease-in-out infinite',
                }}
              />

              {/* Bottom-left glow — book color */}
              <div
                className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none group-hover/hero:opacity-20 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle, hsl(${themeColor} / 0.25), transparent 65%)`,
                  opacity: 0.12,
                  animation: 'journeyGlowPulse 9s ease-in-out infinite reverse',
                }}
              />

              {/* Top border glow line — book color */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none opacity-40 group-hover/hero:opacity-60 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent 5%, hsl(${themeColor} / 0.6) 30%, hsl(${themeColor} / 0.8) 50%, hsl(${themeColor} / 0.6) 70%, transparent 95%)`,
                  backgroundSize: '200% 100%',
                  animation: 'journeySweep 8s ease-in-out infinite',
                }}
              />

              {/* Bottom border glow — subtle */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none opacity-20"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(${themeColor} / 0.5), transparent)`,
                }}
              />

              <div className="relative z-10">
                <p className="text-xs text-accent font-bold uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  Sua Jornada Atual
                </p>

                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Book icon */}
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${themeColor} / 0.2), hsl(${themeColor} / 0.05))`,
                      boxShadow: `0 0 30px hsl(${themeColor} / 0.2), 0 0 60px hsl(${themeColor} / 0.08)`,
                      border: `1px solid hsl(${themeColor} / 0.25)`,
                    }}
                  >
                    <span className="text-4xl">{activeTrail?.cover || '📖'}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground mb-1">
                      {userStats.currentBook}
                    </h1>
                    <p className="text-muted-foreground text-sm mb-4">
                      Capítulo {userStats.currentChapter} de {userStats.totalChapters} • {currentBookTheme?.genre}
                    </p>

                    {/* Thick progress bar with book color */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Progresso da jornada</span>
                        <span className="font-bold text-accent">{progressPercent}%</span>
                      </div>
                      <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${progressPercent}%`,
                            background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor} / 0.7))`,
                            boxShadow: `0 0 12px hsl(${themeColor} / 0.4), 0 0 4px hsl(${themeColor} / 0.2)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      onClick={(e) => { e.stopPropagation(); navigate('/trilhas'); }}
                      title="Trocar de trilha"
                    >
                      <Repeat className="w-5 h-5" />
                    </Button>
                    <Button
                      size="xl"
                      className="gap-2.5 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg shadow-accent/25 text-base journey-cta-btn"
                      onClick={() => handleContinueReading()}
                    >
                      <Play className="w-5 h-5" />
                      Continuar Leitura
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome header — no active trail */
          <header className="mb-8 animate-fade-in" data-tutorial="welcome-header">
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
          </header>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ═══════════ MAIN CONTENT — col-span-2 ═══════════ */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            {hasActiveTrail ? (
              <>
                {/* Chapter list — Trilha Literária */}
                <div className="animate-fade-in" data-tutorial="current-trail" style={{ animationDelay: "0.15s" }}>
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Trilha Literária
                  </h2>
                  <div className="space-y-2.5" data-tutorial="chapter-list">
                    {chapters.map((chapter) => {
                      const isLocked = chapter.status === "locked";
                      const isCurrent = chapter.status === "current";
                      const isCompleted = chapter.status === "completed";

                      const handlePageUpdate = (page: number) => {
                        setPageBookmark(chapter.id, page);
                      };
                      const savedPage = getPageBookmark(chapter.id);

                      return (
                        <div
                          key={chapter.id}
                          onClick={() => !isLocked && handleContinueReading(chapter.id)}
                          className={`
                            relative w-full rounded-xl overflow-hidden transition-all duration-300 text-left group
                            ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5'}
                          `}
                          style={{
                            background: isCurrent
                              ? undefined
                              : undefined,
                            border: isCurrent
                              ? `2px solid hsl(var(--accent) / 0.5)`
                              : `1px solid hsl(var(--border) / 0.5)`,
                            boxShadow: isCurrent
                              ? `0 0 24px hsl(var(--accent) / 0.1)`
                              : 'none',
                          }}
                        >
                          {/* Card bg */}
                          <div className={`absolute inset-0 ${isCurrent ? 'bg-accent/5' : 'bg-card'}`} />

                          {/* Left accent bar */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                            style={{
                              background: isCompleted
                                ? `hsl(var(--accent))`
                                : isCurrent
                                ? `linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent) / 0.4))`
                                : `hsl(var(--border) / 0.3)`,
                            }}
                          />

                          <div className="relative p-4 flex items-center gap-4">
                            {/* Chapter badge */}
                            <div
                              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                                isCompleted
                                  ? 'bg-accent/15 text-accent border border-accent/25'
                                  : isCurrent
                                  ? 'bg-accent/20 text-accent border border-accent/30'
                                  : 'bg-muted/30 text-muted-foreground border border-border/30'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                chapter.id
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`font-serif text-sm font-semibold line-clamp-1 mb-0.5 ${isLocked ? 'text-foreground/40' : 'text-foreground'}`}>
                                {chapter.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {chapter.totalPages} páginas
                              </p>
                            </div>

                            {isLocked ? (
                              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-muted/20 border border-border/20">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground/30" />
                              </div>
                            ) : (
                              <BookmarkMarker
                                themeColor={themeColor}
                                currentPage={savedPage ?? chapter.currentPage}
                                totalPages={chapter.totalPages}
                                isCompleted={isCompleted}
                                onPageUpdate={handlePageUpdate}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="rounded-2xl p-12 text-center animate-fade-in bg-card border border-border" data-tutorial="explore-trails-cta">
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

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="space-y-4 order-1 lg:order-2">

            {/* Ranking Card — competitive triggers */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="ranking-card"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-[0.12em] text-muted-foreground/60">Seu Ranking</h3>
                <Link to="/ranking" className="text-[11px] text-accent hover:underline font-semibold">
                  Ver ranking →
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <RankingBadge tier={currentTier} size="sm" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userStats.points} ✦
                  </p>
                </div>
              </div>

              {/* Competitive micro-stimulus */}
              <p className="text-[11px] text-accent/80 font-medium mb-3 px-1">
                ⚡ Você está melhor que 68% dos leitores.
              </p>

              {nextTier && (
                <div className="pt-3 border-t border-border/30">
                  <div className="flex justify-between text-[11px] mb-2">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="font-bold text-accent">{userStats.points}/{nextTier.pointsNeeded} ✦</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(userStats.points / nextTier.pointsNeeded) * 100}%`,
                        background: `linear-gradient(90deg, hsl(var(--accent)), hsl(40 80% 55%))`,
                        boxShadow: `0 0 8px hsl(var(--accent) / 0.3)`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Card — positive tension */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="streak-card"
              style={{ animationDelay: "0.2s" }}
            >
              <StreakFlame days={userStats.streak} showInfo={true} isAdmin={isAdmin} />
              {/* Urgency message */}
              {userStats.streak > 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <p className="text-[11px] text-accent font-medium">
                    Sua sequência expira em ~{Math.floor(Math.random() * 12) + 4}h. Leia para mantê-la!
                  </p>
                </div>
              )}
              {userStats.streak === 0 && (
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <p className="text-[11px] text-accent/80 font-medium">
                    Leia hoje e inicie sua sequência de fogo!
                  </p>
                </div>
              )}
            </div>

            {/* Daily Missions — strategic */}
            <div
              className="rounded-xl p-5 animate-fade-in bg-card border border-border"
              data-tutorial="missions-card"
              style={{ animationDelay: "0.3s" }}
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
                      mission.completed ? "bg-accent/5 border border-accent/15" : "bg-muted/15 border border-border/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      mission.completed ? "bg-accent/15 text-accent" : "bg-muted/30 text-muted-foreground"
                    }`}>
                      <mission.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${
                        mission.completed ? "line-through text-muted-foreground/50" : "text-foreground"
                      }`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
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
                    <span className="text-[11px] font-bold text-accent whitespace-nowrap">{mission.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Plan Card */}
            <ReadingPlanCard />

            {/* Quiz Link */}
            <Link
              to={quizCompleted && !isPremium ? "/premium" : "/quiz"}
              className="rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-md hover:shadow-accent/5 animate-fade-in group bg-card border border-border"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/15">
                <Star className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[13px]">Quiz Literário</p>
                <p className="text-[11px] text-muted-foreground">
                  {quizCompleted && !isPremium ? "Premium — Refazer quiz" : "Descubra seu gênero ideal"}
                </p>
              </div>
              {quizCompleted && !isPremium ? (
                <Lock className="w-4 h-4 text-accent" />
              ) : (
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
              )}
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
                    ? "✓ Correto! +10 Essência"
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
