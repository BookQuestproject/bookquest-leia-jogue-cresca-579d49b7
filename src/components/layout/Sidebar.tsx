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
  Settings,
  Lock,
  Flame,
  Newspaper,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Trilhas Literárias", path: "/trilhas" },
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
    { icon: Library, label: "Biblioteca", path: "/biblioteca" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking Literário", path: "/ranking" },
    { icon: HelpCircle, label: "Quiz Literário", path: "/quiz" },
    { icon: Users, label: "Comunidades", path: "/comunidade" },
    { icon: Newspaper, label: "Notícias", path: "/noticias" },
  ];

  const premiumItems = [
    { icon: MessageSquare, label: "Book Club", path: "/bookclub" },
    { icon: Sparkles, label: "Mentoria", path: "/mentoria" },
    { icon: GraduationCap, label: "ENEM e Vestibulares", path: "/enem" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-secondary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-secondary-foreground" />
          </div>
          <span className="text-lg font-serif font-semibold text-foreground">BookQuest</span>
        </Link>
      </div>

      {/* User Stats Quick View */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-accent">
              <Flame className="w-4 h-4" />
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Bronze</span>
            </div>
          </div>
        ) : (
          <Link 
            to="/auth" 
            className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span className="font-medium">Entrar / Cadastrar</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* Premium Section */}
        <div className="pt-5 pb-2">
          <span className="px-4 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        </div>
        
        {premiumItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""} ${!isPremium ? "premium-locked" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
            {!isPremium && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Premium CTA for non-premium users */}
      {!isPremium && (
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/premium"
            className="flex items-center gap-3 px-4 py-3 rounded bg-accent/10 text-accent hover:bg-accent/15 transition-colors"
          >
            <Crown className="w-5 h-5" />
            <div>
              <p className="text-sm font-semibold">Assine o Premium</p>
              <p className="text-xs opacity-80">R$ 19,90/mês</p>
            </div>
          </Link>
        </div>
      )}

      {/* Settings & User Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-0.5">
        {user && (
          <Link
            to="/perfil"
            className={`sidebar-item ${isActive("/perfil") ? "active" : ""}`}
          >
            <User className="w-5 h-5" />
            <span className="text-sm">Meu Perfil</span>
          </Link>
        )}
        <Link
          to="/configuracoes"
          className={`sidebar-item ${isActive("/configuracoes") ? "active" : ""}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Configurações</span>
        </Link>
        {user && (
          <button
            onClick={() => signOut()}
            className="sidebar-item w-full text-left hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;