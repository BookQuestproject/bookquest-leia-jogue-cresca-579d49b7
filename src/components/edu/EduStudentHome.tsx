import { BookOpen, BarChart3, ClipboardList, Flame, Megaphone, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
  studentName: string;
  className: string;
  bookTitle: string | null;
  author: string | null;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  pendingActivities: number;
  essencia: number;
  streak: number;
  rank: number;
  daysRemaining: number;
  dailyGoal: number;
  onContinueReading: () => void;
  onActivities: () => void;
  onStats: () => void;
  onAnnouncements: () => void;
};

const nextCheckpoint = (percent: number) => {
  if (percent < 25) return 25;
  if (percent < 50) return 50;
  if (percent < 75) return 75;
  if (percent < 100) return 100;
  return 100;
};

const EduStudentHome = ({
  studentName,
  className,
  bookTitle,
  author,
  currentPage,
  totalPages,
  progressPercent,
  pendingActivities,
  essencia,
  streak,
  rank,
  daysRemaining,
  dailyGoal,
  onContinueReading,
  onActivities,
  onStats,
  onAnnouncements,
}: Props) => {
  const checkpoint = nextCheckpoint(progressPercent);
  const checkpointPage = totalPages ? Math.ceil(totalPages * checkpoint / 100) : 0;
  const remainingToCheckpoint = Math.max(0, checkpointPage - currentPage);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">BookQuest EDU</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-2">
          Olá, {studentName.split(" ")[0]}.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
          Você está em <span className="font-semibold text-foreground">{className}</span>. O próximo passo está aqui.
        </p>
      </header>

      <section className="rounded-[28px] border border-primary/20 bg-card shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid gap-7 lg:grid-cols-[1.35fr_0.8fr] items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <BookOpen className="h-4 w-4" /> Sua jornada
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mt-3">
                {bookTitle || "A próxima leitura começa aqui."}
              </h2>
              {author && <p className="text-sm text-muted-foreground mt-1">{author}</p>}

              <div className="mt-7 max-w-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Seu progresso</span>
                  <span className="font-bold text-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
                <div className="flex items-center justify-between gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Página {currentPage}{totalPages ? ` de ${totalPages}` : ""}</span>
                  {dailyGoal > 0 && <span>Meta: {dailyGoal} pág./dia</span>}
                </div>
              </div>

              <div className="mt-7">
                <Button size="lg" onClick={onContinueReading} className="gap-2 h-12 px-6">
                  <BookOpen className="h-4 w-4" /> {currentPage > 0 ? "Continuar leitura" : "Começar leitura"}
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-muted/25 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-accent" /> Próximo marco
              </div>
              <p className="text-lg font-bold mt-3">
                {progressPercent >= 100 ? "Livro concluído" : `Chegar a ${checkpoint}%`}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {progressPercent >= 100
                  ? "Sua leitura chegou ao fim. O próximo passo é explorar o que você construiu."
                  : totalPages
                    ? `${remainingToCheckpoint} páginas até o próximo marco.`
                    : "Continue registrando a leitura para acompanhar seu avanço."}
              </p>
              <div className="mt-5 h-px bg-border" />
              <p className="text-xs text-muted-foreground mt-4">
                {daysRemaining > 0 ? `${daysRemaining} dias restantes para a meta da turma.` : "Acompanhe o ritmo definido pela turma."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Seu progresso</p>
            <h2 className="text-lg font-bold mt-1">O que você já construiu</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [Sparkles, essencia, "Essência"],
            [Flame, streak, "Sequência"],
            [Trophy, rank > 0 ? `#${rank}` : "—", "Posição na turma"],
            [ClipboardList, pendingActivities, "Pendências"],
          ].map(([Icon, value, label]: any) => (
            <div key={label} className="rounded-2xl border border-border bg-card px-4 py-4">
              <Icon className="h-4 w-4 text-primary" />
              <p className="text-2xl font-bold mt-3">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Acesso rápido</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={onActivities} className="gap-2">
            <ClipboardList className="h-4 w-4" /> Atividades {pendingActivities > 0 ? `· ${pendingActivities}` : ""}
          </Button>
          <Button variant="outline" onClick={onStats} className="gap-2">
            <BarChart3 className="h-4 w-4" /> Ver evolução
          </Button>
          <Button variant="outline" onClick={onAnnouncements} className="gap-2">
            <Megaphone className="h-4 w-4" /> Avisos da turma
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EduStudentHome;
