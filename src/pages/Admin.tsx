import { Navigate } from "react-router-dom";
import { Shield, BookOpen, Calendar, Target, Users, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useAdminBookSuggestions } from "@/hooks/useBookSuggestions";
import { useAdminMentorship } from "@/hooks/useAdminMentorship";
import { useAdminGroupSessions, useAdminTracks } from "@/hooks/useAdminGroupMentorship";
import { AdminTracksPanel } from "@/components/admin/AdminTracksPanel";
import { AdminGroupSessionsPanel } from "@/components/admin/AdminGroupSessionsPanel";
import { AdminBookSuggestionsPanel } from "@/components/admin/AdminBookSuggestionsPanel";

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { suggestions } = useAdminBookSuggestions();
  const { sessions } = useAdminMentorship();
  const { sessions: groupSessions } = useAdminGroupSessions();
  const { tracks } = useAdminTracks();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <Layout>
        <div className="py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending").length;
  const upcomingGroupSessions = groupSessions.filter(
    (s) => new Date(s.session_date) >= new Date() && s.status !== "completed"
  ).length;
  const upcomingIndividualSessions = sessions.filter(
    (s) => s.status === "scheduled" && new Date(s.session_date) >= new Date()
  ).length;

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in" data-tutorial="admin-panel">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground">
              Gerencie trilhas, sessões de mentoria e sugestões de livros
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-warning">{pendingSuggestions}</div>
            <p className="text-sm text-muted-foreground">Sugestões Pendentes</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{tracks.length}</div>
            <p className="text-sm text-muted-foreground">Trilhas Ativas</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-info">{upcomingGroupSessions}</div>
            <p className="text-sm text-muted-foreground">Sessões em Grupo</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-success">{upcomingIndividualSessions}</div>
            <p className="text-sm text-muted-foreground">Agendamentos Avulsos</p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="suggestions" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Sugestões</span>
            </TabsTrigger>
            <TabsTrigger value="tracks" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Trilhas</span>
            </TabsTrigger>
            <TabsTrigger value="group-sessions" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Avulsos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" data-tutorial="admin-suggestions">
            <AdminBookSuggestionsPanel />
          </TabsContent>

          <TabsContent value="tracks" data-tutorial="admin-tracks">
            <AdminTracksPanel />
          </TabsContent>

          <TabsContent value="group-sessions">
            <AdminGroupSessionsPanel />
          </TabsContent>

          <TabsContent value="individual">
            <IndividualSessionsPanel sessions={sessions} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

// Legacy individual sessions panel (from old mentorship system)
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { MentorshipSession, useAdminMentorship as useAdminMentorshipHook } from "@/hooks/useAdminMentorship";

const IndividualSessionsPanel = ({ sessions }: { sessions: MentorshipSession[] }) => {
  const { updateSessionStatus, refetch } = useAdminMentorshipHook();

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" && new Date(s.session_date) >= new Date()
  );
  const confirmedSessions = sessions.filter((s) => s.status === "confirmed");
  const pastSessions = sessions.filter(
    (s) => new Date(s.session_date) < new Date() || s.status === "completed"
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-info/20 text-info">Agendado</span>;
      case "confirmed":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">Confirmado</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Concluído</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">Cancelado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-muted">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Agendamentos Avulsos (Legado)
        </h2>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Sessões individuais agendadas pelo sistema antigo. Novas sessões usam o sistema de grupos.
      </p>

      {sessions.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma sessão individual</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upcoming */}
          {upcomingSessions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Próximas ({upcomingSessions.length})</h3>
              <div className="space-y-2">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl bg-muted border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{session.user_name}</span>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatDate(session.session_date)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.session_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed */}
          {confirmedSessions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Confirmadas ({confirmedSessions.length})</h3>
              <div className="space-y-2">
                {confirmedSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold">{session.user_name}</span>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(session.session_date)} às {session.session_time}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSessionStatus(session.id, "completed")}
                      >
                        Concluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastSessions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Histórico ({pastSessions.length})</h3>
              <div className="space-y-2">
                {pastSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{session.user_name}</span>
                        {getStatusBadge(session.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(session.session_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
