import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/contexts/TutorialContext";
import { useNavigate, useLocation } from "react-router-dom";

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
  const retryCountRef = useRef(0);

  const findAndHighlight = useCallback(() => {
    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStepData.target);
    if (!el) {
      // Navigate if needed
      if (currentStepData.route && location.pathname !== currentStepData.route) {
        navigate(currentStepData.route);
        retryCountRef.current = 0;
        setTimeout(findAndHighlight, 600);
        return;
      }
      // Retry a few times, then auto-skip
      retryCountRef.current += 1;
      if (retryCountRef.current < 3) {
        setTimeout(findAndHighlight, 400);
        return;
      }
      // Element truly doesn't exist — auto-skip this step
      retryCountRef.current = 0;
      nextStep();
      return;
    }

    retryCountRef.current = 0;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Small delay after scroll to get correct position
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();

      const newRect: Rect = {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };
      setTargetRect(newRect);

      // Calculate tooltip position
      const placement = currentStepData.placement || "bottom";
      const tooltipW = 320;
      const tooltipH = 200;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let style: React.CSSProperties = { position: "fixed", width: tooltipW, zIndex: 10002 };

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let top = 0;
      let left = 0;

      if (placement === "bottom" && rect.bottom + 12 + tooltipH < vh) {
        top = rect.bottom + 12;
        left = centerX - tooltipW / 2;
      } else if (placement === "top" && rect.top - 12 - tooltipH > 0) {
        top = rect.top - 12 - tooltipH;
        left = centerX - tooltipW / 2;
      } else if (placement === "right" && rect.right + 12 + tooltipW < vw) {
        top = centerY - tooltipH / 2;
        left = rect.right + 12;
      } else if (placement === "left" && rect.left - 12 - tooltipW > 0) {
        top = centerY - tooltipH / 2;
        left = rect.left - 12 - tooltipW;
      } else {
        // Fallback: place below or above, or center
        if (rect.bottom + 12 + tooltipH < vh) {
          top = rect.bottom + 12;
          left = centerX - tooltipW / 2;
        } else if (rect.top - 12 - tooltipH > 0) {
          top = rect.top - 12 - tooltipH;
          left = centerX - tooltipW / 2;
        } else {
          top = vh / 2 - tooltipH / 2;
          left = vw / 2 - tooltipW / 2;
        }
      }

      style.top = Math.max(8, Math.min(top, vh - tooltipH - 8));
      style.left = Math.max(8, Math.min(left, vw - tooltipW - 8));

      setTooltipStyle(style);
    });
  }, [currentStepData, location.pathname, navigate, nextStep]);

  // Navigate to step's route if needed
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    if (currentStepData.route && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
      const timer = setTimeout(findAndHighlight, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(findAndHighlight, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, currentStepData, location.pathname, navigate, findAndHighlight]);

  // Recalculate on resize
  useEffect(() => {
    if (!isActive) return;
    const handler = () => findAndHighlight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isActive, findAndHighlight]);

  // Block scrolling while tutorial is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isActive]);

  // Animate in
  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with cutout — uses fixed viewport coords */}
      <svg
        className="fixed inset-0 w-full h-full transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0, pointerEvents: "auto" }}
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
          className="fixed rounded-xl border-2 border-secondary shadow-[0_0_24px_hsl(var(--secondary)/0.4)] transition-all duration-500 pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip card — always interactive */}
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-5 transition-all duration-500"
        style={{
          ...tooltipStyle,
          pointerEvents: "auto",
          opacity: isVisible && targetRect ? 1 : 0,
          transform: isVisible && targetRect ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 overflow-hidden flex-1 mr-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === currentStep
                    ? "w-4 bg-secondary"
                    : i < currentStep
                    ? "w-2 bg-secondary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            onClick={skipTutorial}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-base font-serif font-semibold mb-1.5">{currentStepData.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {currentStepData.description}
        </p>

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
              className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {currentStep < totalSteps - 1 ? (
                <>
                  Próximo
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                "Concluir!"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightOverlay;
