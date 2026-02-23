import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import FloatingAdminWidget from "../FloatingAdminWidget";
import { useAdmin } from "@/hooks/useAdmin";

interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}

const Layout = ({ children, isPremium = false }: LayoutProps) => {
  const { isAdmin } = useAdmin();

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isPremium={isPremium} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav isPremium={isPremium} />
      </div>

      {/* Settings icon - top right */}
      <Link
        to="/configuracoes"
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        title="Configurações"
      >
        <Settings className="w-4 h-4" />
      </Link>

      {/* Floating Admin Widget */}
      {isAdmin && <FloatingAdminWidget />}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
