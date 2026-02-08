import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

export interface TutorialStep {
  /** CSS selector or data-tutorial attribute value */
  target: string;
  title: string;
  description: string;
  /** Which route this step belongs to (null = current route) */
  route?: string;
  /** Position of tooltip relative to target */
  placement?: "top" | "bottom" | "left" | "right";
  /** Only show for admins */
  adminOnly?: boolean;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TutorialStep | null;
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  isCompleted: boolean;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

const TUTORIAL_COMPLETED_KEY = "bookquest_spotlight_tutorial_done";

/** All tutorial steps across the site */
const allSteps: TutorialStep[] = [
  // --- Navigation ---
  {
    target: '[data-tutorial="sidebar-nav"]',
    title: "Navegação Principal",
    description: "Use o menu lateral para acessar todas as seções do BookQuest: trilhas, missões, ranking e muito mais.",
    route: "/",
    placement: "right",
  },
  {
    target: '[data-tutorial="premium-cta"]',
    title: "Plano Premium",
    description: "Assine o Premium para desbloquear Mentoria Literária, Book Club e conteúdos ENEM com acompanhamento semanal.",
    route: "/",
    placement: "right",
  },
  {
    target: '[data-tutorial="user-stats"]',
    title: "Seu Perfil Rápido",
    description: "Aqui você vê sua sequência de leitura (streak) e seu ranking atual de forma rápida.",
    route: "/",
    placement: "right",
  },
  // --- Home ---
  {
    target: '[data-tutorial="current-trail"]',
    title: "Trilha Atual",
    description: "Este card mostra o livro que você está lendo. Clique em 'Continuar Leitura' para retomar de onde parou.",
    route: "/",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="chapter-list"]',
    title: "Capítulos da Trilha",
    description: "Cada capítulo é uma etapa da sua jornada. Complete-os em ordem para desbloquear os próximos e responder quizzes.",
    route: "/",
    placement: "bottom",
  },
  {
    target: '[data-tutorial="ranking-card"]',
    title: "Ranking Literário",
    description: "Suba de patamar lendo mais livros: de Bronze a Lendário. Veja aqui o que falta para o próximo nível.",
    route: "/",
    placement: "left",
  },
  {
    target: '[data-tutorial="missions-card"]',
    title: "Missões Diárias",
    description: "Complete missões todos os dias para ganhar pontos e manter sua sequência ativa!",
    route: "/",
    placement: "left",
  },
  // --- Biblioteca ---
  {
    target: '[data-tutorial="biblioteca-header"]',
    title: "Biblioteca",
    description: "Explore todos os livros disponíveis. Use os filtros para encontrar por gênero, formato ou tema.",
    route: "/biblioteca",
    placement: "bottom",
  },
  // --- Trilhas ---
  {
    target: '[data-tutorial="trilhas-header"]',
    title: "Trilhas Literárias",
    description: "Cada livro vira uma trilha com capítulos, cronômetro e quizzes. Leia no seu ritmo e acompanhe seu progresso.",
    route: "/trilhas",
    placement: "bottom",
  },
  // --- Estante ---
  {
    target: '[data-tutorial="estante-header"]',
    title: "Minha Estante",
    description: "Organize seus livros: lendo, quero ler, lido, abandonado ou favoritos. Adicione avaliações e resenhas.",
    route: "/estante",
    placement: "bottom",
  },
  // --- Missões ---
  {
    target: '[data-tutorial="missoes-header"]',
    title: "Missões",
    description: "Missões diárias e semanais que recompensam sua dedicação. Complete-as para subir no ranking!",
    route: "/missoes",
    placement: "bottom",
  },
  // --- Ranking ---
  {
    target: '[data-tutorial="ranking-header"]',
    title: "Ranking",
    description: "Compare seu progresso com outros leitores. Veja quem são os maiores leitores do BookQuest!",
    route: "/ranking",
    placement: "bottom",
  },
  // --- Mentoria ---
  {
    target: '[data-tutorial="mentoria-header"]',
    title: "Mentoria Literária",
    description: "Sessões em grupo com mentores para ajudar você a criar e manter o hábito de leitura. Recurso Premium.",
    route: "/mentoria",
    placement: "bottom",
  },
  // --- Comunidade ---
  {
    target: '[data-tutorial="comunidade-header"]',
    title: "Comunidade",
    description: "Participe de comunidades temáticas, discuta livros e faça amizades com outros leitores.",
    route: "/comunidade",
    placement: "bottom",
  },
  // --- Admin steps ---
  {
    target: '[data-tutorial="admin-panel"]',
    title: "Painel Administrativo",
    description: "Como admin, você gerencia trilhas, livros, sessões de mentoria, materiais ENEM e configurações premium.",
    route: "/admin",
    placement: "bottom",
    adminOnly: true,
  },
  {
    target: '[data-tutorial="admin-suggestions"]',
    title: "Sugestões de Livros",
    description: "Aprove ou rejeite sugestões de livros dos usuários. Preencha capítulos e resumo para criar trilhas.",
    route: "/admin",
    placement: "bottom",
    adminOnly: true,
  },
  {
    target: '[data-tutorial="admin-tracks"]',
    title: "Gestão de Trilhas",
    description: "Crie, edite e organize trilhas literárias. Defina objetivos, roteiros semanais e mentores responsáveis.",
    route: "/admin",
    placement: "bottom",
    adminOnly: true,
  },
];

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === "true";
  });

  // Filter steps: remove admin-only if not admin
  const availableSteps = allSteps.filter(s => !s.adminOnly || isAdmin);

  // Filter to steps relevant to current route (or steps without route restriction)
  const currentRouteSteps = isActive ? availableSteps : [];

  // Auto-start on first visit
  useEffect(() => {
    if (!isCompleted && location.pathname === "/") {
      const timer = setTimeout(() => setIsActive(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, location.pathname]);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stopTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const markCompleted = useCallback(() => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
    setIsCompleted(true);
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < availableSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      markCompleted();
    }
  }, [currentStep, availableSteps.length, markCompleted]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  const currentStepData = isActive ? availableSteps[currentStep] ?? null : null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: availableSteps.length,
        currentStepData,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        skipTutorial: markCompleted,
        isCompleted,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
};
