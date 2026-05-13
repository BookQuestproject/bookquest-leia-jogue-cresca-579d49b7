import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { BookOpen, Users, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type ClassCardStatus = "ahead" | "ontrack" | "risk" | "idle";

interface Props {
  id: string;
  name: string;
  bookTitle?: string | null;
  studentsCount: number;
  avgProgress: number; // 0..100
  avgPage?: number | null;
  totalPages?: number | null;
  status: ClassCardStatus;
  spark: number[]; // weekly pages avg
}

const statusMeta: Record<ClassCardStatus, { label: string; icon: any; cls: string }> = {
  ahead:    { label: "Adiantada", icon: TrendingUp,    cls: "text-[hsl(142_71%_60%)] bg-[hsl(142_71%_45%/0.12)]" },
  ontrack:  { label: "No ritmo",  icon: CheckCircle2,  cls: "text-[hsl(48_96%_60%)] bg-[hsl(48_96%_55%/0.12)]" },
  risk:     { label: "Em risco",  icon: AlertTriangle, cls: "text-destructive bg-destructive/10" },
  idle:     { label: "Sem livro", icon: BookOpen,      cls: "text-muted-foreground bg-white/[0.04]" },
};

export const ClassCard = ({ id, name, bookTitle, studentsCount, avgProgress, avgPage, totalPages, status, spark }: Props) => {
  const navigate = useNavigate();
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const data = spark.map((v, i) => ({ i, v }));

  return (
    <Card
      onClick={() => navigate(`/edu/turmas/${id}`)}
      className="group cursor-pointer bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl hover:border-accent/30 transition-all"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
              <BookOpen className="h-3 w-3" />
              {bookTitle || "Sem livro definido"}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
        </div>

        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-3xl font-bold tabular-nums text-foreground">{Math.round(avgProgress)}<span className="text-base text-muted-foreground">%</span></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">progresso médio</p>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`s-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(48 96% 60%)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(48 96% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="hsl(48 96% 60%)" strokeWidth={1.5} fill={`url(#s-${id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-accent to-[hsl(48_96%_70%)]" style={{ width: `${Math.min(100, avgProgress)}%` }} />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" /> {studentsCount} alunos
          </span>
          {avgPage != null && totalPages != null && (
            <span className="text-muted-foreground tabular-nums">pg {avgPage}/{totalPages}</span>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${meta.cls}`}>
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
