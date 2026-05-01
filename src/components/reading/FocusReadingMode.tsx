import { useState } from "react";
import { Play, Pause, Headphones, ArrowLeft, CheckCircle } from "lucide-react";
import MusicPickerDialog from "./MusicPickerDialog";

interface FocusReadingModeProps {
  elapsedTime: number;
  isPaused: boolean;
  onPauseResume: () => void;
  onFinish: () => void;
  onExit: () => void;
  isTimerError?: boolean;
  /** Optional progress 0-1 to show as ring around timer (e.g., session target) */
  progress?: number;
  vocabularySlot?: React.ReactNode;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const FocusReadingMode = ({
  elapsedTime,
  isPaused,
  onPauseResume,
  onFinish,
  onExit,
  isTimerError,
  progress,
  vocabularySlot,
}: FocusReadingModeProps) => {
  const [musicOpen, setMusicOpen] = useState(false);

  // Ring progress
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const ringProgress = Math.min(Math.max(progress ?? (elapsedTime % 1800) / 1800, 0), 1);
  const dashOffset = circumference * (1 - ringProgress);

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden text-white animate-fade-in"
      style={{
        // Royal blue base — matches site brand (#021f53)
        background:
          "linear-gradient(180deg, #052a6b 0%, #021f53 55%, #01153b 100%)",
      }}
    >
      {/* Soft warm vignette to reduce edge contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.25) 100%)",
        }}
      />

      {/* Animated ambient glow — warm gold + soft blue breathing */}
      <div
        className="absolute inset-0 opacity-50 pointer-events-none animate-focus-breathe"
        style={{
          background:
            "radial-gradient(circle at 75% 80%, hsl(40 65% 60% / 0.14) 0%, transparent 60%), radial-gradient(circle at 20% 25%, hsl(215 55% 65% / 0.18) 0%, transparent 60%)",
        }}
      />

      {/* Floating dust particles — fireflies / illuminated dust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 45 }).map((_, i) => {
          // Pseudo-random but stable distribution using golden ratio
          const phi = 0.6180339887;
          const rx = ((i * phi) % 1) * 100;
          const ry = ((i * phi * 2.3) % 1) * 100;
          const sizeRand = (i * 17) % 10;
          const size = 1.5 + (sizeRand / 10) * 3.5; // 1.5px – 5px
          const opacity = 0.1 + ((i * 7) % 26) / 100; // 0.10 – 0.35
          const isGold = i % 3 !== 0;
          const blurAmount = sizeRand > 6 ? "blur-[2px]" : sizeRand > 3 ? "blur-sm" : "blur-[1px]";
          const driftAnim = i % 3 === 0 ? "animate-focus-drift-a" : i % 3 === 1 ? "animate-focus-drift-b" : "animate-focus-drift-c";
          const duration = 35 + ((i * 11) % 30); // 35s – 65s
          const delay = -((i * 2.7) % 40); // negative so they start mid-animation
          const breatheDuration = 8 + ((i * 5) % 5); // 8s – 12s

          return (
            <span
              key={i}
              className={`absolute rounded-full ${blurAmount} ${driftAnim}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${rx}%`,
                top: `${ry}%`,
                background: isGold
                  ? `hsl(45 90% 75% / ${opacity})`
                  : `hsl(210 90% 88% / ${opacity * 0.8})`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            >
              <span
                className="block w-full h-full rounded-full animate-focus-twinkle"
                style={{
                  background: "inherit",
                  animationDuration: `${breatheDuration}s`,
                  animationDelay: `${-((i * 1.9) % 10)}s`,
                }}
              />
            </span>
          );
        })}
      </div>

      {/* Top bar — minimalist */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 z-10 animate-fade-in">
        <button
          onClick={onExit}
          aria-label="Sair do modo leitura"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:bg-white/25 text-white/85 transition-all duration-200 backdrop-blur-md hover:scale-[1.03] active:scale-[0.97] border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {vocabularySlot}
          <button
            onClick={() => setMusicOpen(true)}
            aria-label="Ouvir música"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:bg-white/25 text-white/85 transition-all duration-200 backdrop-blur-md hover:scale-[1.03] active:scale-[0.97] border border-white/10"
          >
            <Headphones className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center — the timer is the protagonist */}
      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        <div className="relative flex items-center justify-center">
          {/* Soft active glow behind the timer */}
          <div
            className={`absolute rounded-full pointer-events-none transition-opacity duration-700 ${
              isPaused ? "opacity-30" : "opacity-100 animate-focus-glow-pulse"
            }`}
            style={{
              width: radius * 2 + 80,
              height: radius * 2 + 80,
              background:
                "radial-gradient(circle, hsl(45 80% 60% / 0.18) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          {/* Time */}
          <div
            className={`relative flex items-center justify-center ${
              isTimerError ? "animate-[shake_0.5s_ease-in-out]" : ""
            }`}
            style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}
          >
            <span
              className={`font-serif font-medium tracking-wide text-white/95 select-none transition-all duration-500 ${
                isPaused
                  ? "opacity-55 drop-shadow-[0_2px_8px_rgba(255,255,255,0.08)]"
                  : "drop-shadow-[0_2px_16px_rgba(212,175,55,0.35)]"
              }`}
              style={{ fontSize: "clamp(4rem, 14vw, 7.5rem)" }}
            >
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* Single primary action */}
        <button
          onClick={onPauseResume}
          className="mt-16 w-20 h-20 rounded-full flex items-center justify-center bg-[#D4AF37] text-[#021f53] hover:bg-[#e5c252] transition-all duration-300 ease-out hover:scale-[1.06] active:scale-[0.94] shadow-lg shadow-[#D4AF37]/20"
          aria-label={isPaused ? "Continuar leitura" : "Pausar leitura"}
        >
          {isPaused ? (
            <Play className="w-7 h-7 ml-1" />
          ) : (
            <Pause className="w-7 h-7" />
          )}
        </button>

        {/* Subtle finish link */}
        <button
          onClick={onFinish}
          className="mt-8 text-sm text-white/60 hover:text-white/90 transition-all duration-200 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
        >
          <CheckCircle className="w-4 h-4" />
          Finalizar leitura
        </button>
      </div>

      <MusicPickerDialog open={musicOpen} onOpenChange={setMusicOpen} />
    </div>
  );
};

export default FocusReadingMode;
