import { Target, CheckCircle, Clock, Flame, Trophy, Star, Gift, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
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
  icon: string;
  progress: number;
  goal: number;
  reward: string;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
  verifiable: boolean;
  howToComplete: string;
}

// Todas as missões são verificáveis automaticamente pelo sistema
const missions: Mission[] = [
  // Daily - Ações verificáveis
  { 
    id: 1, 
    title: "Responder pergunta de capítulo", 
    description: "Responda uma pergunta de qualquer capítulo", 
    icon: "📖", 
    progress: 0, 
    goal: 1, 
    reward: "+10 pts", 
    type: "daily", 
    completed: false,
    verifiable: true,
    howToComplete: "Clique em 'Continuar Leitura' e responda a pergunta do capítulo atual."
  },
  { 
    id: 2, 
    title: "Fazer login hoje", 
    description: "Acesse o BookQuest", 
    icon: "🔥", 
    progress: 1, 
    goal: 1, 
    reward: "+5 pts", 
    type: "daily", 
    completed: true,
    verifiable: true,
    howToComplete: "Detectado automaticamente ao acessar o site."
  },
  { 
    id: 3, 
    title: "Completar quiz literário", 
    description: "Responda o quiz de perfil literário", 
    icon: "🧠", 
    progress: 0, 
    goal: 1, 
    reward: "+25 pts", 
    type: "daily", 
    completed: false,
    verifiable: true,
    howToComplete: "Acesse o Quiz Literário no menu lateral e complete todas as perguntas."
  },
  { 
    id: 4, 
    title: "Interagir na comunidade", 
    description: "Curta ou comente em um post", 
    icon: "💬", 
    progress: 0, 
    goal: 1, 
    reward: "+5 pts", 
    type: "daily", 
    completed: false,
    verifiable: true,
    howToComplete: "Acesse uma comunidade de livro e curta ou comente em qualquer post."
  },
  
  // Weekly - Ações verificáveis
  { 
    id: 5, 
    title: "Completar 5 unidades de trilha", 
    description: "Responda 5 perguntas de capítulos", 
    icon: "📚", 
    progress: 0, 
    goal: 5, 
    reward: "+50 pts", 
    type: "weekly", 
    completed: false,
    verifiable: true,
    howToComplete: "Responda corretamente 5 perguntas de capítulos em qualquer trilha."
  },
  { 
    id: 6, 
    title: "Sequência de 7 dias", 
    description: "Faça login por 7 dias seguidos", 
    icon: "⚡", 
    progress: 0, 
    goal: 7, 
    reward: "+100 pts", 
    type: "weekly", 
    completed: false,
    verifiable: true,
    howToComplete: "Acesse o BookQuest todos os dias por uma semana."
  },
  { 
    id: 7, 
    title: "Escrever uma resenha", 
    description: "Avalie um livro na sua estante", 
    icon: "✍️", 
    progress: 0, 
    goal: 1, 
    reward: "+75 pts", 
    type: "weekly", 
    completed: false,
    verifiable: true,
    howToComplete: "Vá em Minha Estante, clique em um livro e escreva uma resenha."
  },
  
  // Monthly - Ações verificáveis
  { 
    id: 8, 
    title: "Marcar livro como concluído", 
    description: "Complete todas as unidades de uma trilha e marque como lido", 
    icon: "🏆", 
    progress: 0, 
    goal: 1, 
    reward: "+200 pts", 
    type: "monthly", 
    completed: false,
    verifiable: true,
    howToComplete: "Complete todas as perguntas de uma trilha e clique em 'Marcar como Concluído'."
  },
  { 
    id: 9, 
    title: "Responder 20 perguntas de capítulos", 
    description: "Complete 20 unidades de trilha", 
    icon: "📕", 
    progress: 0, 
    goal: 20, 
    reward: "+150 pts", 
    type: "monthly", 
    completed: false,
    verifiable: true,
    howToComplete: "Responda corretamente 20 perguntas em qualquer trilha."
  },
  { 
    id: 10, 
    title: "Escrever 3 resenhas", 
    description: "Avalie 3 livros diferentes", 
    icon: "✍️", 
    progress: 0, 
    goal: 3, 
    reward: "+100 pts", 
    type: "monthly", 
    completed: false,
    verifiable: true,
    howToComplete: "Vá em Minha Estante e escreva resenhas para 3 livros diferentes."
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
                <p className="font-bold">0 dias</p>
                <p className="text-xs text-muted-foreground">de sequência</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="glass-card rounded-xl p-4 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Como funcionam as missões?</p>
              <p className="text-sm text-muted-foreground">
                Todas as missões são verificadas automaticamente pelo sistema. 
                Ao completar uma ação (como responder uma pergunta ou escrever uma resenha), 
                o progresso é atualizado automaticamente.
              </p>
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
            <div className="flex items-center gap-2">
              <h3 className={`font-bold ${mission.completed ? "line-through text-muted-foreground" : ""}`}>
                {mission.title}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-0.5 rounded-full hover:bg-secondary transition-colors">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">{mission.howToComplete}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
