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
    <aside data-tutorial="sidebar-full" className="fixed left-0 top-12 h-[calc(100vh-3rem)] w-56 bg-sidebar border-r border-white/[0.06] flex flex-col z-50">

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
      <nav className="flex-1 px-2 py-1.5 overflow-y-auto space-y-0.5" data-tutorial="sidebar-nav">
        {menuItems.map((item) => {
          const isPremiumItem = (item as any).premium;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""} ${isPremiumItem && !isPremium ? "premium-locked" : ""}`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isPremiumItem && !isPremium && <Lock className="w-3 h-3 text-muted-foreground/40 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-2 border-t border-white/[0.06] space-y-0.5">
        {!isPremium && (
          <Link
            to="/premium"
            className="sidebar-item text-accent/80 hover:text-accent"
            data-tutorial="premium-cta"
          >
            <Crown className="w-4 h-4" />
            <span className="font-medium">Assine o Premium</span>
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
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                {userName.substring(0, 1).toUpperCase()}
              </div>
            )}
            <span>Meu Perfil</span>
          </Link>
        )}
        {user && (
          <button
            onClick={() => signOut()}
            className="sidebar-item w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
