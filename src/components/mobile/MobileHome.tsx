import { Link, useNavigate } from "react-router-dom";
import { Play, Flame, Trophy, Target, CheckCircle, BookOpen, ArrowRight, Star, ChevronRight, Lock } from "lucide-react";
import EssenciaIcon from "@/components/EssenciaIcon";
import EssenciaCounter from "@/components/EssenciaCounter";
import { useActiveTrail } from "@/hooks/useActiveTrail";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
import { getStreakColor } from "@/components/StreakFlame";
import StreakCard from "@/components/StreakCard";
import MissionCompletionToast from "@/components/MissionCompletionToast";
import { Button } from "@/components/ui/button";

const MobileHome = () => {
  const navigate = useNavigate();
  const { activeTrail } = useActiveTrail();
  const { profile, isPremium } = useProfile();
  const { essencia, streak } = useUserStats();
  const { missions: dailyMissions, recentCompletion, clearCompletion, completedCount: completedMissions } = useDailyMissions();

  const userName = profile?.full_name?.split(" ")[0] || "Leitor";
  const hasActiveTrail = !!activeTrail;
  const currentChapter = activeTrail?.chapters.find(c => c.status === "current");
  const completedChapters = activeTrail?.chapters.filter(c => c.status === "completed").length || 0;

  const userStats = {
    points: essencia,
    streak: streak,
    totalChapters: activeTrail?.totalChapters || 0,
  };

  const progressPercent = userStats.totalChapters > 0
    ? Math.round((completedChapters / userStats.totalChapters) * 100)
    : 0;

  const currentTier = getTierFromPoints(userStats.points);
  const nextTier = getNextTierInfo(currentTier);
  const streakInfo = getStreakColor(userStats.streak);
  const themeColor = activeTrail?.themeColor || "220 60% 50%";

  return (
    <div className="px-4 pt-2 pb-6 space-y-5 animate-fade-in">
      {/* Greeting + Essência + Streak */}
      <div className="flex items-center justify-between" data-tutorial="welcome-header">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Olá,</p>
          <h1 className="text-xl font-serif font-bold text-foreground">{userName} 👋</h1>
        </div>
        <div className="flex items-center gap-2" data-tutorial="essencia-counter">
          <EssenciaCounter size="sm" />
          <button
            onClick={() => navigate("/perfil")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 active:scale-95 transition-transform ${userStats.streak === 0 ? "opacity-60" : ""}`}
          >
            <Flame
              className="w-4 h-4"
              style={{
                color: userStats.streak === 0 ? "hsl(var(--muted-foreground))" : streakInfo.color,
                filter: userStats.streak === 0 ? "grayscale(1)" : undefined,
              }}
            />
            <span className="text-sm font-bold" style={{ color: userStats.streak === 0 ? "hsl(var(--muted-foreground))" : streakInfo.color }}>
              {userStats.streak}
            </span>
          </button>
        </div>
      </div>

      {/* Continue Reading — Hero CTA */}
      {hasActiveTrail ? (
        <button
          onClick={() => navigate(`/ler/${activeTrail!.bookId}/${currentChapter?.id || 1}`)}
          data-tutorial="current-trail"
          className="w-full rounded-2xl p-5 text-left relative overflow-hidden active:scale-[0.98] transition-transform"
          style={{
            background: `linear-gradient(145deg, hsl(${themeColor}), hsl(${themeColor} / 0.8))`,
            boxShadow: `0 8px 32px hsl(${themeColor} / 0.3)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `hsl(0 0% 100% / 0.15)` }}
            >
              <span className="text-3xl">{activeTrail?.cover || "📖"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                Continuar lendo
              </p>
              <p className="text-white font-serif font-bold text-base leading-tight truncate">
                {activeTrail?.title}
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                Cap. {currentChapter?.id || 1} de {userStats.totalChapters}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `hsl(0 0% 100% / 0.2)` }}
            >
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-white/60 mb-1">
              <span>Progresso</span>
              <span className="font-bold text-white/90">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, hsl(0 0% 100% / 0.9), hsl(0 0% 100% / 0.6))`,
                }}
              />
            </div>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl p-6 text-center bg-card border border-border">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7 text-accent" />
          </div>
          <h3 className="text-base font-serif font-bold mb-1">Comece sua jornada</h3>
          <p className="text-muted-foreground text-sm mb-4">Escolha uma trilha literária</p>
          <Button
            className="w-full gap-2"
            onClick={() => navigate("/trilhas")}
          >
            <BookOpen className="w-4 h-4" />
            Explorar Trilhas
          </Button>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <Link
          to="/ranking"
          data-tutorial="ranking-card"
          className="rounded-xl p-3 bg-card border border-border/60 text-center active:scale-95 transition-transform"
        >
          <div className="flex justify-center mb-1.5">
            <RankingBadge tier={currentTier} showLabel={false} size="sm" />
          </div>
          <p className="text-xs font-bold text-foreground">{currentTier}</p>
          <p className="text-[10px] text-muted-foreground">Ranking</p>
        </Link>

        <Link
          to="/missoes"
          className="rounded-xl p-3 bg-card border border-border/60 text-center active:scale-95 transition-transform"
        >
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
          </div>
          <p className="text-xs font-bold text-foreground">{completedMissions}/{dailyMissions.length}</p>
          <p className="text-[10px] text-muted-foreground">Missões</p>
        </Link>

        <Link
          to="/trilhas"
          className="rounded-xl p-3 bg-card border border-border/60 text-center active:scale-95 transition-transform"
        >
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-xs font-bold text-foreground">{completedChapters}</p>
          <p className="text-[10px] text-muted-foreground">Capítulos</p>
        </Link>
      </div>

      {/* Streak Card */}
      <StreakCard />

      {/* Ranking Progress Card */}
      {nextTier && (
        <Link
          to="/ranking"
          className="block rounded-xl p-4 bg-card border border-border/60 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seu Ranking</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <RankingBadge tier={currentTier} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{userStats.points} ✦</p>
              <p className="text-[11px] text-muted-foreground">
                Faltam <span className="text-accent font-bold">{nextTier.pointsNeeded - userStats.points} ✦</span> para {nextTier.label}
              </p>
            </div>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(userStats.points / nextTier.pointsNeeded) * 100}%`,
                background: `linear-gradient(90deg, hsl(var(--accent)), hsl(40 80% 55%))`,
              }}
            />
          </div>
        </Link>
      )}

      {/* Daily Missions */}
      <div className="rounded-xl p-4 bg-card border border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <EssenciaIcon size="sm" className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Missões do Dia</span>
          </div>
          <Link to="/missoes" className="text-[11px] text-accent font-semibold">
            Ver todas →
          </Link>
        </div>
        <div className="space-y-2">
          {dailyMissions.map((mission) => (
            <div
              key={mission.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${
                mission.completed ? "bg-accent/5 border border-accent/15" : "bg-muted/10 border border-border/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  mission.completed ? "bg-accent/15 text-accent" : "bg-muted/30 text-muted-foreground"
                }`}
              >
                {mission.completed ? <CheckCircle className="w-4 h-4" /> : <mission.icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${mission.completed ? "line-through text-muted-foreground/50" : ""}`}>
                  {mission.title}
                </p>
                {!mission.completed && (
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(mission.progress / mission.goal) * 100}%`,
                        background: `hsl(var(--secondary))`,
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-accent whitespace-nowrap">{mission.rewardLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          to={profile?.quiz_completed && !isPremium ? "/premium" : "/quiz"}
          className="rounded-xl p-4 bg-card border border-border/60 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            {profile?.quiz_completed && !isPremium ? (
              <Lock className="w-4 h-4 text-accent" />
            ) : (
              <Star className="w-4 h-4 text-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Quiz Literário</p>
            <p className="text-[10px] text-muted-foreground">
              {profile?.quiz_completed && !isPremium ? "Premium" : "Descubra seu gênero"}
            </p>
          </div>
        </Link>
        <Link
          to="/estante"
          className="rounded-xl p-4 bg-card border border-border/60 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Minha Estante</p>
            <p className="text-[10px] text-muted-foreground">Seus livros</p>
          </div>
        </Link>
      </div>

      {/* Mission Completion Toast */}
      {recentCompletion && (
        <MissionCompletionToast
          missionTitle={recentCompletion.missionTitle}
          reward={recentCompletion.reward}
          onClose={clearCompletion}
        />
      )}
    </div>
  );
};

export default MobileHome;
