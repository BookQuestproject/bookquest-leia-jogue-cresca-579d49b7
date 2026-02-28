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
      <main className="lg:ml-56 min-h-screen pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
