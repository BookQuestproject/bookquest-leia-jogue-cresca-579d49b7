import { CheckCircle, Clock, Lock } from "lucide-react";
import type { ReactNode } from "react";

export interface BookQuestTrailChapter {
  id: number;
  title: string;
  status: "completed" | "current" | "locked";
  icon: string;
  totalPages?: number;
}

interface BookQuestTrailMapProps {
  chapters: BookQuestTrailChapter[];
  themeColor: string;
  isChapterCompleted?: (chapterId: number) => boolean;
  getReadingTime?: (chapterId: number) => number;
  onChapterClick: (chapter: BookQuestTrailChapter, index: number) => void;
  formatReadingTime?: (seconds: number) => string;
  endLabel?: ReactNode;
  className?: string;
}

export const BookQuestTrailMap = ({
  chapters,
  themeColor,
  isChapterCompleted = () => false,
  getReadingTime = () => 0,
  onChapterClick,
  formatReadingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}min` : `${seconds}s`;
  },
  endLabel = "🏁 Fim da Jornada",
  className = "",
}: BookQuestTrailMapProps) => {
  return (
    <div className={`relative max-w-md mx-auto py-4 animate-fade-in ${className}`}>
      {chapters.map((chapter, index) => {
        const previousChapter = index > 0 ? chapters[index - 1] : null;
        const previousCompleted = previousChapter
          ? previousChapter.status === "completed" || isChapterCompleted(previousChapter.id)
          : true;
        const isCompletedFromDB = isChapterCompleted(chapter.id);
        const isCompleted = chapter.status === "completed" || isCompletedFromDB;
        const isUnlocked = index === 0 || previousCompleted;
        const isLocked = !isUnlocked;
        const isCurrent = isUnlocked && !isCompleted;
        const isLast = index === chapters.length - 1;
        const readingTime = getReadingTime(chapter.id);

        const positions = ["justify-start", "justify-center", "justify-end", "justify-center"];
        const align = positions[index % positions.length];
        const nextAlign = positions[(index + 1) % positions.length];

        return (
          <div key={chapter.id} className="relative">
            <div className={`flex ${align}`}>
              <button
                onClick={() => !isLocked && onChapterClick(chapter, index)}
                disabled={isLocked}
                className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${isLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:-translate-y-1"}`}
                aria-label={`Capítulo ${chapter.id}: ${chapter.title}`}
              >
                <div
                  className="relative w-24 h-32 rounded-md flex items-center justify-center shadow-lg transition-transform"
                  style={{
                    background: isLocked
                      ? `linear-gradient(135deg, hsl(${themeColor} / 0.25), hsl(${themeColor} / 0.15))`
                      : isCompleted
                      ? `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor} / 0.75))`
                      : `linear-gradient(135deg, hsl(${themeColor} / 0.95), hsl(${themeColor} / 0.7))`,
                    border: isCurrent ? "3px solid hsl(45 95% 60%)" : `2px solid hsl(${themeColor} / 0.6)`,
                    boxShadow: isCurrent
                      ? `0 0 0 4px hsl(45 95% 60% / 0.25), 0 10px 30px hsl(${themeColor} / 0.4)`
                      : isCompleted
                      ? `0 8px 22px hsl(${themeColor} / 0.35)`
                      : `0 6px 16px hsl(${themeColor} / 0.2)`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-l-md"
                    style={{ background: `hsl(${themeColor} / 0.5)` }}
                  />
                  <div className="absolute inset-2 border border-white/20 rounded-sm pointer-events-none" />

                  {isLocked ? (
                    <Lock className="w-8 h-8 text-white/80" strokeWidth={2.5} />
                  ) : isCompleted ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl drop-shadow">{chapter.icon}</span>
                      <CheckCircle className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  ) : (
                    <span className="text-4xl drop-shadow-md">{chapter.icon}</span>
                  )}

                  {isCurrent && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shadow-md"
                      style={{ background: "hsl(45 95% 60%)", color: `hsl(${themeColor})` }}
                    >
                      Você está aqui
                    </div>
                  )}

                  <div
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white"
                    style={{
                      background: isLocked ? `hsl(${themeColor} / 0.4)` : `hsl(${themeColor})`,
                      color: "white",
                    }}
                  >
                    {chapter.id}
                  </div>
                </div>

                <div className="text-center max-w-[140px]">
                  <p className={`text-xs font-serif font-semibold leading-tight ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                    {chapter.title}
                  </p>
                  {isCurrent && chapter.totalPages && (
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: `hsl(${themeColor})` }}>
                      {chapter.totalPages} páginas
                    </p>
                  )}
                  {isCompleted && readingTime > 0 && (
                    <p className="text-[10px] mt-0.5 text-green-600 font-medium flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> {formatReadingTime(readingTime)}
                    </p>
                  )}
                </div>
              </button>
            </div>

            {!isLast && (
              <div className="relative h-16 w-full pointer-events-none" aria-hidden="true">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="none">
                  {(() => {
                    const xMap: Record<string, number> = {
                      "justify-start": 80,
                      "justify-center": 200,
                      "justify-end": 320,
                    };
                    const x1 = xMap[align];
                    const x2 = xMap[nextAlign];
                    return (
                      <path
                        d={`M ${x1} 0 C ${x1} 32, ${x2} 32, ${x2} 64`}
                        fill="none"
                        stroke={`hsl(${themeColor} / ${isCompleted ? "0.7" : "0.35"})`}
                        strokeWidth="3"
                        strokeDasharray="6 8"
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-center mt-4">
        <div
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow"
          style={{
            background: "linear-gradient(135deg, hsl(45 95% 60%), hsl(40 90% 50%))",
            color: `hsl(${themeColor})`,
          }}
        >
          {endLabel}
        </div>
      </div>
    </div>
  );
};

export default BookQuestTrailMap;
