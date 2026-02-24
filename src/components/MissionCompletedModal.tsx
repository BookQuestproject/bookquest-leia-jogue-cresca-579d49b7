import { useEffect, useState } from "react";
import { CheckCircle, Star, TrendingUp, X } from "lucide-react";

interface MissionCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  xpGained: number;
  currentXp: number;
  nextLevelXp: number;
  leveledUp?: boolean;
  newLevel?: string;
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
}: MissionCompletedModalProps) => {
  const [showContent, setShowContent] = useState(false);
  const [showXpBar, setShowXpBar] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpBarWidth, setXpBarWidth] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      setShowXpBar(false);
      setShowLevelUp(false);
      setXpBarWidth(0);

      const t1 = setTimeout(() => setShowContent(true), 100);
      const t2 = setTimeout(() => {
        setShowXpBar(true);
        // Animate XP bar fill
        setTimeout(() => {
          setXpBarWidth(Math.min((currentXp / nextLevelXp) * 100, 100));
        }, 100);
      }, 500);
      const t3 = setTimeout(() => {
        if (leveledUp) setShowLevelUp(true);
      }, 1000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen, currentXp, nextLevelXp, leveledUp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm mission-modal-backdrop" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mission-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Particles */}
        <div className="mission-particles">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mission-particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="editorial-card p-6 text-center overflow-hidden relative">
          {/* Glow ring behind icon */}
          <div className="mission-glow-ring mx-auto mb-4" />

          {/* Check icon */}
          <div className={`mission-check-icon mx-auto -mt-16 mb-3 relative z-10 ${showContent ? 'mission-check-animate' : 'opacity-0 scale-50'}`}>
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shadow-lg">
              <CheckCircle className="w-9 h-9 text-secondary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Missão concluída!</p>
            <h3 className="text-lg font-serif font-semibold mb-4">{missionTitle}</h3>
          </div>

          {/* XP Gained */}
          <div className={`transition-all duration-500 delay-200 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/30 mb-5">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-accent font-bold text-lg">+{xpGained} XP</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className={`transition-all duration-500 ${showXpBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progresso XP</span>
              <span>{currentXp}/{nextLevelXp}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full mission-xp-bar-fill transition-all duration-700 ease-out"
                style={{ width: `${xpBarWidth}%` }}
              />
            </div>
          </div>

          {/* Level Up */}
          {leveledUp && (
            <div className={`mt-5 transition-all duration-500 ${showLevelUp ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/10 border border-secondary/30">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="font-semibold text-secondary text-sm">Você avançou para {newLevel}!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionCompletedModal;
