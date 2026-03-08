import { cn } from "@/lib/utils";

interface FounderBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

const FounderBadge = ({ size = "sm", className, showLabel = true }: FounderBadgeProps) => {
  const sizeMap = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSize = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeMap[size], "flex-shrink-0")}
      >
        {/* Shield shape */}
        <path
          d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z"
          fill="url(#founder-gradient)"
          stroke="hsl(40 80% 50%)"
          strokeWidth="1"
        />
        {/* Star in center */}
        <path
          d="M12 7L13.09 10.26L16.5 10.26L13.71 12.34L14.8 15.6L12 13.52L9.2 15.6L10.29 12.34L7.5 10.26L10.91 10.26L12 7Z"
          fill="hsl(40 90% 85%)"
        />
        <defs>
          <linearGradient id="founder-gradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(40 80% 55%)" />
            <stop offset="1" stopColor="hsl(30 70% 40%)" />
          </linearGradient>
        </defs>
      </svg>
      {showLabel && (
        <span className={cn(textSize[size], "font-bold text-[hsl(40_80%_50%)]")}>
          Fundador
        </span>
      )}
    </span>
  );
};

export default FounderBadge;
