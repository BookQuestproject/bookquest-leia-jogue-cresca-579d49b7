import { BookOpen, Clock, Flame, Trophy, Target, Star, Award, Crown } from "lucide-react";

export type MissionCategory = "habit" | "challenge" | "milestone";

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  progress: number;
  goal: number;
  essenciaValue: number;
  category: MissionCategory;
  completed: boolean;
  autoComplete: boolean;
  permanent: boolean;
}

export const HABIT_MISSIONS: Mission[] = [
  {
    id: "habit-read-chapter",
    title: "Ler 1 capítulo",
    description: "Complete a leitura de um capítulo hoje",
    icon: BookOpen,
    progress: 0,
    goal: 1,
    essenciaValue: 15,
    category: "habit",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
  {
    id: "habit-read-15min",
    title: "Ler 15 minutos",
    description: "Acumule 15 minutos de leitura hoje",
    icon: Clock,
    progress: 0,
    goal: 15,
    essenciaValue: 10,
    category: "habit",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
  {
    id: "habit-post-reading",
    title: "Reflexão pós-leitura",
    description: "Responda as perguntas após um capítulo",
    icon: Target,
    progress: 0,
    goal: 1,
    essenciaValue: 20,
    category: "habit",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
];

export const CHALLENGE_MISSIONS: Mission[] = [
  {
    id: "challenge-5-chapters",
    title: "Ler 5 capítulos na semana",
    description: "Complete 5 capítulos em 7 dias",
    icon: Star,
    progress: 2,
    goal: 5,
    essenciaValue: 75,
    category: "challenge",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
  {
    id: "challenge-7-streak",
    title: "Manter 7 dias seguidos",
    description: "Leia todos os dias por uma semana",
    icon: Flame,
    progress: 3,
    goal: 7,
    essenciaValue: 120,
    category: "challenge",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
  {
    id: "challenge-finish-book",
    title: "Finalizar 1 livro no mês",
    description: "Complete todas as unidades de uma trilha",
    icon: Trophy,
    progress: 0,
    goal: 1,
    essenciaValue: 200,
    category: "challenge",
    completed: false,
    autoComplete: true,
    permanent: false,
  },
];

export const MILESTONE_MISSIONS: Mission[] = [
  {
    id: "milestone-30-streak",
    title: "30 dias de sequência",
    description: "Um mês inteiro de leitura constante",
    icon: Flame,
    progress: 3,
    goal: 30,
    essenciaValue: 500,
    category: "milestone",
    completed: false,
    autoComplete: true,
    permanent: true,
  },
  {
    id: "milestone-100-chapters",
    title: "100 capítulos lidos",
    description: "Centenário literário desbloqueado",
    icon: Award,
    progress: 12,
    goal: 100,
    essenciaValue: 800,
    category: "milestone",
    completed: false,
    autoComplete: true,
    permanent: true,
  },
  {
    id: "milestone-10-books",
    title: "10 livros concluídos",
    description: "Uma estante de conquistas",
    icon: Crown,
    progress: 1,
    goal: 10,
    essenciaValue: 1000,
    category: "milestone",
    completed: false,
    autoComplete: true,
    permanent: true,
  },
];

export const ALL_MISSIONS = [...HABIT_MISSIONS, ...CHALLENGE_MISSIONS, ...MILESTONE_MISSIONS];

export const LEVELS = [
  { name: "Iniciante", essencia: 0 },
  { name: "Explorador", essencia: 100 },
  { name: "Aventureiro", essencia: 300 },
  { name: "Mestre Leitor", essencia: 600 },
  { name: "Lenda Literária", essencia: 1000 },
];

export const getLevel = (essencia: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (essencia >= LEVELS[i].essencia) {
      const nextLevel = LEVELS[i + 1];
      return {
        current: LEVELS[i].name,
        nextEssencia: nextLevel ? nextLevel.essencia : LEVELS[i].essencia,
        next: nextLevel ? nextLevel.name : null,
      };
    }
  }
  return { current: LEVELS[0].name, nextEssencia: LEVELS[1].essencia, next: LEVELS[1].name };
};
