import { useEffect, useState, useRef } from "react";
import { Star, Flame, X } from "lucide-react";

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  xpGained: number;
}

const ChallengeModal = ({ isOpen, onClose, missionTitle, xpGained }: ChallengeModalProps) => {
  const [phase, setPhase] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPhase(0);
      timerRef.current = [
        setTimeout(() => setPhase(1), 100),
        setTimeout(() => setPhase(2), 400),
        setTimeout(() => setPhase(3), 700),
      ];
      return () => timerRef.current.forEach(clearTimeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm mission-modal-backdrop" />
      <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 text-muted-foreground z-10">
          <X className="w-4 h-4" />
        </button>

        <div className={`editorial-card p-6 text-center overflow-hidden relative transition-all duration-500 ${
          phase >= 1 ? "challenge-card-expand" : "opacity-0 scale-90"
        }`}>
          {/* Flame effect */}
          <div className={`mx-auto mb-4 transition-all duration-700 ${phase >= 2 ? "challenge-flame-grow" : "opacity-0 scale-50"}`}>
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center relative">
              <Flame className="w-10 h-10 text-accent challenge-flame-pulse" />
              <div className="absolute inset-0 rounded-full challenge-flame-glow" />
            </div>
          </div>

          <div className={`transition-all duration-500 ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Desafio Concluído</p>
            <h3 className="text-lg font-serif font-semibold mb-4">{missionTitle}</h3>
          </div>

          <div className={`transition-all duration-500 delay-100 ${phase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/30">
              <Star className="w-4 h-4 text-accent mission-star-spin" />
              <span className="text-accent font-bold text-lg">+{xpGained} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
