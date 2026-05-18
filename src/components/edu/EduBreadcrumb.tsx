import { Link } from "react-router-dom";
import { Home, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface BreadcrumbSegment {
  label: string;
  to?: string;
  icon?: LucideIcon;
}

interface Props {
  segments: BreadcrumbSegment[];
  trailing?: ReactNode;
}

/**
 * Arrow-shaped breadcrumb chips, brand colors.
 * First chip = home (primary). Last chip = current (gold/accent). Middle = surface.
 */
const ARROW_RIGHT = "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)";
const ARROW_MIDDLE = "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)";

const EduBreadcrumb = ({ segments, trailing }: Props) => {
  if (!segments.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-y-2">
      <ol className="flex items-stretch -space-x-2">
        {segments.map((seg, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === segments.length - 1;
          const Icon = seg.icon ?? (isFirst ? Home : undefined);

          const base =
            "relative flex items-center gap-1.5 pr-5 text-[12px] font-semibold transition-all duration-200 select-none";
          const padLeft = isFirst ? "pl-3.5" : "pl-5";
          const clip = isFirst ? ARROW_RIGHT : ARROW_MIDDLE;

          const tone = isLast
            ? "bg-accent text-accent-foreground shadow-[0_4px_14px_-4px_hsl(var(--accent)/0.6)]"
            : isFirst
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground";

          const content = (
            <span
              className={`${base} ${padLeft} ${tone} py-2`}
              style={{ clipPath: clip, zIndex: segments.length - idx }}
            >
              {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
              <span className="truncate max-w-[200px]">{seg.label}</span>
            </span>
          );

          return (
            <li key={`${seg.label}-${idx}`} className="flex">
              {seg.to && !isLast ? (
                <Link to={seg.to} className="flex">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
      {trailing && <div className="ml-3">{trailing}</div>}
    </nav>
  );
};

export default EduBreadcrumb;
