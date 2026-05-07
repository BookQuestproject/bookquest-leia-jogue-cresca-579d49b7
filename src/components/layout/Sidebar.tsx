import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  BookMarked,
  Library,
  Target,
  Trophy,
  Award,
  Users,
  Crown,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Lock,
  LogIn,
  LogOut,
  Settings,
  Swords,
  BookA,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { NotificationBell } from "@/components/NotificationBell";
import logoCrown from "@/assets/logo-crown-transparent.png";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { profile } = useProfile();

  const primaryItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: BookOpen, label: "Jornada de Leitura", path: "/trilhas" },
    { icon: Library, label: "Explorar Livros", path: "/biblioteca" },
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
  ];

  const gamificationItems = [
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Award, label: "Conquistas", path: "/conquistas" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
  ];

  const communityItems = [
    { icon: Users, label: "Comunidade", path: "/espaco-literario" },
    { icon: Swords, label: "Desafios", path: "/desafios" },
    { icon: BookA, label: "Vocabulário", path: "/vocabulario" },
  ];

  const premiumItems = [
    { icon: MessageSquare, label: "Book Club", path: "/bookclub" },
    { icon: Sparkles, label: "Mentoria", path: "/mentoria" },
    { icon: GraduationCap, label: "Trilhas Acadêmicas", path: "/enem" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const userName = profile?.full_name || "Você";

  const renderItem = (item: { icon: any; label: string; path: string }, isPremiumItem = false) => {
    const active = isActive(item.path);
    const locked = isPremiumItem && !isPremium;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200
          ${active
            ? "text-foreground bg-sidebar-accent"
            : locked
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
          }
        `}
      >
        {/* Active indicator — gold bar */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
        )}
        <item.icon
          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? "text-accent" : ""}`}
        />
        <span className="truncate">{item.label}</span>
        {locked && <Lock className="w-3 h-3 text-muted-foreground/30 ml-auto" />}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar flex flex-col z-50 border-r border-border/40">
      {/* Logo + Notifications */}
      <div className="px-5 py-5 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2" reloadDocument={false}>
          <img
            src={logoCrown}
            alt="BookQuest"
            className="w-14 h-14 object-contain"
            loading="eager"
            decoding="sync"
          />
        </Link>
        {user && <NotificationBell />}
      </div>

      {/* Login CTA */}
      {!user && (
        <div className="px-4 pb-3">
          <Link
            to="/auth"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar / Cadastrar</span>
          </Link>
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5" data-tutorial="sidebar-nav">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">
          Principal
        </p>
        {primaryItems.map((item) => renderItem(item))}

        <div className="my-3 mx-3 border-t border-border/30" />

        <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">
          Gamificação
        </p>
        {gamificationItems.map((item) => renderItem(item))}

        <div className="my-3 mx-3 border-t border-border/30" />

        <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">
          Comunidade
        </p>
        {communityItems.map((item) => renderItem(item))}

        <div className="my-3 mx-3 border-t border-border/30" />

        <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent/40">
          Premium
        </p>
        {premiumItems.map((item) => renderItem(item, true))}

        {/* Admin EDU section */}
        {isAdmin && (
          <>
            <div className="my-3 mx-3 border-t border-border/30" />
            <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-400/60">
              Educacional
            </p>
            <Link
              to="/edu"
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-200
                ${location.pathname.startsWith("/edu")
                  ? "text-foreground bg-sidebar-accent"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
                }
              `}
            >
              {location.pathname.startsWith("/edu") && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
              )}
              <GraduationCap className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${location.pathname.startsWith("/edu") ? "text-accent" : ""}`} />
              <span className="truncate">BookQuest EDU</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-border/30 space-y-1">
        {!isPremium && (
          <Link
            to="/premium"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-accent-foreground bg-accent hover:bg-accent/90 transition-all"
            data-tutorial="premium-cta"
          >
            <Crown className="w-4 h-4" />
            <span>Assine o Premium</span>
          </Link>
        )}

        {user && (
          <Link
            to="/perfil"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              isActive("/perfil")
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-border/40"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                {userName.substring(0, 1).toUpperCase()}
              </div>
            )}
            <span className="truncate">{userName}</span>
          </Link>
        )}

        <Link
          to="/configuracoes"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
            isActive("/configuracoes")
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Link>

        {user && (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);
