import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

const useCountUp = (target: number, duration = 800) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
};

type Tone = "default" | "success" | "warning" | "danger" | "primary";

const toneClass: Record<Tone, { ring: string; icon: string; value: string }> = {
  default:  { ring: "from-accent/30 to-accent/0",                     icon: "text-accent",                    value: "text-foreground" },
  primary:  { ring: "from-[hsl(217_91%_60%/0.3)] to-transparent",     icon: "text-[hsl(217_91%_70%)]",        value: "text-foreground" },
  success:  { ring: "from-[hsl(142_71%_45%/0.3)] to-transparent",     icon: "text-[hsl(142_71%_55%)]",        value: "text-[hsl(142_71%_60%)]" },
  warning:  { ring: "from-[hsl(48_96%_55%/0.3)] to-transparent",      icon: "text-[hsl(48_96%_60%)]",         value: "text-[hsl(48_96%_60%)]" },
  danger:   { ring: "from-[hsl(0_84%_60%/0.3)] to-transparent",       icon: "text-destructive",                value: "text-destructive" },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  suffix?: string;
  tone?: Tone;
}

export const KpiCard = ({ icon: Icon, label, value, hint, suffix, tone = "default" }: Props) => {
  const display = useCountUp(value);
  const t = toneClass[tone];
  return (
    <Card className="relative overflow-hidden bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${t.ring} blur-xl`} />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-white/[0.04] ${t.icon}`}><Icon className="h-4 w-4" /></div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-bold tabular-nums ${t.value}`}>
          {display}{suffix ?? ""}
        </p>
        {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
