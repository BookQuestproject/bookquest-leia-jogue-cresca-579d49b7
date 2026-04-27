import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Mail, GraduationCap } from "lucide-react";

interface BookRequest {
  id: string;
  requested_by: string;
  class_id: string | null;
  title: string;
  author: string;
  school_name: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export const AdminBookRequestsPanel = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("book_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro", description: "Falha ao carregar solicitações.", variant: "destructive" });
    } else {
      setRequests(((data as any) ?? []) as BookRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("book_requests" as any)
      .update({
        status,
        admin_notes: notesById[id] ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Falha ao atualizar.", variant: "destructive" });
      return;
    }
    toast({ title: status === "approved" ? "Aprovada" : "Rejeitada" });
    fetchRequests();
  };

  const pending = requests.filter(r => r.status === "pending");
  const reviewed = requests.filter(r => r.status !== "pending");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Solicitações de novos livros — Pendentes ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-sm text-muted-foreground">por {r.author}</p>
                      {r.school_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <GraduationCap className="h-3 w-3" />
                          {r.school_name}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                  {r.notes && <p className="text-sm bg-muted/50 p-2 rounded">{r.notes}</p>}
                  <Textarea
                    placeholder="Notas do admin (opcional)"
                    rows={2}
                    value={notesById[r.id] ?? ""}
                    onChange={(e) => setNotesById({ ...notesById, [r.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(r.id, "approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {reviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico ({reviewed.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewed.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-2 border rounded text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.title} — {r.author}</p>
                    {r.admin_notes && <p className="text-xs text-muted-foreground truncate">{r.admin_notes}</p>}
                  </div>
                  <Badge variant={r.status === "approved" ? "default" : "secondary"}>
                    {r.status === "approved" ? "Aprovada" : "Rejeitada"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
