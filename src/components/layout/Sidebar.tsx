import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Trophy,
  Users,
  Crown,
  User,
  HelpCircle,
  Sparkles,
  GraduationCap,
  MessageSquare,
} from "lucide-react";

interface SidebarProps {
  isPremium?: boolean;
}

const Sidebar = ({ isPremium = false }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: BookOpen, label: "Quiz Literário", path: "/quiz" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
    { icon: Users, label: "Comunidade", path: "/comunidade" },
    { icon: Crown, label: "Premium", path: "/premium" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  const premiumItems = [
    { icon: GraduationCap, label: "Trilhas ENEM", path: "/trilhas" },
    { icon: MessageSquare, label: "Book Club", path: "/bookclub" },
    { icon: Sparkles, label: "Mentoria", path: "/mentoria" },
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Premium Section */}
        {isPremium && (
          <>
            <div className="pt-4 pb-2">
              <span className="px-4 text-xs font-bold text-gold uppercase tracking-wider">
                Premium
              </span>
            </div>
            {premiumItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                <Crown className="w-4 h-4 text-gold ml-auto" />
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/ajuda"
          className="sidebar-item"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Ajuda</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
