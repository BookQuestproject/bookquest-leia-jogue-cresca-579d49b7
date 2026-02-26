import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  BookMarked,
  Library,
  Target,
  Trophy,
  HelpCircle,
  Users,
  Crown,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Lock,
  Newspaper,
  LogIn,
  LogOut,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";
import logoWordmark from "@/assets/logo-bookquest-wordmark.png";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { profile } = useProfile();

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: BookOpen, label: "Trilhas Literárias", path: "/trilhas" },
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
    { icon: Library, label: "Biblioteca", path: "/biblioteca" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking Literário", path: "/ranking" },
    ...(!isAdmin ? [{ icon: HelpCircle, label: "Quiz Literário", path: "/quiz" }] : []),
    { icon: Users, label: "Comunidades", path: "/comunidade" },
    { icon: Newspaper, label: "Notícias", path: "/noticias" },
    { icon: MessageSquare, label: "Book Club", path: "/bookclub", premium: true },
    { icon: Sparkles, label: "Mentoria", path: "/mentoria", premium: true },
    { icon: GraduationCap, label: "ENEM e Vestibulares", path: "/enem", premium: true },
  ];

  const isActive = (path: string) => location.pathname === path;
  const userName = profile?.full_name || "Você";

  return (
    <aside data-tutorial="sidebar-full" className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        <Link to="/home" className="flex items-center gap-2">
          <img src={logoCrown} alt="BookQuest" className="w-10 h-10 object-contain" />
          <img src={logoWordmark} alt="BookQuest" className="h-7 object-contain" />
        </Link>
      </div>

      {/* Login CTA for unauthenticated users */}
      {!user && (
        <div className="px-5 py-2 border-b border-sidebar-border">
          <Link
            to="/auth"
            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="font-medium">Entrar / Cadastrar</span>
          </Link>
        </div>
      )}

      {/* Navigation - all items unified */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto" data-tutorial="sidebar-nav">
        {menuItems.map((item) => {
          const isPremiumItem = (item as any).premium;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""} ${isPremiumItem && !isPremium ? "premium-locked" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[15px]">{item.label}</span>
              {isPremiumItem && !isPremium && <Lock className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-2 border-t border-sidebar-border space-y-0">
        {!isPremium && (
          <Link
            to="/premium"
            className="sidebar-item text-accent hover:bg-accent/10"
            data-tutorial="premium-cta"
          >
            <Crown className="w-5 h-5" />
            <span className="text-[15px] font-semibold">Assine o Premium</span>
          </Link>
        )}

        {user && (
          <Link
            to="/perfil"
            className={`sidebar-item ${isActive("/perfil") ? "active" : ""}`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                {userName.substring(0, 1).toUpperCase()}
              </div>
            )}
            <span className="text-[15px]">Meu Perfil</span>
          </Link>
        )}
        {user && (
          <button
            onClick={() => signOut()}
            className="sidebar-item w-full text-left hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[15px]">Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
