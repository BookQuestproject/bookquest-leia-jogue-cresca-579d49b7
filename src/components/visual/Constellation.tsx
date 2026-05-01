/**
 * Small decorative constellation — used as a corner accent on key pages.
 * Pure SVG, very low opacity, pointer-events disabled. Doesn't compete with
 * page content; meant to be discovered, not seen.
 */
type Variant = "ursa" | "triangle" | "kite" | "arc";

interface ConstellationProps {
  variant?: Variant;
  /** corner position */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** width in px */
  size?: number;
  /** opacity 0-1 */
  opacity?: number;
  className?: string;
}

const PATHS: Record<Variant, { points: [number, number][]; lines: [number, number][] }> = {
  ursa: {
    points: [
      [10, 60], [28, 50], [48, 56], [68, 44], [86, 36], [104, 30], [120, 24],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
  },
  triangle: {
    points: [[20, 20], [100, 36], [56, 92]],
    lines: [[0, 1], [1, 2], [2, 0]],
  },
  kite: {
    points: [[60, 8], [104, 56], [60, 110], [16, 56]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
  },
  arc: {
    points: [[12, 80], [40, 50], [76, 32], [110, 38], [124, 64]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
};

// Top placements are pushed well below the page header zone (where buttons
// like Settings, Essência counter, etc. live) so the constellation never
// visually overlaps interactive controls.
const POSITION_STYLES: Record<NonNullable<ConstellationProps["position"]>, React.CSSProperties> = {
  "top-left":     { top: 140, left: 16  },
  "top-right":    { top: 140, right: 16 },
  "bottom-left":  { bottom: 24, left: 16 },
  "bottom-right": { bottom: 24, right: 16 },
};

const Constellation = ({
  variant = "triangle",
  position = "top-right",
  size = 140,
  opacity = 0.18,
  className,
}: ConstellationProps) => {
  const { points, lines } = PATHS[variant];

  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size * (120 / 140)}
      viewBox="0 0 140 120"
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
        ...POSITION_STYLES[position],
      }}
    >
      {/* connecting lines */}
      <g stroke="hsl(45 90% 80%)" strokeWidth={0.5} opacity={0.6}>
        {lines.map(([a, b], i) => {
          const [x1, y1] = points[a];
          const [x2, y2] = points[b];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      {/* stars */}
      {points.map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={3} fill="hsl(45 90% 80%)" opacity={0.18} />
          <circle cx={cx} cy={cy} r={1.2} fill="hsl(45 95% 88%)" />
        </g>
      ))}
    </svg>
  );
};

export default Constellation;
