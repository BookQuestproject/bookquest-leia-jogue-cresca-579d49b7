import { Link } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";

export interface TrailPart {
  id: number;
  act: string;
  title: string;
  subtitle: string;
}

interface Props {
  workId: string;
  parts: TrailPart[];
  completedIds: number[];
  isUnlocked: (partId: number) => boolean;
  /** HSL triple without hsl(), e.g. "222 60% 32%" */
  themeColor?: string;
}

const PART_ICONS = ["🎭", "⛪", "✝️", "📰", "🔥", "🕊️", "📖", "⚖️", "🌾", "🥁"];

const POSITIONS = ["justify-start", "justify-center", "justify-end", "justify-center"];
const X_MAP: Record<string, number> = {
  "justify-start": 80,
  "justify-center": 200,
  "justify-end": 320,
};

/**
 * Mapa da trilha literária (mesma estética das trilhas do BookQuest):
 * partes como livros conectados por caminho tracejado em zigue-zague.
 */
const NacionalTrailMap = ({ workId, parts, completedIds, isUnlocked, themeColor = "222 62% 30%" }: Props) => {
  return (
    <div className="relative max-w-md mx-auto py-4 animate-fade-in">
      {parts.map((part, index) => {
        const completed = completedIds.includes(part.id);
        const previous = index > 0 ? parts[index - 1] : null;
        const previousDone = previous ? completedIds.includes(previous.id) : true;
        const premiumLocked = !isUnlocked(part.id);
        const locked = premiumLocked || (index > 0 && !previousDone);
        const current = !locked && !completed;
        const isLast = index === parts.length - 1;

        const align = POSITIONS[index % POSITIONS.length];
        const nextAlign = POSITIONS[(index + 1) % POSITIONS.length];
        const icon = PART_ICONS[index % PART_ICONS.length];

        const Wrapper: any = locked ? "div" : Link;

        return (
          <div key={part.id} className="relative">
            <div className={`flex ${align}`}>
              <Wrapper
                {...(locked ? {} : { to: `/nacional/${workId}/parte/${part.id}` })}
                aria-label={`${part.act}: ${part.title}`}
                className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${
                  locked ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:-translate-y-1"
                }`}
              >
                {/* Livro */}
                <div
                  className="relative w-24 h-32 rounded-md flex items-center justify-center shadow-lg transition-transform"
                  style={{
                    background: locked
                      ? `linear-gradient(135deg, hsl(${themeColor} / 0.25), hsl(${themeColor} / 0.15))`
                      : completed
                      ? `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor} / 0.75))`
                      : `linear-gradient(135deg, hsl(${themeColor} / 0.95), hsl(${themeColor} / 0.7))`,
                    border: current
                      ? "3px solid hsl(45 95% 60%)"
                      : `2px solid hsl(${themeColor} / 0.6)`,
                    boxShadow: current
                      ? `0 0 0 4px hsl(45 95% 60% / 0.25), 0 10px 30px hsl(${themeColor} / 0.4)`
                      : completed
                      ? `0 8px 22px hsl(${themeColor} / 0.35)`
                      : `0 6px 16px hsl(${themeColor} / 0.2)`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-l-md"
                    style={{ background: `hsl(${themeColor} / 0.5)` }}
                  />
                  <div className="absolute inset-2 border border-white/20 rounded-sm pointer-events-none" />

                  {locked ? (
                    <Lock className="w-8 h-8 text-white/80" strokeWidth={2.5} />
                  ) : completed ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl drop-shadow">{icon}</span>
                      <CheckCircle className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  ) : (
                    <span className="text-4xl drop-shadow-md">{icon}</span>
                  )}

                  {current && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shadow-md"
                      style={{ background: "hsl(45 95% 60%)", color: `hsl(${themeColor})` }}
                    >
                      Você está aqui
                    </div>
                  )}

                  <div
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white text-white"
                    style={{ background: locked ? `hsl(${themeColor} / 0.4)` : `hsl(${themeColor})` }}
                  >
                    {part.id}
                  </div>
                </div>

                {/* Título */}
                <div className="text-center max-w-[150px]">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-accent">{part.act}</p>
                  <p
                    className={`text-xs font-serif font-semibold leading-tight ${
                      locked ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {part.title}
                  </p>
                  {premiumLocked && (
                    <Link
                      to="/premium"
                      className="mt-1 inline-block text-[10px] font-bold text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded-full"
                    >
                      Premium
                    </Link>
                  )}
                </div>
              </Wrapper>
            </div>

            {!isLast && (
              <div className="relative h-16 w-full pointer-events-none" aria-hidden="true">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="none">
                  <path
                    d={`M ${X_MAP[align]} 0 C ${X_MAP[align]} 32, ${X_MAP[nextAlign]} 32, ${X_MAP[nextAlign]} 64`}
                    fill="none"
                    stroke={`hsl(${themeColor} / ${completed ? "0.7" : "0.35"})`}
                    strokeWidth="3"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-center mt-6">
        <div
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow"
          style={{
            background: "linear-gradient(135deg, hsl(45 95% 60%), hsl(40 90% 50%))",
            color: `hsl(${themeColor})`,
          }}
        >
          🏁 Fim da Jornada
        </div>
      </div>
    </div>
  );
};

export default NacionalTrailMap;
