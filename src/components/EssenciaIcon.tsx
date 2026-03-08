import { cn } from "@/lib/utils";

interface EssenciaIconProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

/**
 * Essência — moeda de progresso intelectual do BookQuest.
 * Ícone minimalista representando energia de conhecimento.
 */
const EssenciaIcon = ({ className, size = "sm" }: EssenciaIconProps) => {
  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size], className)}
    >
      {/* Outer diamond shape — representing crystallized knowledge */}
      <path
        d="M12 2L20 12L12 22L4 12L12 2Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner glow — energy core */}
      <path
        d="M12 6L16 12L12 18L8 12L12 6Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Central spark */}
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
};

export default EssenciaIcon;
