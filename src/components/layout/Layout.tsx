import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import FloatingAdminWidget from "../FloatingAdminWidget";
import { useAdmin } from "@/hooks/useAdmin";
import { useStreakTick } from "@/hooks/useStreakTick";

interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}

const Layout = ({ children, isPremium = false }: LayoutProps) => {
  const { isAdmin } = useAdmin();
  // Acende a tocha do dia (uma vez por dia, idempotente no servidor)
  useStreakTick();

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

      {/* Floating Admin Widget */}
      {isAdmin && <FloatingAdminWidget />}

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="lg:ml-56 min-h-screen pb-20 lg:pb-0 outline-none">
        <div className="p-4 lg:px-8 lg:py-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
