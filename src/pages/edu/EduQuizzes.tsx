import EduLayout from "./EduLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileQuestion, Copy, Send, BarChart3, CheckCircle2, Target, Brain } from "lucide-react";

const QUIZZES = [
  { title: "Interpretação · Cap. 1-3", questions: 8,  difficulty: "Fácil",   participation: 92, accuracy: 78 },
  { title: "Vocabulário literário",     questions: 12, difficulty: "Médio",   participation: 84, accuracy: 65 },
  { title: "Análise do narrador",       questions: 6,  difficulty: "Difícil", participation: 71, accuracy: 52 },
  { title: "Quiz ENEM — figuras",       questions: 10, difficulty: "Médio",   participation: 88, accuracy: 70 },
];

const Bar = ({ value, color = "bg-accent" }: { value: number; color?: string }) => (
  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
  </div>
);

const EduQuizzes = () => (
  <EduLayout>
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.25em]">Quizzes</p>
          <h1 className="text-2xl font-bold text-foreground">Banco de quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">Crie, reutilize e compare desempenho entre turmas com analytics em tempo real.</p>
        </div>
        <Button className="bg-gradient-to-r from-accent to-[hsl(48_96%_60%)] text-accent-foreground font-bold hover:brightness-110 hover:scale-[1.03] transition-all shadow-lg shadow-accent/30">
          <Plus className="h-4 w-4 mr-1.5" />Novo quiz
        </Button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileQuestion, label: "Quizzes ativos",     value: "12" },
          { icon: CheckCircle2, label: "Aplicações",          value: "186" },
          { icon: Target,        label: "Taxa média acertos", value: "74%" },
          { icon: Brain,         label: "Dificuldade média",  value: "Médio" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-card/40 backdrop-blur-xl p-4">
            <s.icon className="h-4 w-4 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-accent" />Performance por quiz
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {QUIZZES.map((q) => (
            <div key={q.title} className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 hover:border-accent/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-foreground">{q.title}</p>
                  <p className="text-[11px] text-muted-foreground">{q.questions} questões · {q.difficulty}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition" title="Duplicar"><Copy className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition" title="Aplicar"><Send className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">Participação</span><span className="text-foreground font-bold">{q.participation}%</span></div>
                  <Bar value={q.participation} color="bg-gradient-to-r from-[hsl(220_90%_60%)] to-[hsl(220_90%_70%)]" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">Acertos</span><span className="text-accent font-bold">{q.accuracy}%</span></div>
                  <Bar value={q.accuracy} color="bg-gradient-to-r from-accent to-[hsl(48_96%_70%)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </EduLayout>
);

export default EduQuizzes;
