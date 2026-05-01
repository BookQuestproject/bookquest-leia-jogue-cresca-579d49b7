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
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{
        // Warm "paper" base — Kindle-like, low visual fatigue.
        // Top slightly lighter, bottom slightly warmer.
        background:
          "linear-gradient(180deg, hsl(40 35% 94%) 0%, hsl(38 38% 91%) 50%, hsl(32 40% 88%) 100%)",
      }}
    >
      {/* Animated ambient warmth — very subtle */}
      <div
        className="absolute inset-0 opacity-70 pointer-events-none animate-focus-breathe"
        style={{
          background:
            "radial-gradient(circle at 70% 85%, hsl(28 45% 86% / 0.6) 0%, transparent 55%), radial-gradient(circle at 15% 20%, hsl(45 50% 93% / 0.7) 0%, transparent 50%)",
        }}
      />

      {/* Floating dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-foreground/10 blur-sm animate-focus-drift"
            style={{
              width: `${4 + (i % 4) * 2}px`,
              height: `${4 + (i % 4) * 2}px`,
              left: `${(i * 73) % 100}%`,
              top: `${(i * 47) % 100}%`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${22 + (i % 5) * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Top bar — minimalist */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 z-10">
        <button
          onClick={onExit}
          aria-label="Sair do modo leitura"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {vocabularySlot}
          <button
            onClick={() => setMusicOpen(true)}
            aria-label="Ouvir música"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors backdrop-blur-sm"
          >
            <Headphones className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center — the timer is the protagonist */}
      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        <div className="relative flex items-center justify-center">
          {/* Progress ring */}
          <svg
            width={radius * 2 + 40}
            height={radius * 2 + 40}
            className="absolute inset-0 m-auto -rotate-90"
            style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}
          >
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke="hsl(var(--foreground) / 0.06)"
              strokeWidth={2}
            />
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke="hsl(var(--foreground) / 0.35)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          {/* Time */}
          <div
            className={`relative w-[${radius * 2 + 40}px] h-[${radius * 2 + 40}px] flex items-center justify-center ${
              isTimerError ? "animate-[shake_0.5s_ease-in-out]" : ""
            }`}
            style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}
          >
            <span
              className={`font-mono font-light tracking-widest text-foreground/85 select-none ${
                isPaused ? "opacity-60" : ""
              }`}
              style={{ fontSize: "clamp(3.5rem, 12vw, 6.5rem)" }}
            >
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* Single primary action */}
        <button
          onClick={onPauseResume}
          className="mt-16 w-20 h-20 rounded-full flex items-center justify-center bg-foreground/85 text-background hover:bg-foreground transition-all hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
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
          className="mt-8 text-sm text-foreground/50 hover:text-foreground/80 transition-colors flex items-center gap-2"
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
