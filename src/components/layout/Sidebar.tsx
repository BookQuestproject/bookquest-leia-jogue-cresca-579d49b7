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
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
 import { useAdmin } from "@/hooks/useAdmin";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Trilhas Literárias", path: "/trilhas" },
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
    { icon: Library, label: "Biblioteca", path: "/biblioteca" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking Literário", path: "/ranking" },
    ...(!isAdmin ? [{ icon: HelpCircle, label: "Quiz Literário", path: "/quiz" }] : []),
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
    <aside data-tutorial="sidebar-full" className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-secondary-foreground" />
          </div>
          <span className="text-lg font-serif font-semibold text-foreground">BookQuest</span>
        </Link>
      </div>

      {/* User Stats Quick View */}
      <div className="px-5 py-2 border-b border-sidebar-border" data-tutorial="user-stats">
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
      <nav className="flex-1 px-2 py-1 space-y-0 overflow-y-auto" data-tutorial="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}

        {/* Premium Section */}
        <div className="pt-3 pb-1">
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
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
            {!isPremium && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Premium CTA for non-premium users */}
      {!isPremium && (
        <div className="px-3 py-2 border-t border-sidebar-border" data-tutorial="premium-cta">
          <Link
            to="/premium"
            className="flex items-center gap-2 px-3 py-2 rounded bg-accent/10 text-accent hover:bg-accent/15 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <div>
              <p className="text-xs font-semibold">Assine o Premium</p>
              <p className="text-[10px] opacity-80">R$ 19,90/mês</p>
            </div>
          </Link>
        </div>
      )}

      {/* Settings & User Actions */}
      <div className="px-2 py-2 border-t border-sidebar-border space-y-0">
        {isAdmin && (
          <>
            <Link
              to="/admin"
              className={`sidebar-item ${isActive("/admin") ? "active" : ""}`}
            >
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm">Painel Admin</span>
            </Link>
            <Link
              to="/quiz-onboarding"
              className={`sidebar-item ${isActive("/quiz-onboarding") ? "active" : ""}`}
            >
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-sm">Testar Quiz</span>
            </Link>
          </>
        )}
        {user && (
          <Link
            to="/perfil"
            className={`sidebar-item ${isActive("/perfil") ? "active" : ""}`}
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Meu Perfil</span>
          </Link>
        )}
        <Link
          to="/configuracoes"
          className={`sidebar-item ${isActive("/configuracoes") ? "active" : ""}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Configurações</span>
        </Link>
        {user && (
          <button
            onClick={() => signOut()}
            className="sidebar-item w-full text-left hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;