import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReadingPlan } from "@/hooks/useReadingPlan";
import { BookOpen, Clock, Calendar, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReadingPlanSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  totalPages: number;
}

export const ReadingPlanSetup = ({ open, onOpenChange, bookId, bookTitle, totalPages }: ReadingPlanSetupProps) => {
  const { createPlan } = useReadingPlan();
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const options = [
    { minutes: 10, label: "10 min/dia", emoji: "🌱", desc: "Ritmo leve — ideal para iniciantes" },
    { minutes: 20, label: "20 min/dia", emoji: "📖", desc: "Ritmo moderado — consistente e eficaz" },
    { minutes: 30, label: "30 min/dia", emoji: "🚀", desc: "Ritmo acelerado — para leitores dedicados" },
  ];

  const dailyPages = selectedMinutes ? Math.max(1, Math.round(selectedMinutes * 0.5)) : 0;
  const totalDays = dailyPages > 0 ? Math.ceil(totalPages / dailyPages) : 0;

  const handleCreate = async () => {
    if (!selectedMinutes) return;
    setCreating(true);
    await createPlan({ bookId, bookTitle, totalPages, dailyMinutes: selectedMinutes });
    setCreating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            Leitura Guiada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-foreground font-medium">{bookTitle}</p>
            <p className="text-xs text-muted-foreground">{totalPages} páginas</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Quanto tempo você tem por dia para ler?</p>
            <div className="grid grid-cols-1 gap-2">
              {options.map(opt => (
                <button
                  key={opt.minutes}
                  onClick={() => setSelectedMinutes(opt.minutes)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedMinutes === opt.minutes
                      ? "border-accent bg-accent/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMinutes && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Seu plano personalizado</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedMinutes} min/dia
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  ~{dailyPages} pág/dia
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  ~{totalDays} dias
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={!selectedMinutes || creating}>
            {creating ? "Criando..." : "Criar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ReadingPlanCard = () => {
  const { plans, loading, advanceDay, deletePlan, getActivePlan } = useReadingPlan();
  const plan = getActivePlan();

  if (loading || !plan) return null;

  const totalDays = Math.ceil(plan.total_pages / plan.daily_pages);
  const progressPct = Math.min((plan.current_day / totalDays) * 100, 100);
  const startPage = (plan.current_day - 1) * plan.daily_pages + 1;
  const endPage = Math.min(plan.current_day * plan.daily_pages, plan.total_pages);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Leitura Guiada</h3>
          <button onClick={() => deletePlan(plan.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">{plan.book_title}</p>
          <p className="text-xs text-muted-foreground">
            Dia {plan.current_day} de {totalDays}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground">📖 Leia hoje:</p>
          <p className="text-sm font-semibold text-foreground">
            Páginas {startPage}–{endPage}
          </p>
          <p className="text-xs text-muted-foreground">~{plan.daily_minutes} minutos</p>
        </div>

        <div className="space-y-1.5">
          <div className="h-1.5 rounded-full overflow-hidden bg-muted/60">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-right">
            {Math.round(progressPct)}% concluído
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => advanceDay(plan.id)}
          className="w-full"
        >
          <ChevronRight className="h-4 w-4 mr-1" />
          Concluir dia {plan.current_day}
        </Button>
      </CardContent>
    </Card>
  );
};
