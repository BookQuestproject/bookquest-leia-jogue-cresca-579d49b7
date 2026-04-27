import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, BookOpen, Clock,
  Bus, Moon, Sun, GraduationCap, MoreHorizontal, Target, Trophy, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { demoReadingPrepStore, useDemoReadingPrep } from "@/hooks/useDemoReadingPrep";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, label: "Quebrar o medo" },
  { id: 2, label: "Seu horário" },
  { id: 3, label: "Como ler" },
  { id: 4, label: "Primeira missão" },
];

const FEAR_CARDS = [
  { emoji: "⏱️", title: "Ler 10 minutos já conta", text: "Pequenos passos fazem toda a diferença." },
  { emoji: "🤷", title: "Você não precisa entender tudo", text: "É normal não captar 100% — siga em frente." },
  { emoji: "🛑", title: "Parar com vontade de continuar é ótimo", text: "Significa que o livro te conquistou." },
  { emoji: "🏋️", title: "Ler é treino, não prova", text: "Quanto mais você lê, mais fácil fica." },
];

const MOMENT_OPTIONS = [
  { id: "before_sleep", label: "Antes de dormir", icon: Moon },
  { id: "after_school", label: "Depois da escola", icon: GraduationCap },
  { id: "transport", label: "No transporte", icon: Bus },
  { id: "after_lunch", label: "Depois do almoço", icon: Sun },
  { id: "other", label: "Outro horário", icon: MoreHorizontal },
];

const READING_RULES = [
  { id: "rule1", text: "Se não entender → continue lendo." },
  { id: "rule2", text: "Se tiver palavra difícil → ignore (você pode anotar depois)." },
  { id: "rule3", text: "Se o capítulo for longo → divida em partes menores." },
];

interface Props {
  /** Quando o aluno conclui o guia. */
  onFinish: () => void;
  /** Permite fechar sem concluir (apenas quando exibido pelo menu, não no primeiro acesso). */
  onClose?: () => void;
  /** Reinicia ao abrir (revisita pelo menu). */
  reviewMode?: boolean;
}

export default function ReadingPrepGuide({ onFinish, onClose, reviewMode }: Props) {
  const prep = useDemoReadingPrep();
  const { toast } = useToast();
  const [step, setStep] = useState(reviewMode ? 1 : prep.completed ? 4 : 1);
  const [selectedMoment, setSelectedMoment] = useState<string | undefined>(prep.readingMoment);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [missionDone, setMissionDone] = useState(prep.completed);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const allRulesChecked = READING_RULES.every((r) => checked[r.id]);

  const goNext = () => {
    if (step === 2 && selectedMoment) {
      demoReadingPrepStore.setMoment(selectedMoment);
    }
    if (step < 4) setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleCompleteMission = () => {
    demoReadingPrepStore.complete();
    setMissionDone(true);
    toast({
      title: "🎉 Primeira missão concluída!",
      description: "Bem-vindo ao seu painel — agora vamos para o livro da turma.",
    });
    setTimeout(onFinish, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-br from-primary via-primary/95 to-accent/40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">Preparação para Leitura</p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Etapa {step} de {STEPS.length} · {STEPS[step - 1].label}
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar guia">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <header className="text-center space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-background tracking-tight">
                    Antes de começar o livro da sua turma…
                  </h1>
                  <p className="text-background/80 text-sm lg:text-base">
                    Vamos te ajudar a criar seu hábito de leitura. Leva menos de 5 minutos.
                  </p>
                </header>

                <div className="grid sm:grid-cols-2 gap-3">
                  {FEAR_CARDS.map((c) => (
                    <Card key={c.title} className="bg-background/95 backdrop-blur border-border">
                      <CardContent className="p-4 space-y-1">
                        <div className="text-2xl">{c.emoji}</div>
                        <p className="text-sm font-bold text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <header className="text-center space-y-2">
                  <Clock className="h-10 w-10 mx-auto text-accent" />
                  <h1 className="text-2xl lg:text-3xl font-bold text-background tracking-tight">
                    Quando a leitura cabe melhor no seu dia?
                  </h1>
                  <p className="text-background/80 text-sm">
                    Escolha um horário fixo — leitores consistentes lêem no mesmo momento.
                  </p>
                </header>

                <div className="grid sm:grid-cols-2 gap-3">
                  {MOMENT_OPTIONS.map((m) => {
                    const Icon = m.icon;
                    const active = selectedMoment === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMoment(m.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          active
                            ? "bg-accent text-accent-foreground border-accent shadow-lg scale-[1.02]"
                            : "bg-background/95 border-border hover:border-accent/60"
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-semibold text-sm">{m.label}</span>
                        {active && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <header className="text-center space-y-2">
                  <BookOpen className="h-10 w-10 mx-auto text-accent" />
                  <h1 className="text-2xl lg:text-3xl font-bold text-background tracking-tight">
                    Como ler sem travar
                  </h1>
                  <p className="text-background/80 text-sm">
                    Marque cada regra abaixo para entender — você pode revisar depois.
                  </p>
                </header>

                <div className="space-y-2">
                  {READING_RULES.map((r) => {
                    const c = !!checked[r.id];
                    return (
                      <button
                        key={r.id}
                        onClick={() => setChecked((p) => ({ ...p, [r.id]: !p[r.id] }))}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          c
                            ? "bg-success/15 border-success text-foreground"
                            : "bg-background/95 border-border hover:border-accent/60"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center border-2 flex-shrink-0 ${
                            c ? "bg-success border-success text-background" : "border-border"
                          }`}
                        >
                          {c && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-sm font-medium">{r.text}</span>
                      </button>
                    );
                  })}
                </div>

                <Card className="bg-background/95 border-accent/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-serif italic text-foreground">
                      "Leitores não são perfeitos. Eles são consistentes."
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center">
                  <Target className="h-10 w-10 text-accent" />
                </div>
                <header className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-background tracking-tight">
                    Sua primeira missão
                  </h1>
                  <p className="text-background/80 text-sm">
                    Antes de entrar no painel, vamos definir seu primeiro objetivo.
                  </p>
                </header>

                <Card className="bg-background/95 border-accent/40 max-w-md mx-auto">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Missão inicial</span>
                    </div>
                    <p className="text-lg font-serif text-foreground">
                      Leia por <strong>10 minutos</strong> hoje.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pode ser o livro da turma, uma revista, um conto curto — qualquer coisa.
                    </p>

                    {!missionDone ? (
                      <Button
                        size="lg"
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={handleCompleteMission}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Concluí a missão — entrar no painel
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-success font-semibold">
                        <CheckCircle2 className="h-5 w-5" />
                        Missão concluída!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer com navegação */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={goPrev} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  s.id <= step ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
          {step < 4 ? (
            <Button
              size="sm"
              onClick={goNext}
              disabled={(step === 2 && !selectedMoment) || (step === 3 && !allRulesChecked)}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <span className="w-[110px]" />
          )}
        </div>
      </div>
    </div>
  );
}
