import { BookOpen, Target, Clock, Users } from "lucide-react";
import { MentorshipTrack } from "@/hooks/useMentorshipTracks";

interface TrackCardProps {
  track: MentorshipTrack;
  isSelected: boolean;
  onSelect: () => void;
}

const trackIcons: Record<string, React.ReactNode> = {
  "rotina-leitura": <Clock className="w-6 h-6" />,
  "organizacao-tempo": <Target className="w-6 h-6" />,
  "comecando-zero": <BookOpen className="w-6 h-6" />,
  "fisica-digital": <Users className="w-6 h-6" />,
};

export const TrackCard = ({ track, isSelected, onSelect }: TrackCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border/50 bg-muted hover:border-primary/50 hover:bg-muted/80"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl ${
            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {trackIcons[track.slug] || <BookOpen className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{track.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
          
          {track.objectives && track.objectives.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {track.objectives.slice(0, 3).map((obj, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {obj}
                </span>
              ))}
              {track.objectives.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  +{track.objectives.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
