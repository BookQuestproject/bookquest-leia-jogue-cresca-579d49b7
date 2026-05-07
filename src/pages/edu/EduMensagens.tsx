import EduLayout from "./EduLayout";
import { Button } from "@/components/ui/button";
import { Megaphone, Send, Search, Users, Bell } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";

const EduMensagens = () => {
  const { classes } = useClasses();
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const active = classes.find(c => c.id === selected) ?? classes[0];

  return (
    <EduLayout>
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em]">Mensagens</p>
          <h1 className="text-2xl font-bold text-foreground">Comunicação com turmas</h1>
          <p className="text-sm text-muted-foreground mt-1">Envie avisos, lembretes e mensagens diretas para suas turmas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[480px]">
          {/* Lista de turmas */}
          <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-4">
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-white/5 border border-white/10">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Buscar…" className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    (selected ?? classes[0]?.id) === c.id ? "bg-accent/10 border border-accent/30" : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
                    <span className="text-[10px] text-muted-foreground">{c.access_code}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">Última mensagem · há 2h</p>
                </button>
              ))}
              {classes.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Crie uma turma para enviar mensagens.</p>
              )}
            </div>
          </div>

          {/* Chat / aviso */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/15 text-accent"><Users className="h-4 w-4" /></div>
                <div>
                  <p className="font-bold text-foreground">{active?.name ?? "Selecione uma turma"}</p>
                  <p className="text-[11px] text-muted-foreground">{active ? `${active.grade ?? "Turma"} · alunos` : "—"}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10"><Bell className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {[
                { from: "Você",  text: "Bom dia! Lembrem-se de finalizar o capítulo 3 até quinta.", time: "ontem · 09:12" },
                { from: "Maria", text: "Professor, posso entregar o resumo na sexta?",              time: "ontem · 14:30" },
                { from: "Você",  text: "Sim, sem problemas. Mas tente até quinta se possível.",     time: "ontem · 14:45" },
              ].map((m, i) => (
                <div key={i} className={`max-w-[80%] ${m.from === "Você" ? "ml-auto" : ""}`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    m.from === "Você" ? "bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 text-foreground" : "bg-white/5 border border-white/10 text-foreground"
                  }`}>
                    <p className="text-[10px] font-bold opacity-70 mb-0.5">{m.from}</p>
                    <p className="text-sm">{m.text}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-2">{m.time}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-end gap-2">
                <button className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition" title="Enviar como aviso">
                  <Megaphone className="h-4 w-4" />
                </button>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={1}
                  placeholder="Escreva uma mensagem ou aviso…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/40 resize-none"
                />
                <Button className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 transition shadow-lg shadow-accent/30">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduMensagens;
