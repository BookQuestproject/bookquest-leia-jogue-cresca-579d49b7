import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/contexts/TutorialContext";
import { useNavigate, useLocation } from "react-router-dom";
import agathaImg from "@/assets/agatha-mascot.png";

const AgathaTutorial = () => {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial();

  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const retryCountRef = useRef(0);

  // Navigate to step route if needed & scroll target into view
  const highlightTarget = useCallback(() => {
    if (!currentStepData) return;

    if (currentStepData.route && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
      retryCountRef.current = 0;
      setTimeout(highlightTarget, 300);
      return;
    }

    const el = document.querySelector(currentStepData.target);
    if (!el) {
      retryCountRef.current += 1;
      if (retryCountRef.current < 10) {
        setTimeout(highlightTarget, 250);
        return;
      }
      retryCountRef.current = 0;
      nextStep();
      return;
    }

    retryCountRef.current = 0;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add a subtle highlight ring to the target
    el.classList.add("agatha-highlight");
    return () => el.classList.remove("agatha-highlight");
  }, [currentStepData, location.pathname, navigate, nextStep]);

  useEffect(() => {
    if (!isActive || !currentStepData) return;
    const cleanup = highlightTarget();
    return () => {
      if (cleanup) cleanup();
      // Remove highlight from all elements when step changes
      document.querySelectorAll(".agatha-highlight").forEach((el) =>
        el.classList.remove("agatha-highlight")
      );
    };
  }, [isActive, currentStep, highlightTarget, currentStepData]);

  // Animate in sequence: mascot slides up, then bubble appears
  useEffect(() => {
    if (isActive) {
      const t1 = setTimeout(() => setIsVisible(true), 100);
      const t2 = setTimeout(() => setBubbleVisible(true), 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setBubbleVisible(false);
      setIsVisible(false);
    }
  }, [isActive, currentStep]);

  if (!isActive || !currentStepData) return null;

  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <>
      {/* Highlight ring style */}
      <style>{`
        .agatha-highlight {
          position: relative;
          z-index: 10;
          box-shadow: 0 0 0 4px hsl(var(--accent) / 0.6), 0 0 20px hsl(var(--accent) / 0.3);
          border-radius: 12px;
          transition: box-shadow 0.4s ease;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-background/60 transition-opacity duration-500"
        style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Agatha container - bottom right */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex items-end gap-3 sm:bottom-6 sm:right-6"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(120%)",
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Speech bubble */}
        <div
          className="max-w-xs sm:max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl relative"
          style={{
            opacity: bubbleVisible ? 1 : 0,
            transform: bubbleVisible ? "scale(1)" : "scale(0.9)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            transformOrigin: "bottom right",
          }}
        >
          {/* Bubble tail */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border rotate-45" />

          {/* Step dots */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-5 bg-accent"
                      : i < currentStep
                      ? "w-2 bg-accent/50"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={skipTutorial}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Pular tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <h4 className="text-base font-semibold text-foreground mb-1.5">
            {currentStepData.title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {currentStepData.description}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTutorial}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tutorial
            </button>
            <Button
              size="sm"
              onClick={nextStep}
              className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLastStep ? (
                "Vamos lá! 🚀"
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Agatha mascot */}
        <div className="flex-shrink-0 w-24 h-28 sm:w-28 sm:h-32">
          <img
            src={agathaImg}
            alt="Agatha, mascote do BookQuest"
            className="w-full h-full object-contain drop-shadow-lg"
            style={{
              animation: isVisible ? "agatha-bounce 2s ease-in-out infinite" : "none",
            }}
          />
        </div>
      </div>

      {/* Bounce keyframes */}
      <style>{`
        @keyframes agatha-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default AgathaTutorial;
