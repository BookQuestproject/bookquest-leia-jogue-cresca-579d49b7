import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/contexts/TutorialContext";
import { useNavigate, useLocation } from "react-router-dom";
import agathaMascot from "@/assets/agatha-mascot.png";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

const SpotlightOverlay = () => {
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
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isDelayLocked, setIsDelayLocked] = useState(false);
  const retryCountRef = useRef(0);

  // Handle minDelay lock per step
  useEffect(() => {
    if (!currentStepData?.minDelay) {
      setIsDelayLocked(false);
      return;
    }
    setIsDelayLocked(true);
    const t = setTimeout(() => setIsDelayLocked(false), currentStepData.minDelay);
    return () => clearTimeout(t);
  }, [currentStep, currentStepData]);

  // Handle mount/unmount with exit animation
  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 700);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  const findAndHighlight = useCallback(() => {
    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStepData.target);
    if (!el) {
      if (currentStepData.route && location.pathname !== currentStepData.route) {
        navigate(currentStepData.route);
        retryCountRef.current = 0;
        setTimeout(findAndHighlight, 200);
        return;
      }
      retryCountRef.current += 1;
      if (retryCountRef.current < 20) {
        setTimeout(findAndHighlight, 300);
        return;
      }
      retryCountRef.current = 0;
      nextStep();
      return;
    }

    retryCountRef.current = 0;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const updatePosition = () => {
      const rect = el.getBoundingClientRect();
      const newRect: Rect = {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };
      setTargetRect(newRect);

      // Tooltip positioned above Agatha (bottom-right speech bubble)
      const tooltipW = 340;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const agathaPosRight = 16;
      const agathaWidth = 160;
      const agathaCenterX = vw - agathaPosRight - agathaWidth / 2;

      let style: React.CSSProperties = {
        position: "fixed",
        width: tooltipW,
        zIndex: 10002,
        // Position above Agatha
        bottom: 200,
        left: Math.max(8, Math.min(agathaCenterX - tooltipW / 2, vw - tooltipW - 8)),
      };

      setTooltipStyle(style);
    };

    updatePosition();
    setTimeout(updatePosition, 150);
  }, [currentStepData, location.pathname, navigate, nextStep]);

  useEffect(() => {
    if (!isActive || !currentStepData) return;
    if (currentStepData.route && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
      const timer = setTimeout(findAndHighlight, 200);
      return () => clearTimeout(timer);
    } else {
      findAndHighlight();
    }
  }, [isActive, currentStep, currentStepData, location.pathname, navigate, findAndHighlight]);

  useEffect(() => {
    if (!isActive) return;
    const handler = () => findAndHighlight();
    window.addEventListener("resize", handler);
    const scrollHandler = () => {
      if (!currentStepData) return;
      const el = document.querySelector(currentStepData.target);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      });
    };
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [isActive, findAndHighlight, currentStepData]);

  if (!shouldRender) return null;

  const showContent = isVisible && targetRect;
  const showOverlay = isVisible && targetRect;

  return (
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with cutout */}
      <svg
        className="fixed inset-0 w-full h-full"
        style={{
          opacity: showOverlay ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: showOverlay ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="hsl(var(--background) / 0.82)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="fixed rounded-xl border-2 border-accent shadow-[0_0_24px_hsl(var(--accent)/0.4)] pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            opacity: showOverlay ? 1 : 0,
            transition: "all 0.5s ease, opacity 0.4s ease",
          }}
        />
      )}

      {/* Speech bubble tooltip — positioned above Agatha */}
      <div
        className="bg-card border border-accent/30 rounded-2xl shadow-2xl p-5 relative"
        style={{
          ...tooltipStyle,
          pointerEvents: showContent ? "auto" : "none",
          opacity: showContent ? 1 : 0,
          transform: showContent ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Speech bubble tail pointing down toward Agatha */}
        <div
          className="absolute -bottom-3 right-16 w-6 h-6 bg-card border-b border-r border-accent/30 rotate-45"
          style={{ zIndex: -1 }}
        />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 overflow-hidden flex-1 mr-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === currentStep
                    ? "w-4 bg-accent"
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
            title="Pular tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentStepData && (
          <>
            <h4 className="text-base font-serif font-semibold mb-1.5 text-accent">
              {currentStepData.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {currentStepData.description}
            </p>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={prevStep} className="gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </Button>
            )}
            <Button
              size="sm"
              onClick={nextStep}
              disabled={isDelayLocked}
              className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep < totalSteps - 1 ? (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                "Concluir! 🎉"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Agatha mascot — bottom right with proper exit animation */}
      <img
        src={agathaMascot}
        alt="Agatha, guia do tutorial"
        className="fixed bottom-0 right-4 z-[10003] pointer-events-none select-none"
        style={{
          width: 160,
          height: "auto",
          transform: showOverlay ? "translateY(0)" : "translateY(110%)",
          opacity: showOverlay ? 1 : 0,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease",
        }}
      />
    </div>
  );
};

export default SpotlightOverlay;
