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

/** Tutorial steps — only for the Home page. Other pages use CategoryIntro. */
const allSteps: TutorialStep[] = [
  // --- Welcome ---
  {
    target: '[data-tutorial="welcome-header"]',
    title: "Bem-vindo ao BookQuest! 🎉",
    description: "Esta é sua página inicial. Aqui você acompanha sua jornada de leitura, trilhas, ranking e missões.",
    route: "/",
    placement: "bottom",
  },
  // --- Sidebar navigation ---
  {
    target: '[data-tutorial="sidebar-nav"]',
    title: "Navegação Principal",
    description: "Use o menu lateral para acessar todas as seções: trilhas, missões, ranking, comunidades e muito mais.",
    route: "/",
    placement: "right",
  },
  // --- Premium CTA ---
  {
    target: '[data-tutorial="premium-cta"]',
    title: "Plano Premium",
    description: "Assine o Premium para desbloquear Mentoria Literária, Book Club e conteúdos ENEM com acompanhamento semanal.",
    route: "/",
    placement: "right",
  },
  // --- Trail card (auto-skips if no active trail) ---
  {
    target: '[data-tutorial="current-trail"]',
    title: "Trilha Atual",
    description: "Este card mostra o livro que você está lendo. Clique em 'Continuar Leitura' para retomar de onde parou.",
    route: "/",
    placement: "bottom",
  },
  // --- Ranking card on Home sidebar ---
  {
    target: '[data-tutorial="ranking-card"]',
    title: "Ranking Literário",
    description: "Suba de patamar lendo mais livros: de Bronze a Lendário. Veja aqui o que falta para o próximo nível.",
    route: "/",
    placement: "left",
  },
  // --- Streak card ---
  {
    target: '[data-tutorial="streak-card"]',
    title: "Sequência de Leitura 🔥",
    description: "Aqui você vê sua sequência de leitura (streak). Leia todos os dias para manter a chama acesa!",
    route: "/",
    placement: "left",
  },
  // --- Daily missions on Home ---
  {
    target: '[data-tutorial="missions-card"]',
    title: "Missões Diárias",
    description: "Complete missões todos os dias para ganhar pontos e manter sua sequência ativa!",
    route: "/",
    placement: "left",
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

  // Re-check localStorage when navigating (handles reset after quiz)
  useEffect(() => {
    const stored = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === "true";
    if (isCompleted !== stored) {
      setIsCompleted(stored);
    }
  }, [location.pathname]);

  // Filter steps: remove admin-only if not admin
  const availableSteps = allSteps.filter(s => !s.adminOnly || isAdmin);

  // Filter to steps relevant to current route (or steps without route restriction)
  const currentRouteSteps = isActive ? availableSteps : [];

  // Auto-start on first visit to home
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
