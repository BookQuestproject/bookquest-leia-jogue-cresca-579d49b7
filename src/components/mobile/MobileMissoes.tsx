import { useState, useCallback } from "react";
import { BookOpen, Clock, Flame, Trophy, Star, Award, Crown, CheckCircle } from "lucide-react";
import EssenciaIcon from "@/components/EssenciaIcon";
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

const MILESTONE_TITLES: Record<string, string> = {
  "milestone-30-streak": "Leitor Persistente",
  "milestone-100-chapters": "Centenário Literário",
  "milestone-10-books": "Guardião da Estante",
};

const MobileMissoes = () => {
  const [missions, setMissions] = useState<Mission[]>(ALL_MISSIONS);
  const [totalXp, setTotalXp] = useState(35);
  const [activeTab, setActiveTab] = useState<MissionCategory>("habit");

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
  const tabMissions = activeTab === "habit" ? habits : activeTab === "challenge" ? challenges : milestones;

  const tabs = [
    { key: "habit" as const, label: "Hábitos", icon: BookOpen, count: `${habitsCompleted}/${habits.length}` },
    { key: "challenge" as const, label: "Desafios", icon: Star, count: `${challenges.filter(m => m.completed).length}/${challenges.length}` },
    { key: "milestone" as const, label: "Marcos", icon: Crown, count: `${milestones.filter(m => m.completed).length}/${milestones.length}` },
  ];

  return (
    <div className="px-4 pt-2 pb-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Jornada de Evolução</p>
        <h1 className="text-xl font-serif font-bold">Missões</h1>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 rounded-xl p-3 bg-card border border-border/60">
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-accent">{habitsCompleted}/{habits.length}</p>
          <p className="text-[10px] text-muted-foreground">Hábitos</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold">3</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Sequência</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-accent">{totalXp}</p>
          <p className="text-[10px] text-muted-foreground">Essência</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span className={`text-[9px] ${activeTab === tab.key ? "text-accent" : "text-muted-foreground/60"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Category description */}
      <div className="px-1">
        <p className="text-[11px] text-muted-foreground">
          {activeTab === "habit" && "Crie consistência com hábitos diários de leitura. Verificação automática."}
          {activeTab === "challenge" && "Supere desafios semanais para crescer mais rápido."}
          {activeTab === "milestone" && "Conquistas permanentes que marcam sua evolução como leitor."}
        </p>
      </div>

      {/* Mission Cards */}
      <div className="space-y-2.5">
        {tabMissions.map(mission => {
          const Icon = mission.icon;
          return (
            <div
              key={mission.id}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                mission.completed
                  ? "bg-accent/5 border border-accent/20"
                  : "bg-card border border-border/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  mission.completed ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                }`}>
                  {mission.completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-semibold ${mission.completed ? "line-through text-muted-foreground/50" : ""}`}>
                        {mission.title}
                      </p>
                      {mission.permanent && (
                        <span className="text-[9px] text-secondary font-bold">★</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-accent flex items-center gap-1 ml-2 flex-shrink-0">
                      <EssenciaIcon size="xs" className="text-accent" />
                      +{mission.essenciaValue}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">{mission.description}</p>
                  {!mission.completed && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={mission.progress} max={mission.goal} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {mission.progress}/{mission.goal}
                      </span>
                    </div>
                  )}
                  {mission.completed && (
                    <div className="flex items-center gap-1 text-[11px] text-accent font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {mission.category === "milestone" ? "Conquistado" : "Completado"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
    </div>
  );
};

export default MobileMissoes;
