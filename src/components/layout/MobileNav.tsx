import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Users, User } from "lucide-react";

interface MobileNavProps {
  isPremium?: boolean;
}

const MobileNav = ({ isPremium = false }: MobileNavProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: BookOpen, label: "Quiz", path: "/quiz" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
    { icon: Users, label: "Social", path: "/comunidade" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">BookQuest</span>
        </Link>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-50">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? "scale-110" : ""}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default MobileNav;
