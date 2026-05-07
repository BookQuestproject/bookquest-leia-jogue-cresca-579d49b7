import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import {
  LayoutDashboard, Users, BarChart3, LogOut, BookOpen, Trophy, Settings,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EduLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/edu/professor" },
  { icon: Users, label: "Turmas", path: "/edu/turmas" },
  { icon: BookOpen, label: "Livros", path: "/edu/livros" },
  { icon: Trophy, label: "Rankings", path: "/edu/relatorios" },
  { icon: BarChart3, label: "Relatórios", path: "/edu/relatorios" },
];

const EduLayout = ({ children }: EduLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) navigate("/edu", { replace: true });
      else if (!isTeacher) navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isTeacher) return null;

  const isActive = (path: string) =>
    path === "/edu/professor" ? location.pathname === "/edu/professor" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Premium glassmorphism Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed h-full z-30 border-r border-white/5 bg-[hsl(230_70%_8%/0.7)] backdrop-blur-2xl">
        <div className="p-5 flex items-center gap-2.5 border-b border-white/5">
          <div className="relative">
            <img src={logoCrown} alt="BookQuest" className="h-9 w-9" />
            <div className="absolute inset-0 bg-accent/30 blur-xl -z-10" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-foreground text-sm">BookQuest</span>
            <span className="text-[10px] font-bold text-accent tracking-widest uppercase">EDU</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-accent/15 to-transparent text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-accent shadow-[0_0_10px_hsl(48_96%_55%)]" />
                )}
                <item.icon className={`h-4 w-4 transition-colors ${active ? "text-accent" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />Configurações
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5"
            onClick={() => supabase.auth.signOut().then(() => navigate("/edu"))}
          >
            <LogOut className="h-4 w-4 mr-2" />Sair
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[hsl(230_70%_8%/0.85)] backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
          <span className="font-bold text-foreground text-sm">BookQuest</span>
          <span className="text-[10px] font-bold text-accent tracking-widest">EDU</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(230_70%_8%/0.9)] backdrop-blur-xl border-t border-white/5 flex justify-around py-2">
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors ${
                active ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="lg:ml-60 flex-1 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:px-8 lg:py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EduLayout;
