import { Calendar, Clock, Users, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { GroupSession } from "@/hooks/useMentorshipTracks";

interface SessionCardProps {
  session: GroupSession;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
}

export const SessionCard = ({
  session,
  isEnrolled,
  isEnrolling,
  onEnroll,
  onUnenroll,
}: SessionCardProps) => {
  const sessionDate = new Date(session.session_date);
  const spotsLeft = session.max_participants - (session.participants_count || 0);
  const isFull = spotsLeft <= 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isEnrolled
          ? "border-primary bg-primary/5"
          : isFull
          ? "border-border/30 bg-muted/30 opacity-60"
          : "border-border/50 bg-muted hover:border-primary/30"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="w-4 h-4 text-primary" />
              {format(sessionDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {session.session_time}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {session.participants_count || 0}/{session.max_participants} participantes
            </div>
            {session.track && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                {session.track.name}
              </span>
            )}
          </div>
        </div>

        <div>
          {isEnrolled ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnenroll}
              disabled={isEnrolling}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isEnrolling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Cancelar"
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onEnroll}
              disabled={isFull || isEnrolling}
              className="gap-1.5"
            >
              {isEnrolling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFull ? (
                "Lotado"
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Inscrever
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
