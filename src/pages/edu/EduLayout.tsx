import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap, LayoutDashboard, Users, BarChart3, LogOut, BookOpen,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface EduLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/edu" },
  { icon: Users, label: "Turmas", path: "/edu/turmas" },
  { icon: BarChart3, label: "Relatórios", path: "/edu/relatorios" },
];

const EduLayout = ({ children }: EduLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user || !isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const isActive = (path: string) =>
    path === "/edu" ? location.pathname === "/edu" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card fixed h-full z-30">
        <div className="p-4 flex items-center gap-2 border-b border-border">
          <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
          <div>
            <span className="font-bold text-foreground text-sm">BookQuest</span>
            <span className="ml-1 text-xs font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">EDU</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <Link
            to="/home"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Voltar ao BookQuest
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => supabase.auth.signOut().then(() => navigate("/"))}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
          <span className="font-bold text-foreground text-sm">BookQuest</span>
          <span className="text-xs font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">EDU</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
              isActive(item.path) ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="lg:ml-56 flex-1 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:px-8 lg:py-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EduLayout;
