 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 
 export interface BookSuggestion {
   id: string;
   user_id: string;
   title: string;
   author: string | null;
   reason: string | null;
   status: string;
   admin_notes: string | null;
   created_at: string;
   updated_at: string;
   user_email?: string;
   user_name?: string;
 }
 
 export const useBookSuggestions = () => {
   const { user } = useAuth();
   const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
   const [loading, setLoading] = useState(true);
 
   const fetchSuggestions = async () => {
     if (!user) {
       setSuggestions([]);
       setLoading(false);
       return;
     }
 
     try {
       const { data, error } = await supabase
         .from("book_suggestions")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       setSuggestions(data || []);
     } catch (err) {
       console.error("Error fetching suggestions:", err);
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     fetchSuggestions();
   }, [user]);
 
   const createSuggestion = async (title: string, author: string, reason?: string) => {
     if (!user) {
       toast.error("Você precisa estar logado para sugerir um livro");
       return false;
     }
 
     try {
       const { error } = await supabase.from("book_suggestions").insert({
         user_id: user.id,
         title: title.trim(),
         author: author.trim() || null,
         reason: reason?.trim() || null,
         status: "pending",
       });
 
       if (error) throw error;
 
       toast.success("Sugestão enviada com sucesso!", {
         description: "Vamos analisar sua sugestão em breve.",
       });
 
       await fetchSuggestions();
       return true;
     } catch (err) {
       console.error("Error creating suggestion:", err);
       toast.error("Erro ao enviar sugestão");
       return false;
     }
   };
 
   return { suggestions, loading, createSuggestion, refetch: fetchSuggestions };
 };
 
 // Admin-specific hook
 export const useAdminBookSuggestions = () => {
   const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
   const [loading, setLoading] = useState(true);
 
   const fetchAllSuggestions = async () => {
     try {
       // This will work because of the admin RLS policy
       const { data, error } = await supabase
         .from("book_suggestions")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       setSuggestions(data || []);
     } catch (err) {
       console.error("Error fetching all suggestions:", err);
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     fetchAllSuggestions();
   }, []);
 
   const updateSuggestionStatus = async (
     id: string,
     status: string,
     adminNotes?: string
   ) => {
     try {
       const { error } = await supabase
         .from("book_suggestions")
         .update({
           status,
           admin_notes: adminNotes || null,
         })
         .eq("id", id);
 
       if (error) throw error;
 
       toast.success(`Sugestão ${status === "approved" ? "aprovada" : "rejeitada"}`);
       await fetchAllSuggestions();
       return true;
     } catch (err) {
       console.error("Error updating suggestion:", err);
       toast.error("Erro ao atualizar sugestão");
       return false;
     }
   };
 
   const deleteSuggestion = async (id: string) => {
     try {
       const { error } = await supabase
         .from("book_suggestions")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
 
       toast.success("Sugestão removida");
       await fetchAllSuggestions();
       return true;
     } catch (err) {
       console.error("Error deleting suggestion:", err);
       toast.error("Erro ao remover sugestão");
       return false;
     }
   };
 
   return {
     suggestions,
     loading,
     updateSuggestionStatus,
     deleteSuggestion,
     refetch: fetchAllSuggestions,
   };
 };