 import { useState } from "react";
 import { Navigate } from "react-router-dom";
 import {
   Shield,
   BookOpen,
   Calendar,
   Users,
   Check,
   X,
   Trash2,
   Clock,
   RefreshCw,
   Eye,
 } from "lucide-react";
 import Layout from "@/components/layout/Layout";
 import { Button } from "@/components/ui/button";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Skeleton } from "@/components/ui/skeleton";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Textarea } from "@/components/ui/textarea";
 import { useAdmin } from "@/hooks/useAdmin";
 import { useAuth } from "@/hooks/useAuth";
 import { useAdminBookSuggestions, BookSuggestion } from "@/hooks/useBookSuggestions";
 import { useAdminMentorship, MentorshipSession } from "@/hooks/useAdminMentorship";
 
 const Admin = () => {
   const { user } = useAuth();
   const { isAdmin, loading: adminLoading } = useAdmin();
   const {
     suggestions,
     loading: suggestionsLoading,
     updateSuggestionStatus,
     deleteSuggestion,
     refetch: refetchSuggestions,
   } = useAdminBookSuggestions();
   const {
     sessions,
     loading: sessionsLoading,
     updateSessionStatus,
     refetch: refetchSessions,
   } = useAdminMentorship();
 
   const [selectedSuggestion, setSelectedSuggestion] = useState<BookSuggestion | null>(null);
   const [adminNotes, setAdminNotes] = useState("");
   const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
 
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
     return <Navigate to="/" replace />;
   }
 
   const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
   const approvedSuggestions = suggestions.filter((s) => s.status === "approved");
   const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected");
 
   const upcomingSessions = sessions.filter(
     (s) => s.status === "scheduled" && new Date(s.session_date) >= new Date()
   );
   const confirmedSessions = sessions.filter((s) => s.status === "confirmed");
   const pastSessions = sessions.filter(
     (s) => new Date(s.session_date) < new Date() || s.status === "completed"
   );
 
   const handleSuggestionAction = async () => {
     if (!selectedSuggestion || !actionType) return;
 
     const status = actionType === "approve" ? "approved" : "rejected";
     await updateSuggestionStatus(selectedSuggestion.id, status, adminNotes);
 
     setSelectedSuggestion(null);
     setAdminNotes("");
     setActionType(null);
   };
 
   const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString("pt-BR", {
       day: "2-digit",
       month: "short",
       year: "numeric",
     });
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "pending":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-warning/20 text-warning">
             Pendente
           </span>
         );
       case "approved":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">
             Aprovado
           </span>
         );
       case "rejected":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive">
             Rejeitado
           </span>
         );
       case "scheduled":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-info/20 text-info">
             Agendado
           </span>
         );
       case "confirmed":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success">
             Confirmado
           </span>
         );
       case "completed":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
             Concluído
           </span>
         );
       case "cancelled":
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-destructive/20 text-destructive">
             Cancelado
           </span>
         );
       default:
         return (
           <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
             {status}
           </span>
         );
     }
   };
 
   const SuggestionCard = ({ suggestion }: { suggestion: BookSuggestion }) => (
     <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
       <div className="flex items-start justify-between gap-4">
         <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
             <h4 className="font-bold">{suggestion.title}</h4>
             {getStatusBadge(suggestion.status)}
           </div>
           <p className="text-sm text-muted-foreground">por {suggestion.author || "Autor não informado"}</p>
           {suggestion.reason && (
             <p className="text-sm mt-2 text-foreground/80">{suggestion.reason}</p>
           )}
           <p className="text-xs text-muted-foreground mt-2">
             Enviado em {formatDate(suggestion.created_at)}
           </p>
           {suggestion.admin_notes && (
             <p className="text-xs mt-2 p-2 rounded bg-muted">
               <strong>Notas:</strong> {suggestion.admin_notes}
             </p>
           )}
         </div>
         {suggestion.status === "pending" && (
           <div className="flex gap-2">
             <Button
               size="sm"
               variant="outline"
               className="text-success hover:text-success hover:bg-success/10"
               onClick={() => {
                 setSelectedSuggestion(suggestion);
                 setActionType("approve");
               }}
             >
               <Check className="w-4 h-4" />
             </Button>
             <Button
               size="sm"
               variant="outline"
               className="text-destructive hover:text-destructive hover:bg-destructive/10"
               onClick={() => {
                 setSelectedSuggestion(suggestion);
                 setActionType("reject");
               }}
             >
               <X className="w-4 h-4" />
             </Button>
           </div>
         )}
         {suggestion.status !== "pending" && (
           <Button
             size="sm"
             variant="ghost"
             className="text-destructive hover:text-destructive"
             onClick={() => deleteSuggestion(suggestion.id)}
           >
             <Trash2 className="w-4 h-4" />
           </Button>
         )}
       </div>
     </div>
   );
 
   const SessionCard = ({ session }: { session: MentorshipSession }) => (
     <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
       <div className="flex items-start justify-between gap-4">
         <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
             <h4 className="font-bold">{session.user_name}</h4>
             {getStatusBadge(session.status)}
           </div>
           <p className="text-sm text-muted-foreground">{session.user_email}</p>
           <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1 text-sm">
               <Calendar className="w-4 h-4 text-primary" />
               {formatDate(session.session_date)}
             </div>
             <div className="flex items-center gap-1 text-sm">
               <Clock className="w-4 h-4 text-primary" />
               {session.session_time}
             </div>
           </div>
           {session.notes && (
             <p className="text-xs mt-2 p-2 rounded bg-muted">{session.notes}</p>
           )}
         </div>
         {session.status === "scheduled" && (
           <div className="flex gap-2">
             <Button
               size="sm"
               variant="outline"
               className="text-success hover:text-success hover:bg-success/10"
               onClick={() => updateSessionStatus(session.id, "confirmed")}
             >
               <Check className="w-4 h-4" />
             </Button>
             <Button
               size="sm"
               variant="outline"
               className="text-destructive hover:text-destructive hover:bg-destructive/10"
               onClick={() => updateSessionStatus(session.id, "cancelled")}
             >
               <X className="w-4 h-4" />
             </Button>
           </div>
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
   );
 
   return (
     <Layout>
       <div className="py-8">
         {/* Header */}
         <div className="flex items-center justify-between mb-8 animate-fade-in">
           <div>
             <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
               <Shield className="w-8 h-8 text-primary" />
               Painel Administrativo
             </h1>
             <p className="text-muted-foreground">
               Gerencie sugestões de livros e reservas de mentoria
             </p>
           </div>
         </div>
 
         {/* Stats Cards */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="glass-card rounded-2xl p-4 text-center">
             <div className="text-2xl font-bold text-warning">{pendingSuggestions.length}</div>
             <p className="text-sm text-muted-foreground">Sugestões Pendentes</p>
           </div>
           <div className="glass-card rounded-2xl p-4 text-center">
             <div className="text-2xl font-bold text-success">{approvedSuggestions.length}</div>
             <p className="text-sm text-muted-foreground">Livros Aprovados</p>
           </div>
           <div className="glass-card rounded-2xl p-4 text-center">
             <div className="text-2xl font-bold text-info">{upcomingSessions.length}</div>
             <p className="text-sm text-muted-foreground">Mentorias Agendadas</p>
           </div>
           <div className="glass-card rounded-2xl p-4 text-center">
             <div className="text-2xl font-bold text-primary">{confirmedSessions.length}</div>
             <p className="text-sm text-muted-foreground">Confirmadas</p>
           </div>
         </div>
 
         {/* Main Content */}
         <Tabs defaultValue="suggestions" className="space-y-6">
           <TabsList className="grid w-full grid-cols-2 max-w-md">
             <TabsTrigger value="suggestions" className="gap-2">
               <BookOpen className="w-4 h-4" />
               Sugestões de Livros
             </TabsTrigger>
             <TabsTrigger value="mentorship" className="gap-2">
               <Calendar className="w-4 h-4" />
               Mentorias
             </TabsTrigger>
           </TabsList>
 
           {/* Book Suggestions Tab */}
           <TabsContent value="suggestions" className="space-y-6">
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold">Sugestões de Livros</h2>
               <Button variant="ghost" size="sm" onClick={refetchSuggestions}>
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Atualizar
               </Button>
             </div>
 
             {suggestionsLoading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <Skeleton key={i} className="h-24 w-full" />
                 ))}
               </div>
             ) : suggestions.length === 0 ? (
               <div className="glass-card rounded-2xl p-8 text-center">
                 <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground">Nenhuma sugestão de livro ainda</p>
               </div>
             ) : (
               <Tabs defaultValue="pending">
                 <TabsList>
                   <TabsTrigger value="pending">
                     Pendentes ({pendingSuggestions.length})
                   </TabsTrigger>
                   <TabsTrigger value="approved">
                     Aprovados ({approvedSuggestions.length})
                   </TabsTrigger>
                   <TabsTrigger value="rejected">
                     Rejeitados ({rejectedSuggestions.length})
                   </TabsTrigger>
                 </TabsList>
 
                 <TabsContent value="pending" className="space-y-3 mt-4">
                   {pendingSuggestions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sugestão pendente
                     </p>
                   ) : (
                     pendingSuggestions.map((s) => (
                       <SuggestionCard key={s.id} suggestion={s} />
                     ))
                   )}
                 </TabsContent>
 
                 <TabsContent value="approved" className="space-y-3 mt-4">
                   {approvedSuggestions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sugestão aprovada
                     </p>
                   ) : (
                     approvedSuggestions.map((s) => (
                       <SuggestionCard key={s.id} suggestion={s} />
                     ))
                   )}
                 </TabsContent>
 
                 <TabsContent value="rejected" className="space-y-3 mt-4">
                   {rejectedSuggestions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sugestão rejeitada
                     </p>
                   ) : (
                     rejectedSuggestions.map((s) => (
                       <SuggestionCard key={s.id} suggestion={s} />
                     ))
                   )}
                 </TabsContent>
               </Tabs>
             )}
           </TabsContent>
 
           {/* Mentorship Tab */}
           <TabsContent value="mentorship" className="space-y-6">
             <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold">Sessões de Mentoria</h2>
               <Button variant="ghost" size="sm" onClick={refetchSessions}>
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Atualizar
               </Button>
             </div>
 
             {sessionsLoading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <Skeleton key={i} className="h-24 w-full" />
                 ))}
               </div>
             ) : sessions.length === 0 ? (
               <div className="glass-card rounded-2xl p-8 text-center">
                 <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground">Nenhuma sessão de mentoria agendada</p>
               </div>
             ) : (
               <Tabs defaultValue="upcoming">
                 <TabsList>
                   <TabsTrigger value="upcoming">
                     Próximas ({upcomingSessions.length})
                   </TabsTrigger>
                   <TabsTrigger value="confirmed">
                     Confirmadas ({confirmedSessions.length})
                   </TabsTrigger>
                   <TabsTrigger value="past">
                     Histórico ({pastSessions.length})
                   </TabsTrigger>
                 </TabsList>
 
                 <TabsContent value="upcoming" className="space-y-3 mt-4">
                   {upcomingSessions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sessão agendada
                     </p>
                   ) : (
                     upcomingSessions.map((s) => (
                       <SessionCard key={s.id} session={s} />
                     ))
                   )}
                 </TabsContent>
 
                 <TabsContent value="confirmed" className="space-y-3 mt-4">
                   {confirmedSessions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sessão confirmada
                     </p>
                   ) : (
                     confirmedSessions.map((s) => (
                       <SessionCard key={s.id} session={s} />
                     ))
                   )}
                 </TabsContent>
 
                 <TabsContent value="past" className="space-y-3 mt-4">
                   {pastSessions.length === 0 ? (
                     <p className="text-muted-foreground text-center py-8">
                       Nenhuma sessão no histórico
                     </p>
                   ) : (
                     pastSessions.map((s) => (
                       <SessionCard key={s.id} session={s} />
                     ))
                   )}
                 </TabsContent>
               </Tabs>
             )}
           </TabsContent>
         </Tabs>
 
         {/* Action Modal */}
         <Dialog
           open={!!selectedSuggestion}
           onOpenChange={() => {
             setSelectedSuggestion(null);
             setAdminNotes("");
             setActionType(null);
           }}
         >
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 {actionType === "approve" ? "Aprovar" : "Rejeitar"} Sugestão
               </DialogTitle>
             </DialogHeader>
             <div className="py-4">
               {selectedSuggestion && (
                 <div className="p-4 rounded-xl bg-secondary/50 mb-4">
                   <h4 className="font-bold">{selectedSuggestion.title}</h4>
                   <p className="text-sm text-muted-foreground">
                     por {selectedSuggestion.author || "Autor não informado"}
                   </p>
                 </div>
               )}
               <label className="text-sm font-medium mb-2 block">
                 Notas (opcional)
               </label>
               <Textarea
                 placeholder="Adicione observações sobre esta decisão..."
                 value={adminNotes}
                 onChange={(e) => setAdminNotes(e.target.value)}
               />
             </div>
             <DialogFooter>
               <Button
                 variant="outline"
                 onClick={() => {
                   setSelectedSuggestion(null);
                   setAdminNotes("");
                   setActionType(null);
                 }}
               >
                 Cancelar
               </Button>
               <Button
                 variant={actionType === "approve" ? "hero" : "destructive"}
                 onClick={handleSuggestionAction}
               >
                 {actionType === "approve" ? (
                   <>
                     <Check className="w-4 h-4 mr-2" />
                     Aprovar
                   </>
                 ) : (
                   <>
                     <X className="w-4 h-4 mr-2" />
                     Rejeitar
                   </>
                 )}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
     </Layout>
   );
 };
 
 export default Admin;