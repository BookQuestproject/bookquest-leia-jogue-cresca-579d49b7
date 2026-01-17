import { useState } from "react";
import { Lock } from "lucide-react";
import BookmarkMarker from "./BookmarkMarker";

interface Chapter {
  id: number;
  title: string;
  status: "completed" | "current" | "locked";
  icon: string;
  currentPage?: number;
  totalPages?: number;
}

interface BookChapterCardProps {
  chapter: Chapter;
  themeColor: string;
  bookCoverImage?: string;
  onClick: () => void;
  isLocked: boolean;
  onPageUpdate?: (page: number) => void;
}

const BookChapterCard = ({ 
  chapter, 
  themeColor, 
  bookCoverImage,
  onClick, 
  isLocked,
  onPageUpdate 
}: BookChapterCardProps) => {
  const isCompleted = chapter.status === "completed";

  // Determine if this is an "open book" (current/completed) or "closed book" (locked)
  const isOpenBook = chapter.status !== "locked";

  if (!isOpenBook) {
    // Closed book with lock - vintage book cover style
    return (
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`
          relative w-full rounded-lg overflow-hidden transition-all duration-300
          ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:-translate-y-1'}
        `}
        style={{
          background: `linear-gradient(145deg, hsl(${themeColor} / 0.15), hsl(${themeColor} / 0.08))`,
          border: `1px solid hsl(${themeColor} / 0.25)`,
          minHeight: '100px',
        }}
      >
        {/* Vintage paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-4 flex items-center gap-4">
          {/* Book cover image area */}
          <div 
            className="w-20 h-24 rounded flex-shrink-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, hsl(${themeColor} / 0.25), hsl(${themeColor} / 0.12))`,
              border: `1px solid hsl(${themeColor} / 0.3)`,
            }}
          >
            <span className="text-3xl opacity-50">{chapter.icon}</span>
          </div>

          {/* Chapter info */}
          <div className="flex-1 text-left">
            <p 
              className="text-xs font-medium mb-1 opacity-70"
              style={{ color: `hsl(${themeColor})` }}
            >
              Capítulo {chapter.id}
            </p>
            <p className="font-serif text-sm font-medium text-foreground/80 line-clamp-2">
              {chapter.title}
            </p>
          </div>

          {/* Lock icon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `hsl(${themeColor} / 0.15)`,
              border: `1px solid hsl(${themeColor} / 0.25)`,
            }}
          >
            <Lock className="w-4 h-4 text-muted-foreground/60" />
          </div>
        </div>
      </button>
    );
  }

  // Open book style for current/completed chapters
  const isCurrent = chapter.status === "current";

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full rounded-lg overflow-visible transition-all duration-300
        cursor-pointer hover:-translate-y-1
      `}
      style={{
        background: `linear-gradient(145deg, 
          hsl(43 30% 94%), 
          hsl(35 25% 88%)
        )`,
        border: isCurrent ? `2px solid hsl(${themeColor})` : `1px solid hsl(${themeColor} / 0.35)`,
        minHeight: '100px',
        boxShadow: isCurrent 
          ? `0 8px 32px hsl(${themeColor} / 0.25), inset 0 0 60px hsl(${themeColor} / 0.05)`
          : `0 4px 16px hsl(${themeColor} / 0.12)`,
      }}
    >
      {/* Vintage paper texture */}
      <div 
        className="absolute inset-0 opacity-20 rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Left page fold effect */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-3 rounded-l-lg"
        style={{
          background: `linear-gradient(90deg, hsl(${themeColor} / 0.2), transparent)`,
        }}
      />

      <div className="relative p-4 flex items-center gap-4">
        {/* Book illustration area */}
        <div 
          className="w-20 h-24 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor} / 0.2), hsl(${themeColor} / 0.08))`,
            border: `1px solid hsl(${themeColor} / 0.25)`,
          }}
        >
          <span className="text-3xl">{chapter.icon}</span>
        </div>

        {/* Chapter info */}
        <div className="flex-1 text-left">
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: `hsl(${themeColor})` }}
          >
            Capítulo {chapter.id}
          </p>
          <p className="font-serif text-sm font-semibold text-foreground line-clamp-2 mb-1">
            {chapter.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Capítulo {chapter.id} de 17
          </p>
        </div>

        {/* Bookmark marker */}
        <BookmarkMarker
          themeColor={themeColor}
          currentPage={chapter.currentPage}
          totalPages={chapter.totalPages}
          isCompleted={isCompleted}
          onPageUpdate={onPageUpdate}
        />
      </div>

      {/* Current indicator */}
      {isCurrent && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
          style={{
            background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor} / 0.6))`,
          }}
        />
      )}
    </div>
  );
};

export default BookChapterCard;
