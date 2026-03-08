import { useState } from "react";
import { Flame, Snowflake, X, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { streakLevels, getStreakColor } from "@/components/StreakFlame";

type AnimationScene =
  | "first-light"   // 0 → 1
  | "freeze"        // frozen today
  | "color-change"  // transition between levels
  | "extinguish";   // streak → 0

const scenes: { id: AnimationScene; label: string; description: string; icon: any }[] = [
  { id: "first-light", label: "Primeira Chama", description: "Quando o streak acende pela primeira vez", icon: Flame },
  { id: "freeze", label: "Congelamento", description: "Quando o streak é congelado", icon: Snowflake },
  { id: "color-change", label: "Evolução de Cor", description: "Quando a chama evolui de nível", icon: Flame },
  { id: "extinguish", label: "Chama Apagada", description: "Quando o streak é perdido", icon: Flame },
];

const StreakAnimationPreview = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [activeScene, setActiveScene] = useState<AnimationScene | null>(null);
  const [phase, setPhase] = useState(0);

  const playScene = (scene: AnimationScene) => {
    setActiveScene(scene);
    setPhase(0);
    setTimeout(() => setPhase(1), 100);
    setTimeout(() => setPhase(2), 800);
    setTimeout(() => setPhase(3), 2000);
  };

  const renderPreview = () => {
    if (!activeScene) {
      return (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Selecione uma animação para visualizar
        </div>
      );
    }

    if (activeScene === "first-light") {
      const color = streakLevels[streakLevels.length - 1].color; // Início Ígneo
      return (
        <div className="h-48 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle, ${color}15, transparent 70%)`,
              opacity: phase >= 1 ? 1 : 0,
            }}
          />

          {/* Flame icon */}
          <div
            className="relative transition-all duration-700 ease-out"
            style={{
              transform: phase >= 1 ? "scale(1)" : "scale(0.3)",
              opacity: phase >= 1 ? 1 : 0,
            }}
          >
            <Flame
              className="w-16 h-16 transition-all duration-500"
              style={{
                color: phase === 0 ? "hsl(var(--muted-foreground))" : color,
                filter: phase >= 2 ? `drop-shadow(0 0 12px ${color})` : "grayscale(1) opacity(0.3)",
                animation: phase >= 2 ? "streak-flame-pulse 1.5s ease-in-out infinite" : undefined,
              }}
            />
            {/* Spark particles */}
            {phase >= 1 && phase < 3 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: color,
                      left: "50%",
                      top: "50%",
                      animation: `streak-spark-${i} 0.8s ease-out forwards`,
                      opacity: 0,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <p
            className="mt-4 text-sm font-bold transition-all duration-500"
            style={{
              color,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            🔥 Sequência iniciada!
          </p>

          <style>{`
            ${[...Array(6)].map((_, i) => {
              const angle = (i / 6) * 360;
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * 40;
              const y = Math.sin(rad) * 40;
              return `
                @keyframes streak-spark-${i} {
                  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                  100% { opacity: 0; transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0); }
                }
              `;
            }).join("")}
          `}</style>
        </div>
      );
    }

    if (activeScene === "freeze") {
      return (
        <div className="h-48 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Ice overlay */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background: phase >= 1
                ? "radial-gradient(circle, rgba(56, 189, 248, 0.12), transparent 70%)"
                : "transparent",
            }}
          />

          {/* Frost ring */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <div
              className="w-24 h-24 rounded-full border-2 border-blue-400/30"
              style={{
                animation: phase >= 2 ? "frost-ring 2s ease-in-out infinite" : undefined,
              }}
            />
          </div>

          <div className="relative">
            <Flame
              className="w-16 h-16 transition-all duration-700"
              style={{
                color: phase >= 1 ? "#38bdf8" : "#FF7A00",
                filter: phase >= 1
                  ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))"
                  : "drop-shadow(0 0 4px #FF7A0060)",
                animation: phase >= 2 ? "frost-pulse 2s ease-in-out infinite" : undefined,
              }}
            />
            {phase >= 1 && (
              <Snowflake
                className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 transition-all duration-500"
                style={{
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 2 ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "all 1s ease",
                }}
              />
            )}
          </div>

          <p
            className="mt-4 text-sm font-bold text-blue-400 transition-all duration-500"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            ❄️ Sequência congelada
          </p>

          <style>{`
            @keyframes frost-ring {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.15); opacity: 0.6; }
            }
            @keyframes frost-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>
      );
    }

    if (activeScene === "color-change") {
      const fromLevel = streakLevels[streakLevels.length - 1]; // Início Ígneo
      const toLevel = streakLevels[streakLevels.length - 2];   // Chama Vigente
      const fromColor = fromLevel.color;
      const toColor = toLevel.color;

      return (
        <div className="h-48 flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 transition-all duration-1500"
            style={{
              background: phase >= 2
                ? `radial-gradient(circle, ${toColor}20, transparent 70%)`
                : `radial-gradient(circle, ${fromColor}15, transparent 70%)`,
            }}
          />

          <div className="relative">
            <Flame
              className="w-16 h-16 transition-all duration-1000 ease-in-out"
              style={{
                color: phase >= 2 ? toColor : fromColor,
                filter: `drop-shadow(0 0 ${phase >= 2 ? "14px" : "6px"} ${phase >= 2 ? toColor : fromColor}80)`,
                transform: phase === 1 ? "scale(1.3)" : "scale(1)",
                animation: phase >= 2 ? "streak-flame-pulse 1.5s ease-in-out infinite" : undefined,
              }}
            />
            {/* Color transition ring */}
            {phase >= 1 && phase < 3 && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${toColor}`,
                  animation: "color-ring-expand 1s ease-out forwards",
                  opacity: 0,
                }}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 transition-all duration-500" style={{ opacity: phase >= 2 ? 1 : 0 }}>
            <span className="text-xs font-medium" style={{ color: fromColor }}>{fromLevel.label}</span>
            <span className="text-muted-foreground text-xs">→</span>
            <span className="text-xs font-bold" style={{ color: toColor }}>{toLevel.label}</span>
          </div>

          <p
            className="mt-1 text-sm font-bold transition-all duration-500"
            style={{
              color: toColor,
              opacity: phase >= 2 ? 1 : 0,
            }}
          >
            ✨ Chama evoluiu!
          </p>

          <style>{`
            @keyframes color-ring-expand {
              0% { opacity: 0.8; transform: scale(0.5); }
              100% { opacity: 0; transform: scale(2.5); }
            }
          `}</style>
        </div>
      );
    }

    if (activeScene === "extinguish") {
      const color = streakLevels[streakLevels.length - 1].color;

      return (
        <div className="h-48 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative">
            <Flame
              className="w-16 h-16 transition-all duration-1000 ease-in-out"
              style={{
                color: phase >= 2 ? "hsl(var(--muted-foreground))" : color,
                filter: phase >= 2
                  ? "grayscale(1) opacity(0.3)"
                  : `drop-shadow(0 0 8px ${color}60)`,
                transform: phase >= 2 ? "scale(0.8)" : "scale(1)",
                animation: phase === 1 ? "flame-flicker 0.15s ease-in-out infinite" : undefined,
              }}
            />
            {/* Smoke particles */}
            {phase >= 2 && (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-muted-foreground/20"
                    style={{
                      left: `calc(50% + ${(i - 1.5) * 8}px)`,
                      top: "30%",
                      animation: `smoke-rise-${i} 1.5s ease-out ${i * 0.15}s forwards`,
                      opacity: 0,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <p
            className="mt-4 text-sm font-bold text-muted-foreground transition-all duration-500"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
            }}
          >
            💨 Sequência perdida
          </p>

          <style>{`
            @keyframes flame-flicker {
              0%, 100% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(0.95) rotate(-3deg); }
              75% { transform: scale(1.05) rotate(3deg); }
            }
            ${[...Array(4)].map((_, i) => `
              @keyframes smoke-rise-${i} {
                0% { opacity: 0.6; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-${30 + i * 10}px) scale(${1.5 + i * 0.2}); }
              }
            `).join("")}
          `}</style>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Preview — Animações de Streak
          </DialogTitle>
        </DialogHeader>

        {/* Preview area */}
        <div className="rounded-xl bg-background border border-border overflow-hidden">
          {renderPreview()}
        </div>

        {/* Scene buttons */}
        <div className="grid grid-cols-2 gap-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => playScene(scene.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                activeScene === scene.id
                  ? "border-accent/40 bg-accent/5"
                  : "border-border hover:border-accent/20 hover:bg-muted/30"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                scene.id === "freeze" ? "bg-blue-400/10" : "bg-accent/10"
              }`}>
                <scene.icon className={`w-4 h-4 ${
                  scene.id === "freeze" ? "text-blue-400" : "text-accent"
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{scene.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{scene.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Replay button */}
        {activeScene && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => playScene(activeScene)}
          >
            <Play className="w-3.5 h-3.5" />
            Reproduzir novamente
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StreakAnimationPreview;
