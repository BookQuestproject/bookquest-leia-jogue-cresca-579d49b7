import { useState, useEffect } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { useEduEngagement } from "@/hooks/useEduEngagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Megaphone, Send, Pin, Loader2 } from "lucide-react";

const EduComunicacao = () => {
  const { classes, loading } = useClasses();
  const active = classes.filter(c => !c.is_archived);
  const [classId, setClassId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!classId && active.length) setClassId(active[0].id);
  }, [active, classId]);

  const selected = active.find(c => c.id === classId);
  const { announcements, createAnnouncement } = useEduEngagement(classId ?? undefined);

  const send = async () => {
    if (!msg.trim()) return;
    await createAnnouncement(msg);
    setMsg("");
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><MessageCircle className="h-6 w-6 text-accent" />Comunicação</h1>
          <p className="text-sm text-muted-foreground">Envie avisos para sua turma. Os alunos veem na aba "Avisos" do app.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <Card className="bg-card border-border h-fit">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Turmas</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {active.map(c => (
                <button key={c.id} onClick={() => setClassId(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${classId === c.id ? "bg-accent/15 text-foreground border border-accent/30" : "text-muted-foreground hover:bg-muted"}`}>
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.book_title ?? "Sem livro"}</p>
                </button>
              ))}
              {!loading && active.length === 0 && <p className="text-xs text-muted-foreground p-3">Nenhuma turma ainda.</p>}
            </CardContent>
          </Card>

          <Card className="bg-card border-border min-h-[500px]">
            {!selected ? (
              <CardContent className="h-[500px] flex flex-col items-center justify-center text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Selecione uma turma</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-accent" />Mural de avisos · {selected.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {announcements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Nenhum aviso enviado ainda.</p>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-accent/[0.06] border border-accent/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Pin className="h-3 w-3 text-accent" />
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {new Date(a.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{a.content}</p>
                      </div>
                    ))
                  )}

                  <div className="pt-2">
                    <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Novo aviso para a turma..." rows={3} />
                    <div className="flex justify-end mt-2">
                      <Button onClick={send} disabled={!msg.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5">
                        <Send className="h-3.5 w-3.5" />Publicar aviso
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduComunicacao;
