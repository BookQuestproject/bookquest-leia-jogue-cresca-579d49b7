import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, HelpCircle, GripVertical, X, Eye, Flame } from "lucide-react";
import StreakAnimationPreview from "@/components/admin/StreakAnimationPreview";

const FloatingAdminWidget = () => {
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showStreakPreview, setShowStreakPreview] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.current.x,
        y: touch.clientY - dragOffset.current.y,
      });
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    }
    setIsDragging(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-[100] w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ left: position.x, top: position.y }}
      >
        <Shield className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      ref={widgetRef}
      className="fixed z-[100] bg-card border border-border rounded-xl shadow-xl select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-border"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <GripVertical className="w-3.5 h-3.5" />
          Admin
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="p-1.5 flex flex-col gap-1">
        <Link
          to="/admin"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Shield className="w-4 h-4 text-accent" />
          Painel Admin
        </Link>
        <Link
          to="/admin/founder-preview"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Eye className="w-4 h-4 text-accent" />
          Preview Fundador
        </Link>
        <Link
          to="/quiz-literario"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-accent" />
          Testar Quiz
        </Link>
        <button
          onClick={() => setShowStreakPreview(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors w-full text-left"
        >
          <Flame className="w-4 h-4 text-accent" />
          Preview Streak
        </button>
      </div>

      <StreakAnimationPreview open={showStreakPreview} onClose={() => setShowStreakPreview(false)} />
    </div>
  );
};

export default FloatingAdminWidget;
