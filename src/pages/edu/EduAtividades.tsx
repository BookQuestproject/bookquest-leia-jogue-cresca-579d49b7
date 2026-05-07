import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Filter, ListChecks, BookMarked, Megaphone, Layers, Trophy, FileQuestion,
  Copy, Send, MoreVertical, CheckCircle2, Clock, Calendar,
} from "lucide-react";

const TEMPLATES = [
  { icon: BookMarked,  title: "Resumo de capítulo",   desc: "Síntese guiada · 20 min",   xp: 50,  tag: "Leitura" },
  { icon: Megaphone,   title: "Debate literário",     desc: "Discussão em grupo · 45 min", xp: 80, tag: "Discussão" },
  { icon: Layers,      title: "Leitura semanal",      desc: "Meta de páginas · 7 dias",  xp: 120, tag: "Meta" },
  { icon: FileQuestion,title: "Interpretação ENEM",   desc: "5 questões · 15 min",       xp: 60,  tag: "Quiz" },
  { icon: Trophy,      title: "Desafio literário",    desc: "Competitivo · 1 semana",    xp: 200, tag: "Desafio" },
  { icon: ListChecks,  title: "Check-in diário",      desc: "Páginas lidas · 2 min",     xp: 15,  tag: "Hábito" },
];

const STATUS = [
  { label: "Ativas",     count: 8, color: "from-[hsl(150_70%_50%/0.2)] to-transparent border-[hsl(150_70%_50%/0.3)]", icon: CheckCircle2 },
  { label: "Agendadas",  count: 3, color: "from-[hsl(220_90%_60%/0.2)] to-transparent border-[hsl(220_90%_60%/0.3)]", icon: Calendar },
  { label: "Aguardando", count: 5, color: "from-[hsl(48_96%_55%/0.2)] to-transparent border-accent/30",                icon: Clock },
  { label: "Concluídas", count: 24,color: "from-white/5 to-transparent border-white/10",                                 icon: ListChecks },
];

const EduAtividades = () => {
  const { classes } = useClasses();

  return (
    <EduLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em]">Atividades</p>
            <h1 className="text-2xl font-bold text-foreground">Central de atividades</h1>
            <p className="text-sm text-muted-foreground mt-1">Crie, agende e duplique atividades para múltiplas turmas em segundos.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Buscar atividade…" className="bg-transparent outline-none text-sm w-48 text-foreground placeholder:text-muted-foreground" />
            </div>
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition">
              <Filter className="h-4 w-4" />
            </button>
            <Button className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30">
              <Plus className="h-4 w-4 mr-1.5" />Nova atividade
            </Button>
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUS.map((s) => (
            <div key={s.label} className={`rounded-xl border bg-gradient-to-br ${s.color} backdrop-blur-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-4 w-4 text-foreground/80" />
                <span className="text-[10px] text-muted-foreground">esta semana</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Templates */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-accent" />Templates prontos
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Comece de um modelo e personalize em segundos.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <div key={t.title} className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 hover:border-accent/40 hover:bg-white/[0.07] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">+{t.xp} XP</span>
                </div>
                <p className="text-sm font-bold text-foreground">{t.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 text-[11px] font-semibold text-accent-foreground bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] rounded-lg py-1.5 hover:brightness-110 transition flex items-center justify-center gap-1">
                    <Send className="h-3 w-3" />Usar
                  </button>
                  <button className="text-[11px] font-semibold text-foreground/80 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 hover:bg-white/10 transition flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities table */}
        <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
          <h3 className="text-base font-bold text-foreground mb-4">Atividades recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
                  <th className="py-2 font-semibold">Título</th>
                  <th className="py-2 font-semibold">Turma</th>
                  <th className="py-2 font-semibold">Tipo</th>
                  <th className="py-2 font-semibold">Prazo</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: "Resumo Cap. 3 — Dom Casmurro", type: "Leitura", deadline: "Hoje · 22h", status: "Ativa" },
                  { title: "Quiz semanal — interpretação", type: "Quiz",    deadline: "Quinta · 18h", status: "Agendada" },
                  { title: "Debate sobre o narrador",      type: "Discussão",deadline: "Sexta · 14h", status: "Aguardando" },
                  { title: "Meta — 50 páginas/semana",     type: "Meta",    deadline: "Domingo",     status: "Ativa" },
                ].map((row, i) => {
                  const cls = classes[i % Math.max(classes.length, 1)];
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 font-semibold text-foreground">{row.title}</td>
                      <td className="py-3 text-muted-foreground">{cls?.name ?? "—"}</td>
                      <td className="py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">{row.type}</span></td>
                      <td className="py-3 text-muted-foreground">{row.deadline}</td>
                      <td className="py-3">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                          row.status === "Ativa" ? "bg-[hsl(150_70%_50%/0.15)] text-[hsl(150_70%_65%)]" :
                          row.status === "Agendada" ? "bg-[hsl(220_90%_60%/0.15)] text-[hsl(220_90%_70%)]" :
                          "bg-accent/15 text-accent"
                        }`}>{row.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduAtividades;
