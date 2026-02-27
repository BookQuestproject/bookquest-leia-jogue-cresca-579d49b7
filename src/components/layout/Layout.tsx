import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import FloatingAdminWidget from "../FloatingAdminWidget";
import { useAdmin } from "@/hooks/useAdmin";
import logoCrown from "@/assets/logo-crown-transparent.png";
import logoWordmark from "@/assets/logo-bookquest-wordmark.png";

interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}

const Layout = ({ children, isPremium = false }: LayoutProps) => {
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen">
      {/* Top Bar - Desktop */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 h-14 z-[60] items-center justify-between px-6"
        style={{ background: "linear-gradient(135deg, hsl(230 70% 10%), hsl(230 60% 14%))" }}
      >
        <Link to="/home" className="flex items-center gap-3">
          <img src={logoCrown} alt="BookQuest" className="w-10 h-10 object-contain" />
          <img src={logoWordmark} alt="BookQuest" className="h-6 object-contain opacity-90" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/configuracoes"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
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
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0 lg:pt-14">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
