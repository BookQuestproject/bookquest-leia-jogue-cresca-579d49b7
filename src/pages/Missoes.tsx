import { Target, CheckCircle, Clock, Flame, Trophy, Star, Gift } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

interface Mission {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  goal: number;
  reward: string;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
}

const missions: Mission[] = [
  // Daily
  { id: 1, title: "Ler 1 capítulo", description: "Leia pelo menos um capítulo hoje", icon: "📖", progress: 0, goal: 1, reward: "+10 pts", type: "daily", completed: false },
  { id: 2, title: "Manter sequência", description: "Continue lendo todos os dias", icon: "🔥", progress: 1, goal: 1, reward: "+5 pts", type: "daily", completed: true },
  { id: 3, title: "Completar quiz", description: "Responda um quiz literário", icon: "🧠", progress: 0, goal: 1, reward: "+25 pts", type: "daily", completed: false },
  { id: 4, title: "Interagir na comunidade", description: "Comente ou curta um post", icon: "💬", progress: 0, goal: 1, reward: "+5 pts", type: "daily", completed: false },
  
  // Weekly
  { id: 5, title: "Ler 5 capítulos", description: "Leia 5 capítulos esta semana", icon: "📚", progress: 2, goal: 5, reward: "+50 pts", type: "weekly", completed: false },
  { id: 6, title: "Sequência de 7 dias", description: "Leia por 7 dias seguidos", icon: "⚡", progress: 3, goal: 7, reward: "+100 pts", type: "weekly", completed: false },
  { id: 7, title: "Completar trilha", description: "Finalize uma etapa de trilha", icon: "🎯", progress: 0, goal: 1, reward: "+75 pts", type: "weekly", completed: false },
  
  // Monthly
  { id: 8, title: "Finalizar 1 livro", description: "Complete a leitura de um livro inteiro", icon: "🏆", progress: 0, goal: 1, reward: "+200 pts", type: "monthly", completed: false },
  { id: 9, title: "Ler 20 capítulos", description: "Leia 20 capítulos este mês", icon: "📕", progress: 5, goal: 20, reward: "+150 pts", type: "monthly", completed: false },
  { id: 10, title: "Escrever 3 resenhas", description: "Avalie livros na sua estante", icon: "✍️", progress: 1, goal: 3, reward: "+100 pts", type: "monthly", completed: false },
];

const Missoes = () => {
  const dailyMissions = missions.filter(m => m.type === "daily");
  const weeklyMissions = missions.filter(m => m.type === "weekly");
  const monthlyMissions = missions.filter(m => m.type === "monthly");

  const completedToday = dailyMissions.filter(m => m.completed).length;
  const totalDaily = dailyMissions.length;

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Missões
            </h1>
            <p className="text-muted-foreground">
              Complete missões para ganhar pontos e subir no ranking
            </p>
          </div>
          <div className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{completedToday}/{totalDaily}</p>
              <p className="text-xs text-muted-foreground">Missões do dia</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-accent" />
              <div>
                <p className="font-bold">3 dias</p>
                <p className="text-xs text-muted-foreground">de sequência</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Missões Diárias</h2>
            <span className="text-sm text-muted-foreground">Reiniciam à meia-noite</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {dailyMissions.map((mission, index) => (
              <MissionCard key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </section>

        {/* Weekly Missions */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Missões Semanais</h2>
            <span className="text-sm text-muted-foreground">Reiniciam toda segunda</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {weeklyMissions.map((mission, index) => (
              <MissionCard key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </section>

        {/* Monthly Missions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-bold">Missões Mensais</h2>
            <span className="text-sm text-muted-foreground">Reiniciam dia 1</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {monthlyMissions.map((mission, index) => (
              <MissionCard key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

const MissionCard = ({ mission, index }: { mission: Mission; index: number }) => {
  const progressPercent = (mission.progress / mission.goal) * 100;
  
  return (
    <div 
      className={`glass-card rounded-xl p-4 animate-fade-in ${
        mission.completed ? "border-primary/50 bg-primary/5" : ""
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          mission.completed ? "bg-primary/20" : "bg-secondary"
        }`}>
          {mission.completed ? <CheckCircle className="w-6 h-6 text-primary" /> : mission.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold ${mission.completed ? "line-through text-muted-foreground" : ""}`}>
              {mission.title}
            </h3>
            <span className="text-sm font-bold text-accent flex items-center gap-1">
              <Gift className="w-3 h-3" />
              {mission.reward}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
          
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
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <CheckCircle className="w-4 h-4" />
              Completada!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missoes;
