import { Target, CheckCircle, Clock, Flame, Trophy, Star, Gift, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProgressBar from "@/components/ProgressBar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Mission {
  id: number;
  title: string;
  description: string;
  icon: typeof Target;
  progress: number;
  goal: number;
  reward: string;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
  howToComplete: string;
}

// Todas as missões são verificáveis automaticamente pelo sistema
const missions: Mission[] = [
  // Daily
  { 
    id: 1, 
    title: "Responder pergunta de capítulo", 
    description: "Responda uma pergunta de qualquer capítulo", 
    icon: Target, 
    progress: 0, 
    goal: 1, 
    reward: "+10 pts", 
    type: "daily", 
    completed: false,
    howToComplete: "Clique em 'Continuar Leitura' e responda a pergunta do capítulo atual."
  },
  { 
    id: 2, 
    title: "Fazer login hoje", 
    description: "Acesse o BookQuest", 
    icon: CheckCircle, 
    progress: 1, 
    goal: 1, 
    reward: "+5 pts", 
    type: "daily", 
    completed: true,
    howToComplete: "Detectado automaticamente ao acessar o site."
  },
  { 
    id: 3, 
    title: "Completar quiz literário", 
    description: "Responda o quiz de perfil literário", 
    icon: Star, 
    progress: 0, 
    goal: 1, 
    reward: "+25 pts", 
    type: "daily", 
    completed: false,
    howToComplete: "Acesse o Quiz Literário no menu lateral e complete todas as perguntas."
  },
  
  // Weekly
  { 
    id: 5, 
    title: "Completar 5 unidades de trilha", 
    description: "Responda 5 perguntas de capítulos", 
    icon: Target, 
    progress: 0, 
    goal: 5, 
    reward: "+50 pts", 
    type: "weekly", 
    completed: false,
    howToComplete: "Responda corretamente 5 perguntas de capítulos em qualquer trilha."
  },
  { 
    id: 6, 
    title: "Sequência de 7 dias", 
    description: "Faça login por 7 dias seguidos", 
    icon: Flame, 
    progress: 0, 
    goal: 7, 
    reward: "+100 pts", 
    type: "weekly", 
    completed: false,
    howToComplete: "Acesse o BookQuest todos os dias por uma semana."
  },
  
  // Monthly
  { 
    id: 8, 
    title: "Marcar livro como concluído", 
    description: "Complete todas as unidades de uma trilha", 
    icon: Trophy, 
    progress: 0, 
    goal: 1, 
    reward: "+200 pts", 
    type: "monthly", 
    completed: false,
    howToComplete: "Complete todas as perguntas de uma trilha e clique em 'Marcar como Concluído'."
  },
  { 
    id: 9, 
    title: "Responder 20 perguntas", 
    description: "Complete 20 unidades de trilha", 
    icon: Target, 
    progress: 0, 
    goal: 20, 
    reward: "+150 pts", 
    type: "monthly", 
    completed: false,
    howToComplete: "Responda corretamente 20 perguntas em qualquer trilha."
  },
];

const Missoes = () => {
  const dailyMissions = missions.filter(m => m.type === "daily");
  const weeklyMissions = missions.filter(m => m.type === "weekly");
  const monthlyMissions = missions.filter(m => m.type === "monthly");

  const completedToday = dailyMissions.filter(m => m.completed).length;
  const totalDaily = dailyMissions.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 section-bg-missions">
        {/* Header */}
        <header className="mb-10 animate-fade-in" data-tutorial="missoes-header">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Suas Tarefas</p>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Missões</h1>
              <p className="text-muted-foreground">
                Complete missões para ganhar pontos e subir no ranking
              </p>
            </div>
            <div className="editorial-card p-4 flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-secondary">{completedToday}/{totalDaily}</p>
                <p className="text-xs text-muted-foreground">Diárias</p>
              </div>
              <div className="w-px h-10 bg-border/60" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold">0 dias</p>
                  <p className="text-xs text-muted-foreground">sequência</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Info */}
        <div className="editorial-card p-4 mb-8 border-l-4 border-secondary animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm mb-1">Como funcionam as missões?</p>
              <p className="text-sm text-muted-foreground">
                Todas as missões são verificadas automaticamente. Ao completar uma ação, o progresso é atualizado.
              </p>
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <section className="mb-10 animate-fade-in" data-tutorial="missoes-daily" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-secondary" />
            <h2 className="font-serif text-xl font-semibold">Missões Diárias</h2>
            <span className="text-sm text-muted-foreground ml-2">Reiniciam à meia-noite</span>
          </div>
          <div className="space-y-3">
            {dailyMissions.map((mission, index) => (
              <MissionCard key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </section>

        {/* Weekly Missions */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-xl font-semibold">Missões Semanais</h2>
            <span className="text-sm text-muted-foreground ml-2">Reiniciam toda segunda</span>
          </div>
          <div className="space-y-3">
            {weeklyMissions.map((mission, index) => (
              <MissionCard key={mission.id} mission={mission} index={index} />
            ))}
          </div>
        </section>

        {/* Monthly Missions */}
        <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-xl font-semibold">Missões Mensais</h2>
            <span className="text-sm text-muted-foreground ml-2">Reiniciam dia 1</span>
          </div>
          <div className="space-y-3">
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
  const Icon = mission.icon;
  
  return (
    <div 
      className={`editorial-card p-4 ${
        mission.completed ? "border-l-4 border-accent bg-accent/5" : ""
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded hover:bg-muted transition-colors">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{mission.howToComplete}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-semibold text-accent flex items-center gap-1">
              <Gift className="w-3 h-3" />
              {mission.reward}
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
              Completada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Missoes;