import EduLayout from "./EduLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, FileQuestion, BookOpen, Trophy, Megaphone } from "lucide-react";

const EVENTS: Record<number, { icon: any; title: string; color: string }[]> = {
  3:  [{ icon: FileQuestion, title: "Quiz · 9º A",          color: "bg-accent/15 text-accent" }],
  7:  [{ icon: BookOpen,     title: "Meta semanal",         color: "bg-[hsl(220_90%_60%)]/15 text-[hsl(220_90%_70%)]" }],
  12: [{ icon: Trophy,       title: "Desafio finaliza",     color: "bg-[hsl(150_70%_50%)]/15 text-[hsl(150_70%_65%)]" }],
  15: [{ icon: FileQuestion, title: "Quiz ENEM",            color: "bg-accent/15 text-accent" },
       { icon: Megaphone,    title: "Aviso geral",          color: "bg-orange-500/15 text-orange-300" }],
  21: [{ icon: BookOpen,     title: "Início Cap. 4",        color: "bg-[hsl(270_80%_65%)]/15 text-[hsl(270_80%_75%)]" }],
  26: [{ icon: Trophy,       title: "Ranking semanal",      color: "bg-[hsl(150_70%_50%)]/15 text-[hsl(150_70%_65%)]" }],
};

const EduAgenda = () => {
  const today = new Date();
  const monthName = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  return (
    <EduLayout>
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em]">Agenda</p>
            <h1 className="text-2xl font-bold text-foreground">Calendário pedagógico</h1>
            <p className="text-sm text-muted-foreground mt-1">Visualize prazos, quizzes, leituras e desafios em um só lugar.</p>
          </div>
          <Button className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30">
            <Plus className="h-4 w-4 mr-1.5" />Novo evento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground capitalize">{monthName}</h3>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
                <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-muted-foreground mb-2 text-center">
              {["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                const events = day ? EVENTS[day] ?? [] : [];
                const isToday = day === today.getDate();
                return (
                  <div key={i} className={`min-h-[68px] rounded-lg p-1.5 text-left transition-colors ${
                    !day ? "bg-transparent" :
                    isToday ? "bg-accent/15 border border-accent/40" :
                    "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                  }`}>
                    {day && (
                      <>
                        <p className={`text-[11px] font-bold mb-1 ${isToday ? "text-accent" : "text-foreground/80"}`}>{day}</p>
                        <div className="space-y-0.5">
                          {events.slice(0, 2).map((e, j) => (
                            <div key={j} className={`flex items-center gap-1 text-[9px] px-1 py-0.5 rounded ${e.color} truncate`}>
                              <e.icon className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate font-semibold">{e.title}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Próximos */}
          <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
            <h3 className="text-base font-bold text-foreground mb-4">Próximos eventos</h3>
            <div className="space-y-3">
              {Object.entries(EVENTS).flatMap(([day, evs]) =>
                evs.map((e, i) => (
                  <div key={`${day}-${i}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition">
                    <div className={`p-2 rounded-lg ${e.color} shrink-0`}><e.icon className="h-3.5 w-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground">Dia {day} · {monthName}</p>
                    </div>
                  </div>
                ))
              ).slice(0, 6)}
            </div>
          </div>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduAgenda;
