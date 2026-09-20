 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 
 export const useAdmin = () => {
   const { user } = useAuth();
   const [isAdmin, setIsAdmin] = useState(false);
   const [loading, setLoading] = useState(true);
   const OWNER_EMAIL = "davimirandamarquesofc@gmail.com";
 
   useEffect(() => {
     const checkAdminRole = async () => {
       if (!user) {
         setIsAdmin(false);
         setLoading(false);
         return;
       }
 
       try {
         if (user.email?.toLowerCase() === OWNER_EMAIL) {
           setIsAdmin(true);
           setLoading(false);
           return;
         }
         const { data, error } = await supabase
           .from("user_roles")
           .select("role")
           .eq("user_id", user.id)
           .eq("role", "admin")
           .maybeSingle();
 
         if (error) {
           console.error("Error checking admin role:", error);
           setIsAdmin(false);
         } else {
           setIsAdmin(!!data);
         }
       } catch (err) {
         console.error("Error:", err);
         setIsAdmin(false);
       } finally {
         setLoading(false);
       }
     };
 
     checkAdminRole();
   }, [user]);
 
   return { isAdmin, loading };
 };