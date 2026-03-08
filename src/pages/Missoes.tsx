import { useState, useCallback } from "react";
import { BookOpen, Clock, Flame, Trophy, Target, Star, Award, Crown, Info, CheckCircle, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProgressBar from "@/components/ProgressBar";
import HabitToast from "@/components/missions/HabitToast";
import ChallengeModal from "@/components/missions/ChallengeModal";
import MilestoneOverlay from "@/components/missions/MilestoneOverlay";
import {
  type Mission,
  type MissionCategory,
  HABIT_MISSIONS,
  CHALLENGE_MISSIONS,
  MILESTONE_MISSIONS,
  ALL_MISSIONS,
  getLevel,
} from "@/components/missions/MissionTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMissoes from "@/components/mobile/MobileMissoes";

const MILESTONE_TITLES: Record<string, string> = {
  "milestone-30-streak": "Leitor Persistente",
  "milestone-100-chapters": "Centenário Literário",
  "milestone-10-books": "Guardião da Estante",
};

const Missoes = () => {
  const isMobile = useIsMobile();
  const [missions, setMissions] = useState<Mission[]>(ALL_MISSIONS);
  const [totalXp, setTotalXp] = useState(35);

  // Notification states
  const [habitToast, setHabitToast] = useState<{ title: string; xp: number } | null>(null);
  const [challengeModal, setChallengeModal] = useState<{ title: string; xp: number } | null>(null);
  const [milestoneOverlay, setMilestoneOverlay] = useState<{ title: string; xp: number; unlockedTitle?: string } | null>(null);

  const habits = missions.filter(m => m.category === "habit");
  const challenges = missions.filter(m => m.category === "challenge");
  const milestones = missions.filter(m => m.category === "milestone");
  const habitsCompleted = habits.filter(m => m.completed).length;

  const handleComplete = useCallback((missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true, progress: m.goal } : m));
    setTotalXp(prev => prev + mission.essenciaValue);

    switch (mission.category) {
      case "habit":
        setHabitToast({ title: mission.title, xp: mission.essenciaValue });
        break;
      case "challenge":
        setChallengeModal({ title: mission.title, xp: mission.essenciaValue });
        break;
      case "milestone":
        setMilestoneOverlay({
          title: mission.title,
          xp: mission.essenciaValue,
          unlockedTitle: MILESTONE_TITLES[mission.id],
        });
        break;
    }
  }, [missions]);

  const level = getLevel(totalXp);

  if (isMobile) {
    return (
      <Layout>
        <MobileMissoes />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 section-bg-missions">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Jornada de Evolução</p>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Missões</h1>
              <p className="text-muted-foreground">
                Construa hábitos, supere desafios e alcance marcos permanentes
              </p>
            </div>
            <div className="editorial-card p-4 flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-accent">{habitsCompleted}/{habits.length}</p>
                <p className="text-xs text-muted-foreground">Hábitos hoje</p>
              </div>
              <div className="w-px h-10 bg-border/60" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold">3 dias</p>
                  <p className="text-xs text-muted-foreground">sequência</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border/60" />
              <div className="text-center">
                <p className="text-lg font-bold text-accent">{totalXp} ✦</p>
                <p className="text-xs text-muted-foreground">{level.current}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Info */}
        <div className="editorial-card p-4 mb-8 border-l-4 border-secondary animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm mb-1">Jornada de Evolução do Leitor</p>
              <p className="text-sm text-muted-foreground">
                Hábitos criam consistência. Desafios impulsionam crescimento. Marcos eternizam suas conquistas. Todas as missões são verificadas automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* ── Hábitos ── */}
        <MissionSection
          title="Hábitos de Leitura"
          subtitle="Base diária · Reiniciam à meia-noite"
          icon={<BookOpen className="w-5 h-5 text-accent" />}
          missions={habits}
          onComplete={handleComplete}
          accentClass="accent"
          delay="0.2s"
          badge={`${habitsCompleted}/${habits.length} hoje`}
        />

        {/* ── Desafios ── */}
        <MissionSection
          title="Desafios de Crescimento"
          subtitle="Superação semanal · Reiniciam toda segunda"
          icon={<Star className="w-5 h-5 text-secondary" />}
          missions={challenges}
          onComplete={handleComplete}
          accentClass="secondary"
          delay="0.3s"
        />

        {/* ── Marcos ── */}
        <MissionSection
          title="Marcos de Evolução"
          subtitle="Conquistas permanentes · Nunca reiniciam"
          icon={<Crown className="w-5 h-5 text-accent" />}
          missions={milestones}
          onComplete={handleComplete}
          accentClass="accent"
          delay="0.4s"
          permanent
        />
      </div>

      {/* Notifications */}
      {habitToast && (
        <HabitToast
          isVisible={!!habitToast}
          missionTitle={habitToast.title}
          xp={habitToast.xp}
          onDone={() => setHabitToast(null)}
        />
      )}
      {challengeModal && (
        <ChallengeModal
          isOpen={!!challengeModal}
          onClose={() => setChallengeModal(null)}
          missionTitle={challengeModal.title}
          xpGained={challengeModal.xp}
        />
      )}
      {milestoneOverlay && (
        <MilestoneOverlay
          isOpen={!!milestoneOverlay}
          onClose={() => setMilestoneOverlay(null)}
          missionTitle={milestoneOverlay.title}
          xpGained={milestoneOverlay.xp}
          unlockedTitle={milestoneOverlay.unlockedTitle}
        />
      )}
    </Layout>
  );
};

/* ── Section component ── */
const MissionSection = ({
  title,
  subtitle,
  icon,
  missions,
  onComplete,
  accentClass,
  delay,
  badge,
  permanent,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  missions: Mission[];
  onComplete: (id: string) => void;
  accentClass: string;
  delay: string;
  badge?: string;
  permanent?: boolean;
}) => (
  <section className="mb-10 animate-fade-in" style={{ animationDelay: delay }}>
    <div className="flex items-center gap-2 mb-5">
      {icon}
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <span className="text-sm text-muted-foreground ml-2">{subtitle}</span>
      {badge && (
        <span className="ml-auto text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{badge}</span>
      )}
      {permanent && (
        <span className="ml-auto text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Permanente</span>
      )}
    </div>
    <div className="space-y-3">
      {missions.map((mission, index) => (
        <MissionCard key={mission.id} mission={mission} onComplete={onComplete} />
      ))}
    </div>
  </section>
);

/* ── Card component ── */
const MissionCard = ({ mission, onComplete }: { mission: Mission; onComplete: (id: string) => void }) => {
  const Icon = mission.icon;
  const categoryColors = {
    habit: "border-accent/40",
    challenge: "border-secondary/40",
    milestone: "border-accent/40",
  };
  const categoryLabels = {
    habit: "Hábito",
    challenge: "Desafio",
    milestone: "Marco",
  };

  return (
    <div
      className={`editorial-card p-4 transition-all duration-200 ${
        mission.completed
          ? `border-l-4 ${categoryColors[mission.category]} bg-accent/5`
          : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
          mission.completed ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
        }`}>
          {mission.completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${mission.completed ? "line-through text-muted-foreground" : ""}`}>
                {mission.title}
              </h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                mission.category === "habit" ? "bg-accent/10 text-accent" :
                mission.category === "challenge" ? "bg-secondary/10 text-secondary" :
                "bg-accent/10 text-accent"
              }`}>
                {categoryLabels[mission.category]}
              </span>
              {mission.permanent && (
                <span className="text-[10px] text-secondary">★ Permanente</span>
              )}
            </div>
            <span className="text-sm font-semibold text-accent flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{mission.xpValue} XP
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>

          {!mission.completed && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar value={mission.progress} max={mission.goal} />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {mission.progress}/{mission.goal}
              </span>
            </div>
          )}

          {mission.completed && (
            <div className="flex items-center gap-2 text-sm text-accent font-medium">
              <CheckCircle className="w-4 h-4" />
              {mission.category === "milestone" ? "Conquistado" : "Completado"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missoes;
