import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import EssenciaIcon from "@/components/EssenciaIcon";

interface MissionCompletionToastProps {
  missionTitle: string;
  reward: number;
  onClose: () => void;
}

const MissionCompletionToast = ({ missionTitle, reward, onClose }: MissionCompletionToastProps) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-[100] max-w-sm transition-all duration-400 ${
        visible && !exiting
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"
      }`}
    >
      <div className="rounded-xl p-4 bg-card border border-accent/30 shadow-lg shadow-accent/10 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent mb-0.5">
            Missão concluída
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            {missionTitle}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <EssenciaIcon size="xs" className="text-accent" />
            <span className="text-xs font-bold text-accent">+{reward} Essência</span>
          </div>
        </div>
        <button
          onClick={() => { setExiting(true); setTimeout(onClose, 400); }}
          className="text-muted-foreground/40 hover:text-foreground text-xs mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MissionCompletionToast;
