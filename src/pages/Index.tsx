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
import EssenciaCounter from "@/components/EssenciaCounter";

import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
import StreakFlame from "@/components/StreakFlame";
import { ReadingPlanCard } from "@/components/ReadingPlanWidget";
import BenefitsSection from "@/components/home/BenefitsSection";
import QuizCTA from "@/components/home/QuizCTA";
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
  const { essencia, streak } = useUserStats();
  const { missions: dailyMissions, recentCompletion, clearCompletion } = useDailyMissions();
  const [showChapterQuestion, setShowChapterQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { getPageBookmark, setPageBookmark } = usePageBookmark(activeTrail?.bookId);
  const hasActiveTrailData = !!activeTrail;
  const currentChapter = activeTrail?.chapters.find(c => c.status === "current");
  const completedChapters = activeTrail?.chapters.filter(c => c.status === "completed").length || 0;

  const userStats = {
    points: essencia,
    streak: streak,
    currentBook: activeTrail?.title || null,
    currentBookId: activeTrail?.bookId || null,
    currentChapter: currentChapter?.id || 0,
    totalChapters: activeTrail?.totalChapters || 0,
  };

  const hasActiveTrail = hasActiveTrailData;
  const currentBookTheme = hasActiveTrail ? { color: activeTrail!.themeColor, genre: activeTrail!.genre } : null;
  const currentTier = getTierFromPoints(userStats.points);
  const nextTier = getNextTierInfo(currentTier);

  // Expand chapters to match totalChapters (handles legacy trails saved with only 3 chapters)
  const CHAPTER_ICONS_HOME = ["📖", "📝", "🔍", "💡", "🌟", "📚", "🎯", "🏆", "🔑", "🌙", "⚡", "🎭", "🗺️", "💎", "🌊", "🔥", "🎪", "🏰", "⭐", "🎨", "🌈", "🪶", "🧩", "🎶", "🌿"];
  const rawChapters = activeTrail?.chapters || [];
  const total = activeTrail?.totalChapters || rawChapters.length;
  const chapters = rawChapters.length >= total ? rawChapters : [
    ...rawChapters,
    ...Array.from({ length: total - rawChapters.length }, (_, idx) => {
      const i = rawChapters.length + idx;
      return {
        id: i + 1,
        title: `Capítulo ${i + 1}`,
        status: "locked" as const,
        icon: CHAPTER_ICONS_HOME[i % CHAPTER_ICONS_HOME.length],
        totalPages: 18,
      };
    }),
  ];

  const currentChapterQuestion = currentChapter?.question || {
    text: "",
    options: [],
    correctAnswer: 0,
    explanation: ""
  };


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
        {/* Constellations removed — global starfield (body) provides the cosmic backdrop without overlapping interactive UI. */}

        {/* Top Bar: Essência + Settings */}
        <div className="flex items-center justify-end gap-2 mb-4 animate-fade-in">
          <div data-tutorial="essencia-counter">
            <EssenciaCounter size="md" />
          </div>
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
                  Sua jornada continua hoje
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
                    {activeTrail?.coverImage ? (
                      <img
                        src={activeTrail.coverImage}
                        alt={`Capa de ${activeTrail.title}`}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="text-4xl items-center justify-center w-full h-full"
                      style={{ display: activeTrail?.coverImage ? 'none' : 'flex' }}
                    >
                      {activeTrail?.cover || '📖'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground mb-1">
                      {userStats.currentBook}
                    </h1>
                    <p className="text-muted-foreground text-sm mb-1">
                      Capítulo {userStats.currentChapter} de {userStats.totalChapters} • {currentBookTheme?.genre}
                    </p>
                    <p className="text-[13px] text-foreground/80 font-medium mb-4 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-accent" />
                      {userStats.streak > 0
                        ? `Você está a ${userStats.streak} ${userStats.streak === 1 ? "dia" : "dias"} lendo — continue de onde parou.`
                        : "Continue de onde parou e comece sua sequência hoje."}
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
                      title="Trocar de jornada"
                    >
                      <Repeat className="w-5 h-5" />
                    </Button>
                    <Button
                      size="xl"
                      className="gap-2.5 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-xl shadow-accent/30 text-lg px-8 py-7 rounded-2xl journey-cta-btn animate-fade-in"
                      onClick={() => handleContinueReading()}
                    >
                      <Play className="w-6 h-6 fill-current" />
                      Continuar leitura
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

        {/* ═══════════ BENEFITS + QUIZ CTA ═══════════ */}
        {!hasActiveTrail && (
          <div className="mb-6 lg:mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BenefitsSection />
          </div>
        )}
        {(!quizCompleted || isPremium) && (
          <div className="mb-6 lg:mb-8 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <QuizCTA quizCompleted={!!quizCompleted} isPremium={!!isPremium} />
          </div>
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
                  {/* Mapa do tesouro — capítulos como livros conectados verticalmente */}
                  <div className="relative max-w-md mx-auto py-4" data-tutorial="chapter-list">
                    {chapters.map((chapter, index) => {
                      const isLocked = chapter.status === "locked";
                      const isCurrent = chapter.status === "current";
                      const isCompleted = chapter.status === "completed";
                      const isLast = index === chapters.length - 1;

                      const positions = ["justify-start", "justify-center", "justify-end", "justify-center"];
                      const align = positions[index % positions.length];
                      const nextAlign = positions[(index + 1) % positions.length];

                      return (
                        <div key={chapter.id} className="relative">
                          <div className={`flex ${align}`}>
                            <button
                              onClick={() => !isLocked && handleContinueReading(chapter.id)}
                              disabled={isLocked}
                              className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${
                                isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:-translate-y-1"
                              }`}
                              aria-label={`Capítulo ${chapter.id}: ${chapter.title}`}
                            >
                              {/* Livro */}
                              <div
                                className="relative w-24 h-32 rounded-md flex items-center justify-center shadow-lg transition-transform"
                                style={{
                                  background: isLocked
                                    ? `linear-gradient(135deg, hsl(${themeColor} / 0.25), hsl(${themeColor} / 0.15))`
                                    : isCompleted
                                    ? `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor} / 0.75))`
                                    : `linear-gradient(135deg, hsl(${themeColor} / 0.95), hsl(${themeColor} / 0.7))`,
                                  border: isCurrent
                                    ? `3px solid hsl(45 95% 60%)`
                                    : `2px solid hsl(${themeColor} / 0.6)`,
                                  boxShadow: isCurrent
                                    ? `0 0 0 4px hsl(45 95% 60% / 0.25), 0 10px 30px hsl(${themeColor} / 0.4)`
                                    : isCompleted
                                    ? `0 8px 22px hsl(${themeColor} / 0.35)`
                                    : `0 6px 16px hsl(${themeColor} / 0.2)`,
                                }}
                              >
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-2 rounded-l-md"
                                  style={{ background: `hsl(${themeColor} / 0.5)` }}
                                />
                                <div className="absolute inset-2 border border-white/20 rounded-sm pointer-events-none" />

                                {isLocked ? (
                                  <Lock className="w-8 h-8 text-white/80" strokeWidth={2.5} />
                                ) : isCompleted ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-3xl drop-shadow">{(chapter as any).icon || "📖"}</span>
                                    <CheckCircle className="w-4 h-4 text-white drop-shadow" />
                                  </div>
                                ) : (
                                  <span className="text-4xl drop-shadow-md">{(chapter as any).icon || "📖"}</span>
                                )}

                                {isCurrent && (
                                  <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shadow-md"
                                    style={{ background: `hsl(45 95% 60%)`, color: `hsl(${themeColor})` }}
                                  >
                                    Você está aqui
                                  </div>
                                )}

                                <div
                                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white"
                                  style={{
                                    background: isLocked ? `hsl(${themeColor} / 0.4)` : `hsl(${themeColor})`,
                                    color: "white",
                                  }}
                                >
                                  {chapter.id}
                                </div>
                              </div>

                              <div className="text-center max-w-[140px]">
                                <p
                                  className={`text-xs font-serif font-semibold leading-tight ${
                                    isLocked ? "text-muted-foreground" : "text-foreground"
                                  }`}
                                >
                                  {chapter.title}
                                </p>
                                {isCurrent && chapter.totalPages && (
                                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: `hsl(${themeColor})` }}>
                                    {chapter.totalPages} páginas
                                  </p>
                                )}
                              </div>
                            </button>
                          </div>

                          {!isLast && (
                            <div className="relative h-16 w-full pointer-events-none" aria-hidden="true">
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="none">
                                {(() => {
                                  const xMap: Record<string, number> = {
                                    "justify-start": 80,
                                    "justify-center": 200,
                                    "justify-end": 320,
                                  };
                                  const x1 = xMap[align];
                                  const x2 = xMap[nextAlign];
                                  return (
                                    <path
                                      d={`M ${x1} 0 C ${x1} 32, ${x2} 32, ${x2} 64`}
                                      fill="none"
                                      stroke={`hsl(${themeColor} / ${isCompleted ? "0.7" : "0.35"})`}
                                      strokeWidth="3"
                                      strokeDasharray="6 8"
                                      strokeLinecap="round"
                                    />
                                  );
                                })()}
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="flex justify-center mt-4">
                      <div
                        className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow"
                        style={{
                          background: `linear-gradient(135deg, hsl(45 95% 60%), hsl(40 90% 50%))`,
                          color: `hsl(${themeColor})`,
                        }}
                      >
                        🏁 Fim da Jornada
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="rounded-2xl p-12 text-center animate-fade-in bg-card border border-border" data-tutorial="current-trail">
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

            {/* Streak Card — improved */}
            <div
              className="animate-fade-in"
              data-tutorial="streak-card"
              style={{ animationDelay: "0.2s" }}
            >
              <StreakCard />
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
                    <span className="text-[11px] font-bold text-accent whitespace-nowrap">{mission.rewardLabel}</span>
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

      {/* Mission Completion Toast */}
      {recentCompletion && (
        <MissionCompletionToast
          missionTitle={recentCompletion.missionTitle}
          reward={recentCompletion.reward}
          onClose={clearCompletion}
        />
      )}
    </Layout>
  );
};

export default Index;
