import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, User, Target, BookMarked, LogIn, Menu, Library, Swords, Newspaper, MessageSquare, Sparkles, GraduationCap, HelpCircle, X, Crown, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { useProfile } from "@/hooks/useProfile";
import { useActiveTrail } from "@/hooks/useActiveTrail";
import logoCrown from "@/assets/logo-crown-transparent.png";

interface MobileNavProps {
  isPremium?: boolean;
}

const MobileNav = ({
  isPremium = false
}: MobileNavProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { activeTrail } = useActiveTrail();
  const [moreOpen, setMoreOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: BookOpen, label: "Trilhas", path: "/trilhas" },
    { icon: Target, label: "Missões", path: "/missoes" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
  ];

  const moreItems = [
    { icon: BookMarked, label: "Minha Estante", path: "/estante" },
    { icon: Library, label: "Biblioteca", path: "/biblioteca" },
    { icon: HelpCircle, label: "Quiz Literário", path: "/quiz" },
    { icon: BookOpen, label: "Espaço Literário", path: "/espaco-literario" },
    { icon: Swords, label: "Desafios", path: "/desafios" },
    { icon: Newspaper, label: "Notícias", path: "/noticias" },
    { icon: MessageSquare, label: "Book Club", path: "/bookclub", premium: true },
    { icon: Sparkles, label: "Mentoria", path: "/mentoria", premium: true },
    { icon: GraduationCap, label: "Trilhas Acadêmicas", path: "/enem", premium: true },
    { icon: Crown, label: "Assine Premium", path: "/premium", highlight: true },
    { icon: User, label: user ? "Perfil" : "Entrar", path: user ? "/perfil" : "/auth" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreItems.some(item => isActive(item.path));

  return <>
    {/* Top Header */}
    <header className="fixed top-0 left-0 right-0 h-14 border-b border-sidebar-border flex items-center justify-between px-4 z-50 bg-muted">
      <Link to="/home" className="flex items-center gap-2">
        <img src={logoCrown} alt="BookQuest" className="object-contain" style={{ width: '2.625rem', height: '2.625rem' }} loading="eager" decoding="sync" />
      </Link>
      <div className="flex items-center gap-2">
        {user && <NotificationBell />}
        <Link to="/estante" className="text-muted-foreground hover:text-foreground">
          <BookMarked className="w-5 h-5" />
        </Link>
      </div>
    </header>

    {/* Spacer for fixed header */}
    <div className="h-14" />

    {/* More Menu Overlay */}
    {moreOpen && (
      <div className="fixed inset-0 z-[60] flex flex-col justify-end">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
        <div className="relative bg-card border-t border-border rounded-t-2xl p-4 pb-20 animate-fade-in max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-foreground">Mais opções</span>
            <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Active Trail Banner */}
          {activeTrail && (
            <Link
              to={`/ler/${activeTrail.bookId}/${activeTrail.chapters.find(c => c.status === "current")?.id || 1}`}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl mb-3 active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(135deg, hsl(${activeTrail.themeColor || "220 60% 50%"}), hsl(${activeTrail.themeColor || "220 60% 50%"} / 0.7))`,
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/15">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Trilha atual</p>
                <p className="text-white font-serif font-bold text-sm leading-tight truncate">{activeTrail.title}</p>
              </div>
              <span className="text-white/60 text-xs font-medium flex-shrink-0">
                {activeTrail.chapters.filter(c => c.status === "completed").length}/{activeTrail.totalChapters}
              </span>
            </Link>
          )}

          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const locked = (item as any).premium && !isPremium;
              const isHighlight = (item as any).highlight && !isPremium;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    isHighlight
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : isActive(item.path)
                      ? "bg-accent/10 text-accent"
                      : locked
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isHighlight ? "text-accent" : ""}`} />
                  <span className={`text-[10px] font-medium text-center leading-tight ${isHighlight ? "text-accent font-bold" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* Bottom Navigation */}
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 z-50">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 p-2 rounded transition-all duration-200 ${
            isActive(item.path) ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <item.icon className={`w-5 h-5 ${isActive(item.path) ? "scale-110" : ""}`} />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={() => setMoreOpen(!moreOpen)}
        className={`flex flex-col items-center gap-1 p-2 rounded transition-all duration-200 ${
          moreOpen || isMoreActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Menu className={`w-5 h-5 ${moreOpen ? "scale-110" : ""}`} />
        <span className="text-xs font-medium">Mais</span>
      </button>
    </nav>
  </>;
};

export default memo(MobileNav);