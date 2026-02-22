import { useEffect, useState, useCallback } from "react";
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

  const findAndHighlight = useCallback(() => {
    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStepData.target);
    if (!el) {
      // Element not found — maybe wrong route. Navigate if needed.
      if (currentStepData.route && location.pathname !== currentStepData.route) {
        navigate(currentStepData.route);
        // Retry after navigation
        setTimeout(findAndHighlight, 600);
        return;
      }
      // Fallback: skip this step if element truly doesn't exist
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const newRect: Rect = {
      top: rect.top + scrollTop - PADDING,
      left: rect.left + scrollLeft - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
    };
    setTargetRect(newRect);

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Calculate tooltip position clamped to viewport
    const placement = currentStepData.placement || "bottom";
    const tooltipW = 320;
    const tooltipH = 180;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let style: React.CSSProperties = { position: "fixed", width: tooltipW, zIndex: 10002 };

    // Use viewport-relative coords (fixed positioning)
    const elRect = el.getBoundingClientRect();
    const centerX = elRect.left + elRect.width / 2;
    const centerY = elRect.top + elRect.height / 2;

    // Try placement, then fallback if off-screen
    let top = 0;
    let left = 0;

    if (placement === "bottom" && elRect.bottom + 12 + tooltipH < vh) {
      top = elRect.bottom + 12;
      left = centerX - tooltipW / 2;
    } else if (placement === "top" && elRect.top - 12 - tooltipH > 0) {
      top = elRect.top - 12 - tooltipH;
      left = centerX - tooltipW / 2;
    } else if (placement === "right" && elRect.right + 12 + tooltipW < vw) {
      top = centerY - tooltipH / 2;
      left = elRect.right + 12;
    } else if (placement === "left" && elRect.left - 12 - tooltipW > 0) {
      top = centerY - tooltipH / 2;
      left = elRect.left - 12 - tooltipW;
    } else {
      // Auto: prefer bottom, then top, then center of screen
      if (elRect.bottom + 12 + tooltipH < vh) {
        top = elRect.bottom + 12;
        left = centerX - tooltipW / 2;
      } else if (elRect.top - 12 - tooltipH > 0) {
        top = elRect.top - 12 - tooltipH;
        left = centerX - tooltipW / 2;
      } else {
        top = Math.max(16, vh / 2 - tooltipH / 2);
        left = Math.max(16, vw / 2 - tooltipW / 2);
      }
    }

    // Clamp to viewport
    style.top = Math.max(8, Math.min(top, vh - tooltipH - 8));
    style.left = Math.max(8, Math.min(left, vw - tooltipW - 8));

    setTooltipStyle(style);
  }, [currentStepData, location.pathname, navigate]);

  // Navigate to step's route if needed
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    if (currentStepData.route && location.pathname !== currentStepData.route) {
      navigate(currentStepData.route);
      const timer = setTimeout(findAndHighlight, 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(findAndHighlight, 200);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStepData, location.pathname, navigate, findAndHighlight]);

  // Recalculate on resize
  useEffect(() => {
    if (!isActive) return;
    const handler = () => findAndHighlight();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [isActive, findAndHighlight]);

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
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with cutout via SVG */}
      <svg
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
          height: Math.max(document.documentElement.scrollHeight, window.innerHeight),
        }}
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
          className="absolute rounded-xl border-2 border-secondary shadow-[0_0_24px_hsl(var(--secondary)/0.4)] transition-all duration-500 pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="bg-card border border-border rounded-xl shadow-2xl p-5 transition-all duration-500"
        style={{
          ...tooltipStyle,
          opacity: isVisible && targetRect ? 1 : 0,
          transform: isVisible && targetRect ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "w-6 bg-secondary"
                    : i < currentStep
                    ? "w-3 bg-secondary/50"
                    : "w-3 bg-muted"
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

      {/* Click catcher — clicking outside skips */}
      <div
        className="absolute inset-0 -z-10"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
};

export default SpotlightOverlay;
