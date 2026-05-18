import { Bell, Plus, Search, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface ClassOpt { id: string; name: string }

interface Props {
  teacherName?: string | null;
  schoolName?: string | null;
  classes: ClassOpt[];
  selectedClassId: string | "all";
  onSelectClass: (id: string | "all") => void;
  query: string;
  onQueryChange: (v: string) => void;
  alertsCount: number;
}

export const DashboardTopBar = ({
  teacherName, schoolName, classes, selectedClassId, onSelectClass, query, onQueryChange, alertsCount,
}: Props) => {
  const navigate = useNavigate();
  const selected = classes.find(c => c.id === selectedClassId);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[hsl(230_50%_9%/0.7)] backdrop-blur-xl p-4 lg:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title block */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-3.5 w-3.5 text-accent" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Painel do Professor</p>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground truncate">
            Olá{teacherName ? `, ${teacherName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {schoolName ?? "Defina o nome da escola em Configurações"} · {classes.length} turma{classes.length !== 1 ? "s" : ""} ativa{classes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[12.5px] font-medium text-foreground hover:bg-white/[0.07] transition-colors">
                <span className="text-muted-foreground text-[11px]">Turma:</span>
                <span className="truncate max-w-[120px]">{selected?.name ?? "Todas"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-72 overflow-auto">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">Filtrar por turma</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSelectClass("all")} className="text-xs">Todas as turmas</DropdownMenuItem>
              {classes.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => onSelectClass(c.id)} className="text-xs">{c.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] focus-within:border-accent/40 transition-colors">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              placeholder="Buscar aluno..."
              className="bg-transparent outline-none text-[12.5px] text-foreground placeholder:text-muted-foreground/70 w-32 lg:w-44"
            />
          </div>

          {/* Notifications */}
          <button
            onClick={() => navigate("/edu/comunicacao")}
            className="relative h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] grid place-items-center transition-colors"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[9px] font-bold grid place-items-center text-destructive-foreground">
                {alertsCount > 9 ? "9+" : alertsCount}
              </span>
            )}
          </button>

          {/* CTA */}
          <Button
            onClick={() => navigate("/edu/atividades")}
            className="h-9 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-[12.5px] gap-1.5"
          >
            <Plus className="h-4 w-4" />Criar atividade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar;
