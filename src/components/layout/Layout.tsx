import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings, Flame } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import FloatingAdminWidget from "../FloatingAdminWidget";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { streakLevels, getStreakColor } from "@/components/StreakFlame";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}

const Layout = ({ children, isPremium = false }: LayoutProps) => {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();

  // TODO: replace with real streak from DB
  const currentStreak = 0;
  const streak = getStreakColor(currentStreak);

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isPremium={isPremium} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav isPremium={isPremium} />
      </div>

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Streak Flame */}
        {user && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm relative"
                title="Sequência de leitura"
              >
                <Flame className={`w-4 h-4 ${streak.color} ${currentStreak > 0 ? "animate-pulse" : ""}`} />
                {currentStreak > 0 && (
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    {currentStreak}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" className="w-64 p-0">
              <div className="p-3 border-b border-border">
                <p className="font-semibold text-sm">Sequência de Leitura</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentStreak === 0
                    ? "Complete uma atividade para iniciar"
                    : `${currentStreak} ${currentStreak === 1 ? "dia" : "dias"} consecutivo${currentStreak === 1 ? "" : "s"}`}
                </p>
                {currentStreak > 0 && (
                  <p className="text-xs mt-1">
                    Nível atual: <span className={`font-semibold ${streak.color}`}>{streak.label}</span>
                  </p>
                )}
              </div>
              <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
                {[...streakLevels].reverse().map((level) => {
                  const isCurrentLevel = currentStreak >= level.min && 
                    (streakLevels.find(l => l.min > level.min && currentStreak < l.min) || currentStreak >= level.min);
                  const isCurrent = streak.label === level.label && currentStreak > 0;
                  return (
                    <div
                      key={level.min}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isCurrent ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className={`w-3.5 h-3.5 ${level.color}`} />
                        <span className={`font-medium ${level.color}`}>{level.label}</span>
                      </div>
                      <span className="text-muted-foreground">{level.description}</span>
                    </div>
                  );
                })}
              </div>
              <div className="p-2.5 border-t border-border">
                <p className="text-[11px] text-muted-foreground text-center">
                  Mantenha atividades diárias para subir de nível
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Settings */}
        <Link
          to="/configuracoes"
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>

      {/* Floating Admin Widget */}
      {isAdmin && <FloatingAdminWidget />}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
