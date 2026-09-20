import { ReactNode, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useProfile } from "@/hooks/useProfile";
import {
  Home, Users, GraduationCap, ClipboardList, FileBarChart, Library, Settings, LogOut, Plus, MessageCircle, BookMarked, MapPin,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import EduBreadcrumb, { BreadcrumbSegment } from "@/components/edu/EduBreadcrumb";
import FeedbackLauncher from "@/components/feedback/FeedbackLauncher";


interface EduLayoutProps {
  children: ReactNode;
  /** Extra segments appended after the auto-detected page label. */
  breadcrumbExtra?: BreadcrumbSegment[];
}

const principalItems = [
  { icon: Home,           label: "Visão geral",   path: "/edu/professor" },
  { icon: Users,          label: "Turmas",        path: "/edu/turmas" },
  { icon: GraduationCap,  label: "Alunos",        path: "/edu/turmas?view=alunos" },
  { icon: ClipboardList,  label: "Atividades",    path: "/edu/atividades" },
];

const apoioItems = [
  { icon: BookMarked,     label: "Jornadas",      path: "/edu/jornadas" },
  { icon: FileBarChart,   label: "Relatórios",    path: "/edu/relatorios" },
  { icon: Library,        label: "Biblioteca",    path: "/edu/livros" },
  { icon: BookMarked,     label: "Experiências",  path: "/edu/perguntas" },
  { icon: MessageCircle,  label: "Comunicação",   path: "/edu/comunicacao" },
];

const EduLayout = ({ children, breadcrumbExtra }: EduLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate("/auth?redirect=/edu/professor", { replace: true });
      return;
    }
    // Uma conta autenticada sem papel de professor não deve voltar para a
    // própria porta de entrada do professor, evitando um loop de navegação.
    if (!isTeacher) {
      navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  const gateLoading = authLoading || roleLoading || !user || !isTeacher;

  const isActive = (path: string) => {
    const [pathname, query] = path.split("?");
    if (path === "/edu/professor") return location.pathname === "/edu/professor";
    if (query) return location.pathname === pathname && location.search.includes(query);
    if (pathname === "/edu/turmas" && location.search.includes("view=alunos")) return false;
    return location.pathname.startsWith(pathname);
  };

  const userName = profile?.full_name ?? "Professor";
  const currentRoute = [...principalItems, ...apoioItems, { icon: Settings, label: "Configurações", path: "/edu/configuracoes" }]
    .find((item) => isActive(item.path));
  const routeLabel = currentRoute?.label ?? "Painel";

  const breadcrumbSegments: BreadcrumbSegment[] = useMemo(() => {
    const base: BreadcrumbSegment[] = [
      { label: "Painel", to: "/edu/professor", icon: Home },
    ];
    if (currentRoute && currentRoute.path !== "/edu/professor") {
      base.push({
        label: currentRoute.label,
        to: currentRoute.path,
        icon: currentRoute.icon,
      });
    }
    if (breadcrumbExtra?.length) base.push(...breadcrumbExtra);
    return base;
  }, [currentRoute, breadcrumbExtra]);

  const renderItem = (item: { icon: any; label: string; path: string }) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 ${
          active
            ? "text-foreground bg-sidebar-accent"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
        }`}
      >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />}
        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "text-accent" : ""}`} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Desktop sidebar — same aesthetic as student panel */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-56 bg-sidebar flex-col z-50 border-r border-border/40">
        <div className="px-5 py-5 flex items-center justify-between">
          <Link to="/edu/professor" className="flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="w-12 h-12 object-contain" loading="eager" decoding="sync" />
            <div className="leading-tight">
              <p className="font-bold text-foreground text-sm">BookQuest</p>
              <p className="text-[10px] font-bold text-accent tracking-[0.2em]">EDU</p>
            </div>
          </Link>
          <NotificationBell />
        </div>

        {/* Gold CTA — Criar nova turma */}
        <div className="px-3 pb-3">
          <Link
            to="/edu/turmas"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-bold text-accent-foreground bg-accent hover:bg-[hsl(var(--accent)/0.9)] transition-all shadow-[0_0_22px_hsl(var(--accent)/0.35)]"
          >
            <Plus className="w-4 h-4" />
            Criar nova turma
          </Link>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">Principal</p>
          {principalItems.map(renderItem)}

          <div className="my-3 mx-3 border-t border-border/30" />

          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">Pedagógico</p>
          {apoioItems.map(renderItem)}
        </nav>

        <div className="px-3 py-3 border-t border-border/30 space-y-1">
          <Link
            to="/edu/configuracoes"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              isActive("/edu/configuracoes")
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </Link>
          <Link
            to="/edu/professor"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
              {userName.substring(0, 1).toUpperCase()}
            </div>
            <span className="truncate">{userName}</span>
          </Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate("/edu"))}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <Link to="/edu/professor" className="flex items-center gap-2">
          <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
          <span className="font-bold text-foreground text-sm">BookQuest</span>
          <span className="text-[10px] font-bold text-accent tracking-widest">EDU</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-xl border-t border-border/40 flex justify-around py-2">
        {principalItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[9px] transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}>
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>

      <main className="lg:ml-56 flex-1 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          {gateLoading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <p className="text-sm font-medium text-foreground/70">Carregando painel...</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <EduBreadcrumb segments={breadcrumbSegments} />
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                  <MapPin className="h-3.5 w-3.5" />
                  {routeLabel}
                </div>
              </div>
              {children}
            </>
          )}
        </div>
      </main>
      {!gateLoading && <FeedbackLauncher audience="professor" />}
    </div>

  );
};

export default EduLayout;
