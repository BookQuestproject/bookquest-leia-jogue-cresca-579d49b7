import { useState, useRef, useEffect } from "react";
import { Bookmark, Plus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BookmarkMarkerProps {
  themeColor: string;
  currentPage?: number;
  totalPages?: number;
  isCompleted?: boolean;
  onPageUpdate?: (page: number) => void;
  disabled?: boolean;
}

const BookmarkMarker = ({
  themeColor,
  currentPage,
  totalPages,
  isCompleted = false,
  onPageUpdate,
  disabled = false,
}: BookmarkMarkerProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pageValue, setPageValue] = useState(currentPage?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setPageValue(currentPage?.toString() || "");
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, currentPage]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsEditing(true);
      setPageValue(currentPage?.toString() || "");
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const page = parseInt(pageValue);
    if (page > 0 && (!totalPages || page <= totalPages)) {
      onPageUpdate?.(page);
      setIsEditing(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setPageValue(currentPage?.toString() || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      const page = parseInt(pageValue);
      if (page > 0 && (!totalPages || page <= totalPages)) {
        onPageUpdate?.(page);
        setIsEditing(false);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setPageValue(currentPage?.toString() || "");
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-shrink-0"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => !isEditing && setIsHovered(false)}
    >
      {/* Bookmark ribbon */}
      <div
        onClick={handleBookmarkClick}
        className={`
          w-7 h-[4.5rem] flex items-start justify-center cursor-pointer
          transition-all duration-300 ease-out
          ${isHovered && !isEditing ? "translate-x-2 scale-105" : ""}
          ${isEditing ? "translate-x-3" : ""}
        `}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)",
          background: isCompleted
            ? `linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent) / 0.85))`
            : `linear-gradient(180deg, hsl(${themeColor}), hsl(${themeColor} / 0.85))`,
          boxShadow: isHovered || isEditing 
            ? `4px 6px 12px hsl(${themeColor} / 0.4)` 
            : `2px 4px 8px hsl(${themeColor} / 0.3)`,
        }}
      >
        {isCompleted ? (
          <Check className="w-3.5 h-3.5 text-white mt-2.5" />
        ) : currentPage ? (
          <span className="text-white text-[10px] font-bold mt-2.5">{currentPage}</span>
        ) : (
          <Plus className={`w-3.5 h-3.5 text-white mt-2.5 transition-transform duration-200 ${isHovered ? "rotate-90" : ""}`} />
        )}
      </div>

      {/* Tooltip on hover (when not editing) */}
      {isHovered && !isEditing && !disabled && (
        <div 
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 
            bg-card border border-border rounded-lg p-2.5 shadow-xl z-20
            animate-fade-in whitespace-nowrap"
        >
          <div className="flex items-center gap-2 text-xs">
            <Bookmark className="w-3.5 h-3.5" style={{ color: `hsl(${themeColor})` }} />
            {currentPage ? (
              <span>
                Página <span className="font-bold">{currentPage}</span>
                {totalPages && <span className="text-muted-foreground">/{totalPages}</span>}
              </span>
            ) : (
              <span className="text-muted-foreground">Marcar página</span>
            )}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div 
              className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-transparent border-l-border"
            />
          </div>
        </div>
      )}

      {/* Page input popup when editing */}
      {isEditing && (
        <div 
          className="absolute right-full top-1/2 -translate-y-1/2 mr-4
            bg-card border border-border rounded-xl p-3 shadow-2xl z-30
            animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" style={{ color: `hsl(${themeColor})` }} />
              Página atual
            </label>
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                type="number"
                min="1"
                max={totalPages || undefined}
                value={pageValue}
                onChange={(e) => setPageValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-20 h-9 text-center font-bold"
                placeholder="1"
              />
              {totalPages && (
                <span className="text-sm text-muted-foreground">/ {totalPages}</span>
              )}
            </div>
            <div className="flex gap-1.5 mt-1">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-8"
                onClick={handleCancel}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8"
                onClick={handleSave}
                style={{
                  background: `hsl(${themeColor})`,
                }}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
          {/* Arrow pointing to bookmark */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div 
              className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-transparent border-l-card"
              style={{ filter: "drop-shadow(1px 0 0 hsl(var(--border)))" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkMarker;
