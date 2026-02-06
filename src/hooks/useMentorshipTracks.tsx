import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MentorshipTrack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  objectives: string[] | null;
  weekly_script: any | null;
  is_active: boolean;
}

export interface GroupSession {
  id: string;
  track_id: string;
  mentor_id: string | null;
  session_date: string;
  session_time: string;
  max_participants: number;
  min_participants: number;
  status: string;
  notes: string | null;
  participants_count?: number;
  track?: MentorshipTrack;
}

export interface SessionParticipation {
  id: string;
  session_id: string;
  user_id: string;
  enrolled_at: string;
  attended: boolean;
  session?: GroupSession;
}

export const useMentorshipTracks = () => {
  const [tracks, setTracks] = useState<MentorshipTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from("mentorship_tracks")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      const formattedTracks: MentorshipTrack[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        objectives: t.objectives,
        weekly_script: t.weekly_script,
        is_active: t.is_active,
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

  return { tracks, loading, refetch: fetchTracks };
};

export const useGroupSessions = (trackId?: string) => {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      let query = supabase
        .from("mentorship_group_sessions")
        .select(`
          *,
          track:mentorship_tracks(*)
        `)
        .gte("session_date", new Date().toISOString().split("T")[0])
        .in("status", ["scheduled", "confirmed"])
        .order("session_date")
        .order("session_time");

      if (trackId) {
        query = query.eq("track_id", trackId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get participant counts
      const sessionsWithCounts = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from("group_session_participants")
            .select("*", { count: "exact", head: true })
            .eq("session_id", session.id);

          return {
            ...session,
            participants_count: count || 0,
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [trackId]);

  return { sessions, loading, refetch: fetchSessions };
};

export const useUserParticipations = (userId?: string) => {
  const [participations, setParticipations] = useState<SessionParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipations = async () => {
    if (!userId) {
      setParticipations([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("group_session_participants")
        .select(`
          *,
          session:mentorship_group_sessions(
            *,
            track:mentorship_tracks(*)
          )
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      setParticipations(data || []);
    } catch (err) {
      console.error("Error fetching participations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, [userId]);

  const enrollInSession = async (sessionId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("group_session_participants")
        .insert({
          session_id: sessionId,
          user_id: userId,
        });

      if (error) throw error;
      await fetchParticipations();
      return true;
    } catch (err) {
      console.error("Error enrolling:", err);
      return false;
    }
  };

  const unenrollFromSession = async (sessionId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("group_session_participants")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", userId);

      if (error) throw error;
      await fetchParticipations();
      return true;
    } catch (err) {
      console.error("Error unenrolling:", err);
      return false;
    }
  };

  return {
    participations,
    loading,
    enrollInSession,
    unenrollFromSession,
    refetch: fetchParticipations,
  };
};
