import { Check, Zap } from "lucide-react";
import ProgressBar from "./ProgressBar";

interface MissionCardProps {
  title: string;
  description: string;
  progress: number;
  goal: number;
  xpReward: number;
  completed?: boolean;
}

const MissionCard = ({
  title,
  description,
  progress,
  goal,
  xpReward,
  completed = false,
}: MissionCardProps) => {
  return (
    <div className={`mission-card ${completed ? "border-primary/50 bg-primary/5" : ""}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        completed ? "bg-primary" : "bg-secondary"
      }`}>
        {completed ? (
          <Check className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Zap className="w-6 h-6 text-warning" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-foreground truncate">{title}</h4>
          <span className="text-sm font-bold text-primary whitespace-nowrap">+{xpReward} XP</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <ProgressBar value={progress} max={goal} />
        <p className="text-xs text-muted-foreground mt-1">
          {progress} / {goal}
        </p>
      </div>
    </div>
  );
};

export default MissionCard;
