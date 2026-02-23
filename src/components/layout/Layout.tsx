import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
interface LayoutProps {
  children: ReactNode;
  isPremium?: boolean;
}
const Layout = ({
  children,
  isPremium = false
}: LayoutProps) => {
  return <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isPremium={isPremium} />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav isPremium={isPremium} />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>;
};
export default Layout;