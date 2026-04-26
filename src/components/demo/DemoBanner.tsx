import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Button } from "@/components/ui/button";
import { DEMO_STUDENT, DEMO_TEACHER } from "@/data/demoData";

const DemoBanner = () => {
  const { isDemo, role, endDemo } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemo) return null;

  const profileLabel =
    role === "teacher" ? DEMO_TEACHER.name : DEMO_STUDENT.name;
  const roleLabel = role === "teacher" ? "Professor" : "Aluno";

  const handleExit = () => {
    endDemo();
    navigate("/", { replace: true });
  };

  return (
    <div
      className="sticky top-0 z-[60] w-full border-b border-accent/40 bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 backdrop-blur-md"
      role="status"
      aria-label="Modo demonstração ativo"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
            <span className="hidden sm:inline">MODO DEMONSTRAÇÃO — dados fictícios.</span>
            <span className="sm:hidden">DEMO —</span>{" "}
            <span className="font-normal text-foreground/80">
              Você está navegando como{" "}
              <strong className="font-bold">{profileLabel}</strong>{" "}
              <span className="hidden sm:inline">({roleLabel})</span>
            </span>
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExit}
          className="h-7 px-2 text-xs hover:bg-background/50 flex-shrink-0"
        >
          <X className="h-3 w-3 mr-1" />
          Sair do demo
        </Button>
      </div>
    </div>
  );
};

export default DemoBanner;
