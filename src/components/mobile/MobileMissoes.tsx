import { useState } from "react";
import { Target, CheckCircle, Clock, Flame, Trophy, Star, Gift, Zap } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import MissionCompletedModal from "@/components/MissionCompletedModal";

interface Mission {
  id: number;
  title: string;
  description: string;
  icon: typeof Target;
  progress: number;
  goal: number;
  reward: string;
  xpValue: number;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
}

const initialMissions: Mission[] = [
  { id: 1, title: "Responder pergunta de capítulo", description: "Responda uma pergunta", icon: Target, progress: 0, goal: 1, reward: "+10 pts", xpValue: 10, type: "daily", completed: false },
  { id: 2, title: "Fazer login hoje", description: "Acesse o BookQuest", icon: CheckCircle, progress: 1, goal: 1, reward: "+5 pts", xpValue: 5, type: "daily", completed: true },
  { id: 3, title: "Completar quiz literário", description: "Responda o quiz", icon: Star, progress: 0, goal: 1, reward: "+25 pts", xpValue: 25, type: "daily", completed: false },
  { id: 5, title: "Completar 5 unidades", description: "Responda 5 perguntas", icon: Target, progress: 0, goal: 5, reward: "+50 pts", xpValue: 50, type: "weekly", completed: false },
  { id: 6, title: "Sequência de 7 dias", description: "Login 7 dias seguidos", icon: Flame, progress: 0, goal: 7, reward: "+100 pts", xpValue: 100, type: "weekly", completed: false },
  { id: 8, title: "Concluir livro", description: "Complete uma trilha", icon: Trophy, progress: 0, goal: 1, reward: "+200 pts", xpValue: 200, type: "monthly", completed: false },
  { id: 9, title: "Responder 20 perguntas", description: "Complete 20 unidades", icon: Target, progress: 0, goal: 20, reward: "+150 pts", xpValue: 150, type: "monthly", completed: false },
];

const LEVELS = [
  { name: "Iniciante", xp: 0 },
  { name: "Explorador", xp: 100 },
  { name: "Aventureiro", xp: 300 },
  { name: "Mestre Leitor", xp: 600 },
  { name: "Lenda Literária", xp: 1000 },
];

const getLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return {
        current: LEVELS[i].name,
        nextXp: LEVELS[i + 1]?.xp ?? LEVELS[i].xp,
        next: LEVELS[i + 1]?.name ?? null,
      };
    }
  }
  return { current: LEVELS[0].name, nextXp: LEVELS[1].xp, next: LEVELS[1].name };
};

const MobileMissoes = () => {
  const [missions, setMissions] = useState(initialMissions);
  const [totalXp, setTotalXp] = useState(35);
  const [modalOpen, setModalOpen] = useState(false);
  const [completedMission, setCompletedMission] = useState<{ title: string; xp: number } | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevelName, setNewLevelName] = useState("");
  const [previousLevelName, setPreviousLevelName] = useState("");
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const dailyMissions = missions.filter(m => m.type === "daily");
  const weeklyMissions = missions.filter(m => m.type === "weekly");
  const monthlyMissions = missions.filter(m => m.type === "monthly");
  const completedToday = dailyMissions.filter(m => m.completed).length;

  const handleCompleteMission = (missionId: number) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;
    const prevLevel = getLevel(totalXp);
    const newXp = totalXp + mission.xpValue;
    const newLevel = getLevel(newXp);
    const didLevelUp = newLevel.current !== prevLevel.current;
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true, progress: m.goal } : m));
    setTotalXp(newXp);
    setCompletedMission({ title: mission.title, xp: mission.xpValue });
    setLeveledUp(didLevelUp);
    setNewLevelName(didLevelUp ? newLevel.current : "");
    setPreviousLevelName(didLevelUp ? prevLevel.current : "");
    setModalOpen(true);
  };

  const level = getLevel(totalXp);
  const tabMissions = activeTab === "daily" ? dailyMissions : activeTab === "weekly" ? weeklyMissions : monthlyMissions;

  return (
    <div className="px-4 pt-2 pb-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-bold">Missões</h1>
        <p className="text-xs text-muted-foreground">Complete para ganhar XP</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 rounded-xl p-3 bg-card border border-border/60">
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-accent">{completedToday}/{dailyMissions.length}</p>
          <p className="text-[10px] text-muted-foreground">Diárias</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold">0</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Sequência</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-accent">{totalXp}</p>
          <p className="text-[10px] text-muted-foreground">XP Total</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
        {([
          { key: "daily" as const, label: "Diárias", icon: Clock },
          { key: "weekly" as const, label: "Semanais", icon: Star },
          { key: "monthly" as const, label: "Mensais", icon: Trophy },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      <div className="space-y-2.5">
        {tabMissions.map(mission => {
          const Icon = mission.icon;
          return (
            <button
              key={mission.id}
              onClick={() => !mission.completed && handleCompleteMission(mission.id)}
              disabled={mission.completed}
              className={`w-full text-left rounded-xl p-4 transition-all active:scale-[0.98] ${
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
                    <p className={`text-sm font-semibold ${mission.completed ? "line-through text-muted-foreground/50" : ""}`}>
                      {mission.title}
                    </p>
                    <span className="text-xs font-bold text-accent flex items-center gap-1 ml-2 flex-shrink-0">
                      <Gift className="w-3 h-3" />
                      {mission.reward}
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
                      Completada
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {completedMission && (
        <MissionCompletedModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          missionTitle={completedMission.title}
          xpGained={completedMission.xp}
          currentXp={totalXp}
          nextLevelXp={level.nextXp}
          leveledUp={leveledUp}
          newLevel={newLevelName}
          previousLevel={previousLevelName}
        />
      )}
    </div>
  );
};

export default MobileMissoes;
