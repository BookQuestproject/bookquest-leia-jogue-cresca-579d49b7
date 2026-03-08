import { useEffect, useState, useRef } from "react";
import { Award, X } from "lucide-react";

interface MilestoneOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  xpGained: number;
  unlockedTitle?: string;
}

const MilestoneOverlay = ({ isOpen, onClose, missionTitle, xpGained, unlockedTitle }: MilestoneOverlayProps) => {
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPhase(0);
      timerRef.current = [
        setTimeout(() => setPhase(1), 200),
        setTimeout(() => setPhase(2), 800),
        setTimeout(() => setPhase(3), 1600),
        setTimeout(() => setPhase(4), 2400),
      ];
      return () => timerRef.current.forEach(clearTimeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onClose}>
      {/* Dark overlay */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        phase >= 1 ? "bg-background/80 backdrop-blur-md" : "bg-transparent"
      }`} />

      <div className="relative z-10" onClick={e => e.stopPropagation()}>
        {/* Central flame */}
        <div className={`flex flex-col items-center transition-all duration-1000 ${
          phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}>
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 ${
              phase >= 2 ? "milestone-flame-full" : "bg-accent/10"
            }`}>
              <Award className={`w-12 h-12 transition-all duration-700 ${
                phase >= 2 ? "text-accent milestone-icon-glow" : "text-accent/50"
              }`} />
            </div>
            {/* Particles */}
            {phase >= 2 && (
              <div className="milestone-particles">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="milestone-particle" style={{ '--i': i, '--total': 16 } as React.CSSProperties} />
                ))}
              </div>
            )}
          </div>

          <div className={`text-center transition-all duration-700 ${
            phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">Novo Marco Alcançado</p>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{missionTitle}</h2>
            <p className="text-accent font-bold text-lg mb-3">+{xpGained} ✦</p>
            {unlockedTitle && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 transition-all duration-500 ${
                phase >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}>
                <Award className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">Título: {unlockedTitle}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className={`mt-8 px-6 py-2.5 rounded-lg bg-accent/15 border border-accent/30 text-accent font-semibold text-sm transition-all duration-500 hover:bg-accent/25 active:scale-95 ${
              phase >= 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            Continuar Jornada
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneOverlay;
