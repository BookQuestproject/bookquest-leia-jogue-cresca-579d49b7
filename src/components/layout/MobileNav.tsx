import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Users, User, Target, Flame, BookMarked, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileNavProps {
  isPremium?: boolean;
}

const MobileNav = ({ isPremium = false }: MobileNavProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Trilhas", path: "/trilhas" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
    { icon: user ? User : LogIn, label: user ? "Perfil" : "Entrar", path: user ? "/perfil" : "/auth" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-secondary-foreground" />
          </div>
          <span className="text-base font-serif font-semibold text-foreground">BookQuest</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-accent">
            <Flame className="w-4 h-4" />
            <span className="font-semibold text-sm">0</span>
          </div>
          <Link to="/estante" className="text-muted-foreground hover:text-foreground">
            <BookMarked className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-50">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 rounded transition-all duration-200 ${
              isActive(item.path)
                ? "text-secondary"
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