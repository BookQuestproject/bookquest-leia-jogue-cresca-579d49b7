import { BookOpen, Clock, Flame, Trophy, Target, Star, Award, Crown } from "lucide-react";

export type MissionCategory = "habit" | "challenge" | "milestone";
export type ReaderLevel = "beginner" | "intermediate" | "advanced";

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

/* ── Level-scaled mission configs ── */
interface LevelConfig {
  goal: number;
  essenciaValue: number;
  description: string;
}

const habitConfigs: Record<string, Record<ReaderLevel, LevelConfig>> = {
  "habit-read-chapter": {
    beginner:     { goal: 1, essenciaValue: 15, description: "Complete a leitura de 1 capítulo hoje" },
    intermediate: { goal: 2, essenciaValue: 20, description: "Complete a leitura de 2 capítulos hoje" },
    advanced:     { goal: 3, essenciaValue: 30, description: "Complete a leitura de 3 capítulos hoje" },
  },
  "habit-read-15min": {
    beginner:     { goal: 10, essenciaValue: 10, description: "Acumule 10 minutos de leitura hoje" },
    intermediate: { goal: 20, essenciaValue: 15, description: "Acumule 20 minutos de leitura hoje" },
    advanced:     { goal: 30, essenciaValue: 25, description: "Acumule 30 minutos de leitura hoje" },
  },
  "habit-post-reading": {
    beginner:     { goal: 1, essenciaValue: 20, description: "Responda as perguntas após um capítulo" },
    intermediate: { goal: 1, essenciaValue: 25, description: "Responda as perguntas após um capítulo" },
    advanced:     { goal: 2, essenciaValue: 35, description: "Responda reflexões de 2 capítulos hoje" },
  },
};

const challengeConfigs: Record<string, Record<ReaderLevel, LevelConfig>> = {
  "challenge-5-chapters": {
    beginner:     { goal: 3, essenciaValue: 50, description: "Complete 3 capítulos em 7 dias" },
    intermediate: { goal: 5, essenciaValue: 75, description: "Complete 5 capítulos em 7 dias" },
    advanced:     { goal: 8, essenciaValue: 120, description: "Complete 8 capítulos em 7 dias" },
  },
  "challenge-7-streak": {
    beginner:     { goal: 3, essenciaValue: 60, description: "Leia por 3 dias seguidos esta semana" },
    intermediate: { goal: 5, essenciaValue: 100, description: "Leia por 5 dias seguidos esta semana" },
    advanced:     { goal: 7, essenciaValue: 150, description: "Leia todos os dias por uma semana" },
  },
  "challenge-finish-book": {
    beginner:     { goal: 5, essenciaValue: 80, description: "Leia 5 capítulos de qualquer trilha esta semana" },
    intermediate: { goal: 8, essenciaValue: 150, description: "Leia 8 capítulos de qualquer trilha esta semana" },
    advanced:     { goal: 1, essenciaValue: 200, description: "Finalize um livro completo esta semana" },
  },
};

const milestoneConfigs: Record<string, Record<ReaderLevel, LevelConfig>> = {
  "milestone-streak": {
    beginner:     { goal: 7, essenciaValue: 150, description: "Mantenha uma sequência de 7 dias neste mês" },
    intermediate: { goal: 15, essenciaValue: 300, description: "Mantenha uma sequência de 15 dias neste mês" },
    advanced:     { goal: 25, essenciaValue: 500, description: "Mantenha uma sequência de 25 dias neste mês" },
  },
  "milestone-chapters": {
    beginner:     { goal: 15, essenciaValue: 200, description: "Leia 15 capítulos neste mês" },
    intermediate: { goal: 30, essenciaValue: 400, description: "Leia 30 capítulos neste mês" },
    advanced:     { goal: 50, essenciaValue: 600, description: "Leia 50 capítulos neste mês" },
  },
  "milestone-books": {
    beginner:     { goal: 1, essenciaValue: 300, description: "Conclua 1 livro neste mês" },
    intermediate: { goal: 2, essenciaValue: 500, description: "Conclua 2 livros neste mês" },
    advanced:     { goal: 3, essenciaValue: 800, description: "Conclua 3 livros neste mês" },
  },
};

/* ── Mission generators by level ── */
function buildHabits(level: ReaderLevel): Mission[] {
  return [
    { id: "habit-read-chapter", title: level === "advanced" ? "Ler 3 capítulos" : level === "intermediate" ? "Ler 2 capítulos" : "Ler 1 capítulo", icon: BookOpen, progress: 0, category: "habit", completed: false, autoComplete: true, permanent: false, ...habitConfigs["habit-read-chapter"][level] },
    { id: "habit-read-15min", title: level === "advanced" ? "Ler 30 minutos" : level === "intermediate" ? "Ler 20 minutos" : "Ler 10 minutos", icon: Clock, progress: 0, category: "habit", completed: false, autoComplete: true, permanent: false, ...habitConfigs["habit-read-15min"][level] },
    { id: "habit-post-reading", title: level === "advanced" ? "2 reflexões pós-leitura" : "Reflexão pós-leitura", icon: Target, progress: 0, category: "habit", completed: false, autoComplete: true, permanent: false, ...habitConfigs["habit-post-reading"][level] },
  ];
}

function buildChallenges(level: ReaderLevel): Mission[] {
  const c = challengeConfigs;
  return [
    { id: "challenge-5-chapters", title: `Ler ${c["challenge-5-chapters"][level].goal} capítulos na semana`, icon: Star, progress: 0, category: "challenge", completed: false, autoComplete: true, permanent: false, ...c["challenge-5-chapters"][level] },
    { id: "challenge-7-streak", title: `${c["challenge-7-streak"][level].goal} dias seguidos`, icon: Flame, progress: 0, category: "challenge", completed: false, autoComplete: true, permanent: false, ...c["challenge-7-streak"][level] },
    { id: "challenge-finish-book", title: level === "advanced" ? "Finalizar 1 livro na semana" : `Ler ${c["challenge-finish-book"][level].goal} capítulos na semana`, icon: Trophy, progress: 0, category: "challenge", completed: false, autoComplete: true, permanent: false, ...c["challenge-finish-book"][level] },
  ];
}

function buildMilestones(level: ReaderLevel): Mission[] {
  const m = milestoneConfigs;
  return [
    { id: "milestone-streak", title: `${m["milestone-streak"][level].goal} dias de sequência no mês`, icon: Flame, progress: 0, category: "milestone", completed: false, autoComplete: true, permanent: false, ...m["milestone-streak"][level] },
    { id: "milestone-chapters", title: `${m["milestone-chapters"][level].goal} capítulos no mês`, icon: Award, progress: 0, category: "milestone", completed: false, autoComplete: true, permanent: false, ...m["milestone-chapters"][level] },
    { id: "milestone-books", title: `${m["milestone-books"][level].goal} livro${m["milestone-books"][level].goal > 1 ? "s" : ""} no mês`, icon: Crown, progress: 0, category: "milestone", completed: false, autoComplete: true, permanent: false, ...m["milestone-books"][level] },
  ];
}

/** Map quiz reading_level to our ReaderLevel */
export function getReaderLevel(literaryProfile: any): ReaderLevel {
  if (!literaryProfile) return "beginner";
  const lvl = literaryProfile?.reading_level || literaryProfile?.readingLevel || "";
  const normalized = String(lvl).toLowerCase();
  if (normalized.includes("avanç") || normalized.includes("advanced") || normalized.includes("expert")) return "advanced";
  if (normalized.includes("intermedi") || normalized.includes("intermediate") || normalized.includes("regular")) return "intermediate";
  return "beginner";
}

export function getMissionsForLevel(level: ReaderLevel) {
  const habits = buildHabits(level);
  const challenges = buildChallenges(level);
  const milestones = buildMilestones(level);
  return { habits, challenges, milestones, all: [...habits, ...challenges, ...milestones] };
}

/* ── Default exports (beginner fallback) ── */
export const HABIT_MISSIONS = buildHabits("beginner");
export const CHALLENGE_MISSIONS = buildChallenges("beginner");
export const MILESTONE_MISSIONS = buildMilestones("beginner");
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
