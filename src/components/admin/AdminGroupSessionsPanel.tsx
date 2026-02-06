import { useState } from "react";
import {
  Calendar,
  Plus,
  Check,
  X,
  Users,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAdminGroupSessions,
  useAdminTracks,
  useAdminMentors,
} from "@/hooks/useAdminGroupMentorship";

export const AdminGroupSessionsPanel = () => {
  const { sessions, loading, createSession, updateSessionStatus, markAttendance, refetch } =
    useAdminGroupSessions();
  const { tracks } = useAdminTracks();
  const { mentors } = useAdminMentors();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    track_id: "",
    mentor_id: "",
    session_date: "",
    session_time: "",
    max_participants: "8",
  });

  const resetForm = () => {
    setFormData({
      track_id: "",
      mentor_id: "",
      session_date: "",
      session_time: "",
      max_participants: "8",
    });
    setIsCreateOpen(false);
  };

  const handleSubmit = async () => {
    await createSession({
      track_id: formData.track_id,
      mentor_id: formData.mentor_id || undefined,
      session_date: formData.session_date,
      session_time: formData.session_time,
      max_participants: parseInt(formData.max_participants) || 8,
    });
    resetForm();
  };

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.session_date) >= new Date() && s.status !== "completed"
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.session_date) < new Date() || s.status === "completed"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-info/20 text-info">Agendada</span>;
      case "confirmed":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">Confirmada</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning">Em andamento</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Concluída</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">Cancelada</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Sessões em Grupo
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Sessão
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          <div>
            <h3 className="font-semibold mb-3">Próximas ({upcomingSessions.length})</h3>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma sessão agendada</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{session.track?.name}</span>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(session.session_date), "d 'de' MMMM", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.session_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.participants_count}/{session.max_participants}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success hover:text-success"
                              onClick={() => updateSessionStatus(session.id, "confirmed")}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateSessionStatus(session.id, "cancelled")}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {session.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSessionStatus(session.id, "completed")}
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    {session.participants.length > 0 && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2">Participantes:</p>
                        <div className="flex flex-wrap gap-2">
                          {session.participants.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => markAttendance(p.id, !p.attended)}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                p.attended
                                  ? "bg-success/20 text-success"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {p.user_name}
                              {p.attended && " ✓"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {pastSessions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Histórico ({pastSessions.length})</h3>
              <div className="space-y-2">
                {pastSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{session.track?.name}</span>
                        {getStatusBadge(session.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.session_date), "d/MM/yy", { locale: ptBR })} - {session.session_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sessão em Grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Trilha</label>
              <Select
                value={formData.track_id}
                onValueChange={(v) => setFormData({ ...formData, track_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a trilha" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mentor (opcional)</label>
              <Select
                value={formData.mentor_id}
                onValueChange={(v) => setFormData({ ...formData, mentor_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mentor" />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data</label>
                <Input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) =>
                    setFormData({ ...formData, session_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Horário</label>
                <Input
                  type="time"
                  value={formData.session_time}
                  onChange={(e) =>
                    setFormData({ ...formData, session_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Máx. participantes</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.max_participants}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.track_id || !formData.session_date || !formData.session_time}
            >
              <Check className="w-4 h-4 mr-2" />
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
