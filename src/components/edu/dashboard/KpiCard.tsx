import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

const useCountUp = (target: number, duration = 700) => {
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

const toneCfg: Record<Tone, { icon: string; chip: string; spark: string; ring: string }> = {
  default: { icon: "text-foreground/80",                chip: "bg-white/[0.04] text-muted-foreground", spark: "hsl(217 91% 65%)", ring: "from-white/5 to-transparent" },
  primary: { icon: "text-[hsl(217_91%_70%)]",           chip: "bg-[hsl(217_91%_60%/0.10)] text-[hsl(217_91%_75%)]", spark: "hsl(217 91% 65%)", ring: "from-[hsl(217_91%_60%/0.15)] to-transparent" },
  success: { icon: "text-[hsl(142_71%_55%)]",           chip: "bg-[hsl(142_71%_45%/0.10)] text-[hsl(142_71%_60%)]", spark: "hsl(142 71% 55%)", ring: "from-[hsl(142_71%_45%/0.15)] to-transparent" },
  warning: { icon: "text-[hsl(48_96%_60%)]",            chip: "bg-[hsl(48_96%_55%/0.10)] text-[hsl(48_96%_65%)]",  spark: "hsl(48 96% 60%)",  ring: "from-[hsl(48_96%_55%/0.15)] to-transparent" },
  danger:  { icon: "text-destructive",                  chip: "bg-destructive/10 text-destructive",                  spark: "hsl(0 84% 65%)",   ring: "from-destructive/15 to-transparent" },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  suffix?: string;
  tone?: Tone;
  delta?: number; // percent vs previous period
  spark?: number[];
}

export const KpiCard = ({ icon: Icon, label, value, hint, suffix, tone = "default", delta, spark }: Props) => {
  const display = useCountUp(value);
  const t = toneCfg[tone];
  const data = (spark ?? []).map((v, i) => ({ i, v }));
  const id = `${label}-${tone}`.replace(/\s+/g, "-");

  return (
    <Card className="group relative overflow-hidden border-white/[0.06] bg-[hsl(230_50%_9%/0.7)] hover:bg-[hsl(230_50%_11%/0.75)] backdrop-blur-xl transition-colors p-4">
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${t.ring} blur-2xl pointer-events-none`} />
      <div className="flex items-center justify-between mb-2.5 relative">
        <div className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-lg bg-white/[0.04] grid place-items-center ${t.icon}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        </div>
        {typeof delta === "number" && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${delta >= 0 ? "bg-[hsl(142_71%_45%/0.12)] text-[hsl(142_71%_65%)]" : "bg-destructive/10 text-destructive"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 relative">
        <div className="min-w-0">
          <p className="text-[28px] leading-none font-bold tabular-nums text-foreground">
            {display}<span className="text-base text-muted-foreground font-semibold">{suffix ?? ""}</span>
          </p>
          {hint && <p className="text-[10.5px] text-muted-foreground mt-1.5 truncate">{hint}</p>}
        </div>
        {data.length > 0 && (
          <div className="h-10 w-20 shrink-0 -mr-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`kpi-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.spark} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={t.spark} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={t.spark} strokeWidth={1.6} fill={`url(#kpi-${id})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
