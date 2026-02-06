import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MentorshipTrack, GroupSession } from "./useMentorshipTracks";

export interface Mentor {
  id: string;
  user_id: string | null;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface GroupSessionWithParticipants extends GroupSession {
  participants: {
    id: string;
    user_id: string;
    enrolled_at: string;
    attended: boolean;
    user_name?: string;
    user_email?: string;
  }[];
}

export const useAdminTracks = () => {
  const [tracks, setTracks] = useState<MentorshipTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("mentorship_tracks")
        .select("*")
        .order("name");

      if (error) throw error;
      
      const formattedTracks: MentorshipTrack[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        objectives: t.objectives,
        weekly_script: t.weekly_script,
        is_active: t.is_active ?? true,
      }));
      
      setTracks(formattedTracks);
    } catch (err) {
      console.error("Error fetching tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const createTrack = async (track: { name: string; slug: string; description?: string; objectives?: string[] }) => {
    try {
      const { error } = await supabase.from("mentorship_tracks").insert([track]);
      if (error) throw error;
      toast.success("Trilha criada com sucesso!");
      await fetchTracks();
      return true;
    } catch (err) {
      console.error("Error creating track:", err);
      toast.error("Erro ao criar trilha");
      return false;
    }
  };

  const updateTrack = async (id: string, updates: Partial<MentorshipTrack>) => {
    try {
      const { error } = await supabase
        .from("mentorship_tracks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      toast.success("Trilha atualizada!");
      await fetchTracks();
      return true;
    } catch (err) {
      console.error("Error updating track:", err);
      toast.error("Erro ao atualizar trilha");
      return false;
    }
  };

  const deleteTrack = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mentorship_tracks")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Trilha removida!");
      await fetchTracks();
      return true;
    } catch (err) {
      console.error("Error deleting track:", err);
      toast.error("Erro ao remover trilha");
      return false;
    }
  };

  return { tracks, loading, createTrack, updateTrack, deleteTrack, refetch: fetchTracks };
};

export const useAdminMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .order("name");

      if (error) throw error;
      setMentors(data || []);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const createMentor = async (mentor: { name: string; bio?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.from("mentors").insert([mentor]);
      if (error) throw error;
      toast.success("Mentor adicionado!");
      await fetchMentors();
      return true;
    } catch (err) {
      console.error("Error creating mentor:", err);
      toast.error("Erro ao adicionar mentor");
      return false;
    }
  };

  const updateMentor = async (id: string, updates: Partial<Mentor>) => {
    try {
      const { error } = await supabase
        .from("mentors")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      toast.success("Mentor atualizado!");
      await fetchMentors();
      return true;
    } catch (err) {
      console.error("Error updating mentor:", err);
      toast.error("Erro ao atualizar mentor");
      return false;
    }
  };

  return { mentors, loading, createMentor, updateMentor, refetch: fetchMentors };
};

export const useAdminGroupSessions = () => {
  const [sessions, setSessions] = useState<GroupSessionWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("mentorship_group_sessions")
        .select(`
          *,
          track:mentorship_tracks(*),
          mentor:mentors(*)
        `)
        .order("session_date", { ascending: true })
        .order("session_time", { ascending: true });

      if (sessionsError) throw sessionsError;

      // Fetch participants for each session
      const sessionsWithParticipants = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: participants } = await supabase
            .from("group_session_participants")
            .select("*")
            .eq("session_id", session.id);

          // Get user info for each participant
          const participantsWithInfo = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", p.user_id)
                .single();

              return {
                ...p,
                user_name: profile?.full_name || "Usuário",
                user_email: profile?.email || "",
              };
            })
          );

          return {
            ...session,
            participants: participantsWithInfo,
            participants_count: participantsWithInfo.length,
          };
        })
      );

      setSessions(sessionsWithParticipants);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const createSession = async (session: {
    track_id: string;
    mentor_id?: string;
    session_date: string;
    session_time: string;
    max_participants?: number;
  }) => {
    try {
      const { error } = await supabase
        .from("mentorship_group_sessions")
        .insert(session);
      if (error) throw error;
      toast.success("Sessão criada!");
      await fetchSessions();
      return true;
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error("Erro ao criar sessão");
      return false;
    }
  };

  const updateSessionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("mentorship_group_sessions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success("Status atualizado!");
      await fetchSessions();
      return true;
    } catch (err) {
      console.error("Error updating session:", err);
      toast.error("Erro ao atualizar sessão");
      return false;
    }
  };

  const markAttendance = async (participantId: string, attended: boolean) => {
    try {
      const { error } = await supabase
        .from("group_session_participants")
        .update({ attended })
        .eq("id", participantId);
      if (error) throw error;
      toast.success(attended ? "Presença marcada" : "Presença desmarcada");
      await fetchSessions();
      return true;
    } catch (err) {
      console.error("Error marking attendance:", err);
      toast.error("Erro ao marcar presença");
      return false;
    }
  };

  return {
    sessions,
    loading,
    createSession,
    updateSessionStatus,
    markAttendance,
    refetch: fetchSessions,
  };
};
