import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Lock,
  Sparkles,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Target,
  Loader2,
  CheckCircle,
  Video,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import {
  useMentorshipTracks,
  useGroupSessions,
  useUserParticipations,
} from "@/hooks/useMentorshipTracks";
import { TrackCard } from "@/components/mentorship/TrackCard";
import { SessionCard } from "@/components/mentorship/SessionCard";
import { MeetingStructure } from "@/components/mentorship/MeetingStructure";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Mentoria = () => {
  const { user } = useAuth();
  const { isPremium, isAdmin, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [enrollingSessionId, setEnrollingSessionId] = useState<string | null>(null);

  const { tracks, loading: tracksLoading } = useMentorshipTracks();
  const { sessions, loading: sessionsLoading, refetch: refetchSessions } = useGroupSessions(selectedTrackId || undefined);
  const {
    participations,
    loading: participationsLoading,
    enrollInSession,
    unenrollFromSession,
  } = useUserParticipations(user?.id);

  const handleEnroll = async (sessionId: string) => {
    setEnrollingSessionId(sessionId);
    const success = await enrollInSession(sessionId);
    if (success) {
      toast({
        title: "Inscrição confirmada!",
        description: "Você foi inscrito na sessão de mentoria.",
      });
      refetchSessions();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível realizar a inscrição.",
        variant: "destructive",
      });
    }
    setEnrollingSessionId(null);
  };

  const handleUnenroll = async (sessionId: string) => {
    setEnrollingSessionId(sessionId);
    const success = await unenrollFromSession(sessionId);
    if (success) {
      toast({
        title: "Inscrição cancelada",
        description: "Você foi removido da sessão.",
      });
      refetchSessions();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a inscrição.",
        variant: "destructive",
      });
    }
    setEnrollingSessionId(null);
  };

  const isEnrolledInSession = (sessionId: string) => {
    return participations.some((p) => p.session_id === sessionId);
  };

  const upcomingEnrollments = participations.filter(
    (p) => p.session && new Date(p.session.session_date) >= new Date()
  );

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8 max-w-6xl mx-auto">
        {/* Premium Banner */}
        {!isPremium && (
          <div className="glass-card rounded-2xl p-4 mb-6 bg-accent/5 border-accent/20 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">Conteúdo Premium</p>
                  <p className="text-xs text-muted-foreground">
                    Assine para participar da mentoria semanal
                  </p>
                </div>
              </div>
              <Link to="/premium">
                <Button variant="premium" size="sm" className="gap-2">
                  <Crown className="w-4 h-4" />
                  Assinar - R$ 29,90/mês
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Exclusivo para Assinantes
          </div>
          <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Mentoria Literária
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            A Mentoria Literária BookQuest foi criada para quem quer ler mais,
            mas não consegue manter constância sozinho. Participe de encontros
            semanais em pequenos grupos, com acompanhamento focado em criar
            rotina e transformar a leitura em um hábito contínuo.
          </p>
        </div>

        {/* Format Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold text-sm">1x por semana</p>
            <p className="text-xs text-muted-foreground">Encontros regulares</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold text-sm">45-60 min</p>
            <p className="text-xs text-muted-foreground">Duração do encontro</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold text-sm">5-8 pessoas</p>
            <p className="text-xs text-muted-foreground">Pequenos grupos</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-bold text-sm">Online</p>
            <p className="text-xs text-muted-foreground">De qualquer lugar</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tracks */}
            <div className={!isPremium ? "opacity-60 pointer-events-none" : ""}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Escolha sua Trilha
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione a trilha que mais combina com seu objetivo atual
              </p>

              {tracksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isSelected={selectedTrackId === track.id}
                      onSelect={() =>
                        setSelectedTrackId(
                          selectedTrackId === track.id ? null : track.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sessions */}
            {selectedTrackId && isPremium && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Próximas Sessões
                </h2>

                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-sm">
                      Nenhuma sessão disponível no momento
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Novas sessões são criadas semanalmente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        isEnrolled={isEnrolledInSession(session.id)}
                        isEnrolling={enrollingSessionId === session.id}
                        onEnroll={() => handleEnroll(session.id)}
                        onUnenroll={() => handleUnenroll(session.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Sessions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Minhas Sessões
              </h3>

              {participationsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : upcomingEnrollments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma inscrição ativa</p>
                  <p className="text-xs mt-1">Escolha uma trilha para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEnrollments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">
                          {p.session?.track?.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {p.session?.session_time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.session &&
                          format(
                            new Date(p.session.session_date),
                            "EEEE, d 'de' MMMM",
                            { locale: ptBR }
                          )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meeting Structure */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Estrutura do Encontro
              </h3>
              <MeetingStructure />
            </div>

            {/* Info */}
            <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/20">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                O foco não é velocidade
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A mentoria existe para garantir que a leitura aconteça. O
                progresso no BookQuest depende do seu compromisso — e nós
                estamos aqui para ajudar você a manter a constância.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mentoria;
