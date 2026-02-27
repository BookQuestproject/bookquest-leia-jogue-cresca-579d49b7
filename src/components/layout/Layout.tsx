import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings, Flame } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import FloatingAdminWidget from "../FloatingAdminWidget";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import logoCrown from "@/assets/logo-crown-transparent.png";
import logoWordmark from "@/assets/logo-bookquest-wordmark.png";

interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}

const Layout = ({ children, isPremium = false }: LayoutProps) => {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { profile } = useProfile();
  const userName = profile?.full_name || "Você";

  return (
    <div className="min-h-screen">
      {/* Top Bar - Desktop */}
      <header
        className="hidden lg:flex fixed top-0 left-0 right-0 h-12 z-[60] items-center justify-between border-b border-white/[0.06]"
        style={{ background: "hsl(230 68% 11%)" }}
      >
        {/* Left: Logo aligned with content */}
        <Link to="/home" className="flex items-center gap-2.5 pl-6">
          <img src={logoCrown} alt="BookQuest" className="w-8 h-8 object-contain" />
          <img src={logoWordmark} alt="BookQuest" className="h-5 object-contain opacity-80" />
        </Link>

        {/* Right: Status items */}
        <div className="flex items-center gap-3 pr-6">
          {/* Streak */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="opacity-70">7</span>
          </div>

          {/* XP */}
          <span className="text-xs text-muted-foreground/60 font-medium">35 XP</span>

          {/* Separator */}
          <div className="w-px h-4 bg-white/[0.08]" />

          {/* Avatar */}
          {user && (
            <Link to="/perfil" className="flex items-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  {userName.substring(0, 1).toUpperCase()}
                </div>
              )}
            </Link>
          )}

          {/* Settings */}
          <Link
            to="/configuracoes"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.06] transition-colors"
            title="Configurações"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isPremium={isPremium} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav isPremium={isPremium} />
      </div>

      {/* Floating Admin Widget */}
      {isAdmin && <FloatingAdminWidget />}

      {/* Main Content */}
      <main className="lg:ml-56 min-h-screen pb-20 lg:pb-0 lg:pt-12">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
