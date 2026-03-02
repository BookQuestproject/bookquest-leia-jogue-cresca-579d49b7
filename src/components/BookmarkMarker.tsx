import { useState, useRef, useEffect } from "react";
import { Bookmark, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface BookmarkMarkerProps {
  themeColor: string;
  currentPage?: number | null;
  totalPages?: number;
  isCompleted?: boolean;
  onPageUpdate?: (page: number) => void;
  disabled?: boolean;
}

const GOLD = "45 80% 52%"; // #D4AF37 equivalent in HSL

const BookmarkMarker = ({
  themeColor,
  currentPage,
  totalPages,
  isCompleted = false,
  onPageUpdate,
  disabled = false,
}: BookmarkMarkerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pageValue, setPageValue] = useState(currentPage?.toString() || "");
  const [animateChange, setAnimateChange] = useState(false);
  const prevPageRef = useRef(currentPage);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate on page change
  useEffect(() => {
    if (currentPage && prevPageRef.current !== currentPage) {
      setAnimateChange(true);
      const t = setTimeout(() => setAnimateChange(false), 400);
      prevPageRef.current = currentPage;
      return () => clearTimeout(t);
    }
  }, [currentPage]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        setPageValue(currentPage?.toString() || "");
      }
    };
    if (isEditing) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditing, currentPage]);

  // Focus input
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const progressPercent = currentPage && totalPages ? (currentPage / totalPages) * 100 : 0;

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

  const tooltipText = currentPage
    ? `Você está na página ${currentPage} de ${totalPages || "?"}`
    : "Clique para marcar sua página";

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={handleBookmarkClick}
              className="flex flex-col items-center gap-1 cursor-pointer group/bm"
            >
              {/* Label */}
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 group-hover/bm:text-muted-foreground transition-colors">
                {isCompleted ? "Concluído" : currentPage ? "Sua posição" : "Marcar"}
              </span>

              {/* Bookmark body with progress bar background */}
              <div className="relative w-9 h-[4.5rem]">
                {/* Progress background track */}
                {!isCompleted && totalPages && (
                  <div
                    className="absolute inset-0 rounded-sm overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
                      background: `hsl(${themeColor} / 0.12)`,
                    }}
                  >
                    {/* Filled progress */}
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                      style={{
                        height: `${progressPercent}%`,
                        background: `linear-gradient(180deg, hsl(${GOLD} / 0.25), hsl(${GOLD} / 0.45))`,
                      }}
                    />
                  </div>
                )}

                {/* Main bookmark shape */}
                <div
                  className={`
                    absolute inset-0 flex flex-col items-center justify-start pt-2
                    transition-all duration-300 ease-out
                    group-hover/bm:scale-105 group-hover/bm:translate-x-1
                    ${isEditing ? "translate-x-2 scale-110" : ""}
                  `}
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
                    background: isCompleted
                      ? `linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent) / 0.85))`
                      : currentPage
                      ? `linear-gradient(180deg, hsl(${GOLD}), hsl(${GOLD} / 0.8))`
                      : `linear-gradient(180deg, hsl(${themeColor}), hsl(${themeColor} / 0.85))`,
                    boxShadow: currentPage
                      ? `0 4px 14px hsl(${GOLD} / 0.4), 0 0 20px hsl(${GOLD} / 0.15)`
                      : `2px 4px 8px hsl(${themeColor} / 0.3)`,
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-white mt-1" />
                  ) : currentPage ? (
                    <span
                      className={`
                        text-white text-xs font-black mt-0.5
                        transition-transform duration-300
                        ${animateChange ? "scale-125" : "scale-100"}
                      `}
                      style={{
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {currentPage}
                    </span>
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-white/80 mt-1 group-hover/bm:text-white transition-colors" />
                  )}
                </div>
              </div>

              {/* Page counter below */}
              {currentPage && totalPages && !isCompleted && (
                <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                  <span style={{ color: `hsl(${GOLD})` }}>{currentPage}</span>
                  <span className="text-muted-foreground/50">/{totalPages}</span>
                </span>
              )}
            </div>
          </TooltipTrigger>
          {!isEditing && (
            <TooltipContent side="left" className="text-xs font-medium">
              {tooltipText}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Inline page editor popup */}
      {isEditing && (
        <div
          className="absolute right-full top-1/2 -translate-y-1/2 mr-4
            bg-card border border-border rounded-xl p-3 shadow-2xl z-30
            animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" style={{ color: `hsl(${GOLD})` }} />
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
                <span className="text-sm text-muted-foreground whitespace-nowrap">/ {totalPages}</span>
              )}
            </div>
            <div className="flex gap-1.5 mt-1">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setPageValue(currentPage?.toString() || "");
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 h-8 text-white"
                onClick={handleSave}
                style={{ background: `hsl(${GOLD})` }}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
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
