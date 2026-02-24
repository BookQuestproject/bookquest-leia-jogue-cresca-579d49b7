import { useEffect, useState, useRef } from "react";
import { CheckCircle, Star, TrendingUp, X, ChevronUp } from "lucide-react";

interface MissionCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  xpGained: number;
  currentXp: number;
  nextLevelXp: number;
  leveledUp?: boolean;
  newLevel?: string;
  previousLevel?: string;
}

const MissionCompletedModal = ({
  isOpen,
  onClose,
  missionTitle,
  xpGained,
  currentXp,
  nextLevelXp,
  leveledUp = false,
  newLevel,
  previousLevel,
}: MissionCompletedModalProps) => {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=icon, 2=title, 3=xp, 4=bar, 5=levelup
  const [xpBarWidth, setXpBarWidth] = useState(0);
  const [prevBarWidth, setPrevBarWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPhase(0);
      setXpBarWidth(0);
      // Calculate previous XP bar position
      const prevXp = currentXp - xpGained;
      setPrevBarWidth(Math.max(0, Math.min((prevXp / nextLevelXp) * 100, 100)));

      timerRef.current = [
        setTimeout(() => setPhase(1), 80),
        setTimeout(() => setPhase(2), 350),
        setTimeout(() => setPhase(3), 600),
        setTimeout(() => {
          setPhase(4);
          // Animate bar from previous to current
          requestAnimationFrame(() => {
            setXpBarWidth(Math.min((currentXp / nextLevelXp) * 100, 100));
          });
        }, 850),
        setTimeout(() => { if (leveledUp) setPhase(5); }, 1300),
      ];

      return () => timerRef.current.forEach(clearTimeout);
    }
  }, [isOpen, currentXp, nextLevelXp, leveledUp, xpGained]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm mission-modal-backdrop" />

      <div
        className="relative w-full max-w-sm mission-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Particles */}
        <div className="mission-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="mission-particle" style={{ '--i': i, '--total': 12 } as React.CSSProperties} />
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="editorial-card p-6 text-center overflow-hidden relative">
          {/* Glow ring */}
          <div className={`mission-glow-ring mx-auto mb-4 ${phase >= 1 ? 'mission-glow-active' : 'opacity-0'}`} />

          {/* Check icon */}
          <div className={`mx-auto -mt-16 mb-3 relative z-10 ${phase >= 1 ? 'mission-check-animate' : 'opacity-0 scale-0'}`}>
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mission-icon-shadow">
              <CheckCircle className="w-9 h-9 text-secondary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className={`mission-slide-up ${phase >= 2 ? 'mission-slide-up-active' : ''}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Missão concluída!</p>
            <h3 className="text-lg font-serif font-semibold mb-4">{missionTitle}</h3>
          </div>

          {/* XP Gained with counter */}
          <div className={`mission-scale-in ${phase >= 3 ? 'mission-scale-in-active' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/30 mb-5">
              <Star className="w-4 h-4 text-accent mission-star-spin" />
              <span className="text-accent font-bold text-lg">+{xpGained} XP</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className={`mission-slide-up ${phase >= 4 ? 'mission-slide-up-active' : ''}`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progresso XP</span>
              <span>{currentXp}/{nextLevelXp}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
              <div
                className="h-full rounded-full mission-xp-bar-fill"
                style={{
                  width: `${xpBarWidth}%`,
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>

          {/* Level Up with rank animation */}
          {leveledUp && (
            <div className={`mt-5 ${phase >= 5 ? 'mission-levelup-enter' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-secondary/10 border border-secondary/30 relative overflow-hidden">
                <div className="mission-levelup-shimmer" />
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <ChevronUp className="w-4 h-4 text-secondary mission-arrow-bounce" />
                    <span className="text-xs text-muted-foreground">Subiu de ranking!</span>
                    <ChevronUp className="w-4 h-4 text-secondary mission-arrow-bounce" style={{ animationDelay: '0.15s' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    {previousLevel && (
                      <>
                        <span className="text-xs text-muted-foreground mission-old-rank">{previousLevel}</span>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <span className="font-bold text-secondary text-sm mission-new-rank">{newLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCompletedModal;
