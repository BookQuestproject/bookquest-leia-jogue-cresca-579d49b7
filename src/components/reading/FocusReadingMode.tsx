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
      className="fixed inset-0 z-[60] overflow-hidden text-white"
      style={{
        // Royal blue base — matches site brand (#021f53)
        background:
          "linear-gradient(180deg, #052a6b 0%, #021f53 55%, #01153b 100%)",
      }}
    >
      {/* Animated ambient glow — subtle gold + blue breathing */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none animate-focus-breathe"
        style={{
          background:
            "radial-gradient(circle at 75% 80%, hsl(45 80% 55% / 0.18) 0%, transparent 55%), radial-gradient(circle at 20% 25%, hsl(220 70% 60% / 0.25) 0%, transparent 55%)",
        }}
      />

      {/* Floating dust particles — soft golden specks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full blur-sm animate-focus-drift"
            style={{
              width: `${3 + (i % 4) * 2}px`,
              height: `${3 + (i % 4) * 2}px`,
              left: `${(i * 73) % 100}%`,
              top: `${(i * 47) % 100}%`,
              background:
                i % 3 === 0
                  ? "hsl(45 90% 70% / 0.5)"
                  : "hsl(210 90% 85% / 0.35)",
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
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {vocabularySlot}
          <button
            onClick={() => setMusicOpen(true)}
            aria-label="Ouvir música"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 transition-colors backdrop-blur-sm"
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
              stroke="hsl(0 0% 100% / 0.1)"
              strokeWidth={2}
            />
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke="hsl(45 90% 65% / 0.7)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          {/* Time */}
          <div
            className={`relative flex items-center justify-center ${
              isTimerError ? "animate-[shake_0.5s_ease-in-out]" : ""
            }`}
            style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}
          >
            <span
              className={`font-mono font-light tracking-widest text-white/95 select-none drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)] ${
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
          className="mt-16 w-20 h-20 rounded-full flex items-center justify-center bg-[#D4AF37] text-[#021f53] hover:bg-[#e5c252] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#D4AF37]/30"
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
          className="mt-8 text-sm text-white/60 hover:text-white/90 transition-colors flex items-center gap-2"
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
