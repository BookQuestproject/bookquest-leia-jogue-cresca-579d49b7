import { useState, ImgHTMLAttributes } from "react";
import { Book } from "lucide-react";

interface BookCoverProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  src?: string | null;
  alt: string;
  className?: string;
  /** Optional book title for placeholder text */
  title?: string;
}

/**
 * Universal book cover component with automatic fallback.
 * - Handles null/undefined/empty src
 * - Catches broken image URLs via onError
 * - Lazy loads by default
 * - Shows a branded placeholder (book icon + title) when no image is available
 */
const BookCover = ({ src, alt, className = "", title, ...rest }: BookCoverProps) => {
  const [errored, setErrored] = useState(false);
  const valid = typeof src === "string" && src.trim().length > 0 && /^https?:\/\//i.test(src.trim());
  const showFallback = !valid || errored;

  if (showFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 text-primary/60 ${className}`}
        aria-label={alt}
        role="img"
      >
        <Book className="w-8 h-8 mb-1 opacity-70" aria-hidden="true" />
        {title && (
          <span className="px-2 text-[10px] font-medium text-center line-clamp-3 text-foreground/70">
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={src!}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
      className={className}
      onError={() => setErrored(true)}
    />
  );
};

export default BookCover;
