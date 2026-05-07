import { useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Megaphone, Send, Pin, Users } from "lucide-react";
import { toast } from "sonner";

const EduComunicacao = () => {
  const { classes, loading } = useClasses();
  const active = classes.filter(c => c.is_active);
  const [classId, setClassId] = useState<string | null>(null);
  const [tab, setTab] = useState<"mural" | "turma" | "individual">("mural");
  const [msg, setMsg] = useState("");
  const [studentIdx, setStudentIdx] = useState<number | null>(null);

  const selected = active.find(c => c.id === classId);
  const students = ["Lucas Ferreira", "Mariana Souza", "Pedro Alves", "Ana Beatriz", "Rafael Lima", "Júlia Costa"];

  const send = () => {
    if (!msg.trim()) return;
    toast.success("Mensagem enviada");
    setMsg("");
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><MessageCircle className="h-6 w-6 text-accent" />Comunicação</h1>
          <p className="text-sm text-muted-foreground">Envie avisos para a turma ou mensagens individuais aos alunos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Class list */}
          <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl h-fit">
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Turmas</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {loading && <p className="text-xs text-muted-foreground">Carregando...</p>}
              {active.map(c => (
                <button key={c.id} onClick={() => { setClassId(c.id); setTab("mural"); setStudentIdx(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${classId === c.id ? "bg-accent/15 text-foreground border border-accent/30" : "text-muted-foreground hover:bg-white/5"}`}>
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.book_title ?? "Sem livro"}</p>
                </button>
              ))}
              {!loading && active.length === 0 && <p className="text-xs text-muted-foreground p-3">Nenhuma turma ainda.</p>}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl min-h-[500px]">
            {!selected ? (
              <CardContent className="h-[500px] flex flex-col items-center justify-center text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Selecione uma turma para começar</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-base">{selected.name}</CardTitle>
                    <div className="flex gap-1">
                      {[
                        { id: "mural",      label: "Mural",       icon: Pin },
                        { id: "turma",      label: "Para turma",  icon: Megaphone },
                        { id: "individual", label: "Individual",  icon: Users },
                      ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${tab === t.id ? "bg-accent text-accent-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}>
                          <t.icon className="h-3 w-3" />{t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {tab === "mural" && (
                    <div className="space-y-2">
                      {[
                        { title: "Leitura Cap. 5 até sexta", body: "Lembrem-se de responder a pergunta de reflexão.", date: "ontem" },
                        { title: "Reunião na biblioteca",     body: "Quinta às 14h.",                                   date: "há 3 dias" },
                      ].map((p, i) => (
                        <div key={i} className="p-3 rounded-lg bg-accent/[0.06] border border-accent/20">
                          <div className="flex items-center gap-2 mb-1"><Pin className="h-3 w-3 text-accent" /><p className="text-sm font-semibold text-foreground">{p.title}</p></div>
                          <p className="text-xs text-muted-foreground">{p.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{p.date}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "individual" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {students.map((s, i) => (
                        <button key={i} onClick={() => setStudentIdx(i)}
                          className={`p-2.5 rounded-lg text-left text-xs border transition ${studentIdx === i ? "border-accent bg-accent/10" : "border-white/10 hover:bg-white/5 text-muted-foreground"}`}>
                          <p className="font-semibold text-foreground truncate">{s}</p>
                          <p className="text-[10px] text-muted-foreground">aluno</p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={
                      tab === "mural" ? "Novo aviso fixado no mural..." :
                      tab === "turma" ? "Mensagem para toda a turma..." :
                      studentIdx !== null ? `Mensagem para ${students[studentIdx]}...` : "Selecione um aluno acima"
                    } rows={3} className="bg-white/[0.03] border-white/10" />
                    <div className="flex justify-end mt-2">
                      <Button onClick={send} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"><Send className="h-3.5 w-3.5" />Enviar</Button>
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
