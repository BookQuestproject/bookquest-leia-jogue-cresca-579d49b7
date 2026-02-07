import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface ReadingCountdownProps {
  onComplete: () => void;
  themeColor: string;
  chapterTitle: string;
}

const ReadingCountdown = ({ onComplete, themeColor, chapterTitle }: ReadingCountdownProps) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="animate-fade-in text-center space-y-8">
      <div
        className="rounded-2xl p-12"
        style={{
          background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + "%")}))`,
        }}
      >
        <BookOpen className="w-12 h-12 text-white/70 mx-auto mb-4" />
        <p className="text-white/70 text-sm mb-2">Prepare seu livro</p>
        <h2 className="text-white font-serif text-xl mb-6">{chapterTitle}</h2>
        <div className="text-8xl font-mono font-bold text-white mb-4 animate-pulse">
          {count}
        </div>
        <p className="text-white/60 text-sm">
          O cronômetro começará em instantes...
        </p>
      </div>
    </div>
  );
};

export default ReadingCountdown;
