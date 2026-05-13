import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight, Clock, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface StudentAlert {
  user_id: string;
  class_id: string;
  class_name: string;
  full_name: string;
  reason: "inactive" | "behind" | "noread";
  meta: string; // "5 dias sem ler"
}

const reasonCfg = {
  inactive: { icon: UserX,        cls: "text-destructive bg-destructive/10",                       label: "Inativo" },
  behind:   { icon: AlertTriangle,cls: "text-[hsl(48_96%_65%)] bg-[hsl(48_96%_55%/0.10)]",        label: "Atrasado" },
  noread:   { icon: Clock,        cls: "text-[hsl(217_91%_75%)] bg-[hsl(217_91%_60%/0.10)]",      label: "Sem leitura hoje" },
};

interface Props {
  students: StudentAlert[];
  query?: string;
}

export const StudentsAlertList = ({ students, query = "" }: Props) => {
  const navigate = useNavigate();
  const filtered = query
    ? students.filter(s => s.full_name.toLowerCase().includes(query.toLowerCase()))
    : students;
  const top = filtered.slice(0, 8);

  return (
    <Card className="bg-[hsl(230_50%_9%/0.7)] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[hsl(48_96%_60%)]" />
          Alunos em alerta
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-muted-foreground">
            {filtered.length}
          </span>
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => navigate("/edu/turmas")} className="h-7 text-[11px] gap-1">
          Ver todos <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {top.length === 0 ? (
          <div className="text-center py-10">
            <div className="h-10 w-10 rounded-full bg-[hsl(142_71%_45%/0.12)] grid place-items-center mx-auto mb-2">
              <ChevronRight className="h-5 w-5 text-[hsl(142_71%_60%)]" />
            </div>
            <p className="text-xs text-muted-foreground">Nenhum aluno precisando de atenção 🎉</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {top.map((s) => {
              const cfg = reasonCfg[s.reason];
              const Icon = cfg.icon;
              const initials = s.full_name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
              return (
                <li
                  key={`${s.class_id}-${s.user_id}`}
                  onClick={() => navigate(`/edu/turmas/${s.class_id}`)}
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] grid place-items-center text-[10px] font-bold text-foreground/80 shrink-0">
                    {initials || "AL"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-foreground truncate">{s.full_name}</p>
                    <p className="text-[10.5px] text-muted-foreground truncate">{s.class_name} · {s.meta}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${cfg.cls}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsAlertList;
