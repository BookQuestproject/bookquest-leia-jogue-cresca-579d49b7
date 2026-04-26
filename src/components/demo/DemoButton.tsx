import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoEntryDialog from "./DemoEntryDialog";

interface DemoButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
  fullWidth?: boolean;
  label?: string;
}

const DemoButton = ({
  variant = "outline",
  size = "default",
  className = "",
  fullWidth = false,
  label = "Explorar demonstração",
}: DemoButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`${fullWidth ? "w-full" : ""} border-accent/40 hover:border-accent hover:bg-accent/10 ${className}`}
      >
        <Sparkles className="h-4 w-4 mr-2 text-accent" />
        {label}
      </Button>
      <DemoEntryDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default DemoButton;
