 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export interface MentorshipSession {
   id: string;
   user_id: string;
   session_date: string;
   session_time: string;
   status: string;
   notes: string | null;
   created_at: string;
   user_email?: string;
   user_name?: string;
 }
 
 export const useAdminMentorship = () => {
   const [sessions, setSessions] = useState<MentorshipSession[]>([]);
   const [loading, setLoading] = useState(true);
 
   const fetchAllSessions = async () => {
     try {
       // Fetch sessions with user profile info
       const { data, error } = await supabase
         .from("mentorship_sessions")
         .select(`
           *,
           profiles:user_id (
             full_name,
             email
           )
         `)
         .order("session_date", { ascending: true })
         .order("session_time", { ascending: true });
 
       if (error) throw error;
 
       const formattedData = (data || []).map((session: any) => ({
         ...session,
         user_name: session.profiles?.full_name || "Usuário",
         user_email: session.profiles?.email || "",
       }));
 
       setSessions(formattedData);
     } catch (err) {
       console.error("Error fetching sessions:", err);
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     fetchAllSessions();
   }, []);
 
   const updateSessionStatus = async (id: string, status: string) => {
     try {
       const { error } = await supabase
         .from("mentorship_sessions")
         .update({ status })
         .eq("id", id);
 
       if (error) throw error;
 
       toast.success(`Sessão ${status === "confirmed" ? "confirmada" : status === "cancelled" ? "cancelada" : "atualizada"}`);
       await fetchAllSessions();
       return true;
     } catch (err) {
       console.error("Error updating session:", err);
       toast.error("Erro ao atualizar sessão");
       return false;
     }
   };
 
   return {
     sessions,
     loading,
     updateSessionStatus,
     refetch: fetchAllSessions,
   };
 };