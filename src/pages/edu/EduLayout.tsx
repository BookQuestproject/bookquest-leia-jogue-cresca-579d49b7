import { ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import {
  LayoutDashboard, Users, BookMarked, MessageCircle, FileBarChart, Library,
  HelpCircle, Settings, LogOut, Search, ChevronsLeft, ChevronsRight, Sparkles,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { supabase } from "@/integrations/supabase/client";

interface EduLayoutProps { children: ReactNode }

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",            path: "/edu/professor" },
  { icon: Users,           label: "Turmas",               path: "/edu/turmas" },
  { icon: BookMarked,      label: "Jornadas de leitura",  path: "/edu/jornadas" },
  { icon: HelpCircle,      label: "Perguntas de Reflexão",path: "/edu/perguntas" },
  { icon: MessageCircle,   label: "Comunicação",          path: "/edu/comunicacao" },
  { icon: FileBarChart,    label: "Relatórios",           path: "/edu/relatorios" },
  { icon: Library,         label: "Biblioteca",           path: "/edu/livros" },
  { icon: Settings,        label: "Configurações",        path: "/edu/configuracoes" },
];

const EduLayout = ({ children }: EduLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user || !isTeacher) navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }
  if (!user || !isTeacher) return null;

  const isActive = (path: string) =>
    path === "/edu/professor" ? location.pathname === "/edu/professor" : location.pathname.startsWith(path);

  const initials = (profile?.full_name ?? "P").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex bg-transparent">
      <aside className={`hidden lg:flex flex-col ${collapsed ? "w-[72px]" : "w-64"} fixed h-full z-30 border-r border-white/[0.06] bg-[hsl(230_72%_7%/0.82)] backdrop-blur-2xl transition-all duration-300`}>
        <div className="p-4 flex items-center gap-2.5 border-b border-white/[0.06]">
          <div className="relative shrink-0">
            <img src={logoCrown} alt="BookQuest" className="h-9 w-9" />
            <div className="absolute inset-0 bg-accent/30 blur-xl -z-10" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-foreground text-sm">BookQuest</span>
              <span className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase">EDU</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Colapsar"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Buscar turmas, alunos..." className="bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/70 flex-1 min-w-0" />
            </div>
          </div>
        )}

        <nav className="flex-1 p-2.5 mt-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-accent/[0.20] via-accent/[0.06] to-transparent text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-accent shadow-[0_0_12px_hsl(48_96%_55%)]" />}
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "group-hover:text-accent/70"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-3 pb-2">
            <div className="rounded-xl p-3 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent border border-accent/20 relative overflow-hidden">
              <Sparkles className="absolute -top-2 -right-2 h-12 w-12 text-accent/10" />
              <p className="text-xs font-bold text-foreground">EDU Pro</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">Relatórios automáticos e turmas ilimitadas.</p>
            </div>
          </div>
        )}

        <div className="p-2.5 border-t border-white/[0.06]">
          <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : "px-2"} py-2 rounded-xl`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-[hsl(48_96%_45%)] text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-accent/30">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{profile?.full_name ?? "Professor"}</p>
                  <p className="text-[10px] text-muted-foreground">Educador</p>
                </div>
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
                  onClick={() => supabase.auth.signOut().then(() => navigate("/edu"))}
                  aria-label="Sair"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[hsl(230_70%_8%/0.92)] backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
          <span className="font-bold text-foreground text-sm">BookQuest</span>
          <span className="text-[10px] font-bold text-accent tracking-widest">EDU</span>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(230_70%_8%/0.95)] backdrop-blur-xl border-t border-white/5 flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[9px] transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>

      <main className={`${collapsed ? "lg:ml-[72px]" : "lg:ml-64"} flex-1 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0 transition-all duration-300`}>
        <div className="p-4 lg:px-8 lg:py-6 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default EduLayout;
