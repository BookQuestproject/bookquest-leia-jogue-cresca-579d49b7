import { useState, useEffect } from "react";
import { X, ArrowRight, BookOpen, Target, Trophy, Sparkles, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: string;
}

const steps: TutorialStep[] = [
  {
    icon: BookOpen,
    title: "Trilhas Literárias",
    description: "Cada livro é uma trilha com capítulos. Leia no seu ritmo, acompanhe o tempo e responda quizzes ao final de cada capítulo.",
  },
  {
    icon: Map,
    title: "Minha Estante",
    description: "Organize seus livros por categoria: lendo, quero ler, lido, abandonado e favoritos. Adicione avaliações e resenhas.",
  },
  {
    icon: Target,
    title: "Missões Diárias",
    description: "Complete missões todos os dias para ganhar pontos e manter sua sequência de leitura (streak).",
  },
  {
    icon: Trophy,
    title: "Ranking Literário",
    description: "Suba de patamar lendo mais livros: de Bronze a Lendário. Compete com leitores do seu nível!",
  },
  {
    icon: Sparkles,
    title: "Premium",
    description: "Assinantes têm acesso a Mentoria Literária, Book Club e trilhas ENEM com acompanhamento semanal.",
  },
];

const TUTORIAL_KEY = "bookquest_tutorial_completed";

const GuidedTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY);
    if (!completed) {
      // Show after a short delay to let the page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TUTORIAL_KEY, "true");
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Card */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-8 bg-secondary" : i < currentStep ? "w-4 bg-secondary/50" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
            <Icon className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-3">{step.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={handleClose}>
            Pular tutorial
          </Button>
          <Button className="flex-1 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                Próximo
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Começar!"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTutorial;
