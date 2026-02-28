import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { BookOpen, Trophy, ArrowRight, Star, Target, Lock, CheckCircle, Play, HelpCircle, MapPin, Sparkles, Repeat, Flame, ChevronRight } from "lucide-react";
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
  const themeColor = currentBookTheme?.color || "220 60% 50%";
  const progressPercent = userStats.totalChapters > 0 ? Math.round((completedChapters / userStats.totalChapters) * 100) : 0;

  const currentChapterQuestion = currentChapter?.question || {
    text: "", options: [], correctAnswer: 0, explanation: ""
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
    if (selectedAnswer !== null) setShowResult(true);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10">

        {/* ── Header ── */}
        <header className="mb-10">
          {hasActiveTrail ? (
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: `hsl(${themeColor})` }} />
                  Sua Jornada Atual
                </p>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                  {userStats.currentBook}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Capítulo {userStats.currentChapter} de {userStats.totalChapters} · {currentBookTheme?.genre}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-border/60 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/trilhas")}
              >
                <Repeat className="w-3.5 h-3.5" />
                Trocar trilha
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Bem-vindo ao BookQuest
              </p>
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
                Comece sua jornada literária
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha uma trilha para iniciar sua aventura
              </p>
            </div>
          )}
        </header>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "XP Total", value: `${userStats.points}`, icon: Star, accent: "text-accent" },
            { label: "Ranking", value: currentTier, icon: Trophy, accent: "text-primary" },
            { label: "Sequência", value: `${userStats.streak} dias`, icon: Flame, accent: "text-orange-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-2 ${stat.accent}`} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main: Trail & Chapters ── */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {hasActiveTrail ? (
              <>
                {/* Continue Reading Card */}
                <div
                  className="rounded-xl p-5 mb-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, hsl(${themeColor} / 0.15), hsl(${themeColor} / 0.05))`,
                    border: `1px solid hsl(${themeColor} / 0.2)`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `hsl(${themeColor} / 0.15)` }}
                    >
                      <span className="text-xl">{activeTrail?.cover || "📖"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Continuar leitura</p>
                      <p className="font-serif font-semibold text-foreground truncate">
                        Capítulo {userStats.currentChapter} — {currentChapter?.title || ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 shrink-0"
                      onClick={() => handleContinueReading()}
                      style={{
                        background: `hsl(${themeColor})`,
                        color: "white",
                      }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Ler agora
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: `hsl(${themeColor} / 0.15)` }}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{completedChapters} de {userStats.totalChapters} capítulos</span>
                      <span className="font-medium text-foreground">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%`, background: `hsl(${themeColor})` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Chapter List */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">Capítulos</h3>
                  {chapters.map((chapter) => {
                    const isLocked = chapter.status === "locked";
                    const isCurrent = chapter.status === "current";
                    const isCompleted = chapter.status === "completed";

                    return (
                      <div
                        key={chapter.id}
                        onClick={() => !isLocked && handleContinueReading(chapter.id)}
                        className={`
                          flex items-center gap-3.5 p-3 rounded-lg border transition-all duration-200
                          ${isLocked
                            ? "cursor-not-allowed opacity-50 border-border/30 bg-transparent"
                            : isCurrent
                            ? "cursor-pointer border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08]"
                            : isCompleted
                            ? "cursor-pointer border-border/40 bg-card/40 hover:bg-card/60"
                            : "cursor-pointer border-border/30 hover:border-border/50 hover:bg-card/30"
                          }
                        `}
                      >
                        {/* Chapter number / status */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isCompleted
                              ? "bg-accent/15 text-accent"
                              : isCurrent
                              ? "text-white"
                              : "bg-muted/30 text-muted-foreground"
                          }`}
                          style={isCurrent ? { background: `hsl(${themeColor})` } : {}}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            chapter.id
                          )}
                        </div>

                        {/* Chapter info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                            {chapter.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{chapter.totalPages} páginas</p>
                        </div>

                        {/* Bookmark or arrow */}
                        {!isLocked && !isCompleted && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        )}
                        {isCompleted && (
                          <BookmarkMarker
                            themeColor={themeColor}
                            currentPage={chapter.currentPage}
                            totalPages={chapter.totalPages}
                            isCompleted={isCompleted}
                            onPageUpdate={(page) => console.log(`Page ${page} for ch ${chapter.id}`)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="rounded-xl border border-dashed border-border/40 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-semibold mb-2">Nenhuma trilha ativa</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Explore nossas trilhas literárias e escolha um livro para começar.
                </p>
                <Button className="gap-2" onClick={() => navigate("/trilhas")}>
                  <BookOpen className="w-4 h-4" />
                  Explorar Trilhas
                </Button>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4 order-1 lg:order-2">

            {/* Ranking */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Ranking</h3>
                <Link to="/ranking" className="text-xs text-primary hover:underline">Ver ranking</Link>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <RankingBadge tier={currentTier} size="sm" />
                <span className="text-sm text-muted-foreground">{userStats.points} XP</span>
              </div>
              {nextTier && (
                <div className="pt-3 border-t border-border/40">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Próximo: {nextTier.label}</span>
                    <span className="text-accent font-medium">{userStats.points}/{nextTier.pointsNeeded}</span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${(userStats.points / nextTier.pointsNeeded) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Streak */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-5">
              <StreakFlame days={userStats.streak} showInfo={true} isAdmin={isAdmin} />
            </div>

            {/* Daily Missions */}
            <div className="rounded-xl border border-border/50 bg-card/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">Missões do Dia</h3>
                <Link to="/missoes" className="text-xs text-primary hover:underline">Ver todas</Link>
              </div>
              <div className="space-y-2.5">
                {dailyMissions.map((mission, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${mission.completed ? "bg-accent/[0.06]" : "bg-muted/[0.06]"}`}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${mission.completed ? "bg-accent/15 text-accent" : "bg-muted/30 text-muted-foreground"}`}>
                      <mission.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${mission.completed ? "bg-accent" : "bg-primary"}`} style={{ width: `${(mission.progress / mission.goal) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{mission.progress}/{mission.goal}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-accent whitespace-nowrap">{mission.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Link */}
            <Link
              to="/quiz"
              className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Quiz Literário</p>
                <p className="text-xs text-muted-foreground">Descubra seu gênero ideal</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
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
                  className={`w-full text-left p-4 rounded-lg border transition-all text-sm ${
                    showResult
                      ? index === currentChapterQuestion.correctAnswer
                        ? "bg-emerald/10 border-emerald"
                        : selectedAnswer === index
                        ? "bg-destructive/10 border-destructive"
                        : "bg-muted/30 border-border"
                      : selectedAnswer === index
                      ? "border-primary bg-primary/10"
                      : "bg-muted/30 border-border hover:border-primary/50"
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
                <p className="font-semibold mb-1 text-sm">
                  {selectedAnswer === currentChapterQuestion.correctAnswer ? "✓ Correto! +10 pts" : "✗ Incorreto"}
                </p>
                <p className="text-xs text-muted-foreground">{currentChapterQuestion.explanation}</p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={showResult ? () => setShowChapterQuestion(false) : handleAnswerSubmit}
              disabled={!showResult && selectedAnswer === null}
              style={{ background: `hsl(${themeColor})` }}
            >
              {showResult
                ? selectedAnswer === currentChapterQuestion.correctAnswer ? "Avançar na Trilha" : "Tentar Novamente"
                : "Confirmar Resposta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
