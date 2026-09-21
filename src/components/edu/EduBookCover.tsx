import { useState } from "react";
import { BookOpen } from "lucide-react";

interface EduBookCoverProps {
  src?: string | null;
  fallbackSrc?: string | null;
  title: string;
  alt?: string;
  className?: string;
}

const EduBookCover = ({
  src,
  fallbackSrc,
  title,
  alt = title,
  className = "",
}: EduBookCoverProps) => {
  const initial = src || fallbackSrc || "";
  const [currentSrc, setCurrentSrc] = useState(initial);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setCurrentSrc("");
  };

  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        className={`block h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-white ${className}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -left-8 bottom-[-24px] h-28 w-28 rounded-full bg-black/10" />
      <div className="relative flex h-full flex-col items-center justify-center p-4 text-center">
        <BookOpen className="h-10 w-10 opacity-90" />
        <p className="mt-4 text-sm font-bold leading-tight">{title}</p>
      </div>
    </div>
  );
};

export default EduBookCover;
