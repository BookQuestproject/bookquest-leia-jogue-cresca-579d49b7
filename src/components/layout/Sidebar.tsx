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
} from "lucide-react";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Trilhas Literárias", path: "/trilhas" },
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
    { icon: Library, label: "Biblioteca", path: "/biblioteca" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking Literário", path: "/ranking" },
    { icon: HelpCircle, label: "Quiz Literário", path: "/quiz" },
    { icon: Users, label: "Comunidades Literárias", path: "/comunidade" },
    { icon: Newspaper, label: "Notícias", path: "/noticias" },
  ];

  const premiumItems = [
    { icon: MessageSquare, label: "Book Club", path: "/bookclub" },
    { icon: Sparkles, label: "Mentoria Literária", path: "/mentoria" },
    { icon: GraduationCap, label: "ENEM e Vestibulares", path: "/enem" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">BookQuest</span>
        </Link>
      </div>

      {/* User Stats Quick View */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-accent">
            <Flame className="w-4 h-4" />
            <span className="font-bold">0</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">Bronze</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
        <div className="pt-4 pb-2">
          <span className="px-4 text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        </div>
        
        {premiumItems.map((item) => (
          isPremium ? (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              <Crown className="w-4 h-4 text-accent ml-auto" />
            </Link>
          ) : (
            <div
              key={item.path}
              className="sidebar-item premium-locked cursor-not-allowed"
              title="Disponível no Plano Premium"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
            </div>
          )
        ))}
      </nav>

      {/* Premium CTA for non-premium users */}
      {!isPremium && (
        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/premium"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Crown className="w-5 h-5" />
            <div>
              <p className="text-sm font-bold">Assine o Premium</p>
              <p className="text-xs opacity-80">R$ 19,90/mês</p>
            </div>
          </Link>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/configuracoes"
          className={`sidebar-item ${isActive("/configuracoes") ? "active" : ""}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Configurações</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
