import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface HabitToastProps {
  isVisible: boolean;
  missionTitle: string;
  xp: number;
  onDone: () => void;
}

const HabitToast = ({ isVisible, missionTitle, xp, onDone }: HabitToastProps) => {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit" | "hidden">("hidden");

  useEffect(() => {
    if (isVisible) {
      setPhase("enter");
      const t1 = setTimeout(() => setPhase("visible"), 50);
      const t2 = setTimeout(() => setPhase("exit"), 2200);
      const t3 = setTimeout(() => {
        setPhase("hidden");
        onDone();
      }, 2700);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isVisible, onDone]);

  if (phase === "hidden") return null;

  return (
    <div className="fixed top-4 right-4 z-[60] pointer-events-none">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-card/95 backdrop-blur-md shadow-lg transition-all duration-500 ${
          phase === "enter" ? "opacity-0 translate-x-8 scale-95" :
          phase === "visible" ? "opacity-100 translate-x-0 scale-100" :
          "opacity-0 translate-x-4 scale-95"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
          <CheckCircle className={`w-5 h-5 text-accent ${phase === "visible" ? "habit-check-draw" : ""}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-accent">Hábito fortalecido</p>
          <p className="text-[11px] text-muted-foreground">{missionTitle} · +{xp} ✦</p>
        </div>
        <div className={`absolute inset-0 rounded-xl ${phase === "visible" ? "habit-shimmer" : ""}`} />
      </div>
    </div>
  );
};

export default HabitToast;
