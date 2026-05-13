import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

interface Point { day: string; value: number }
interface Props {
  title: string;
  data: Point[];
  unit?: string;
  color?: string;
}

export const ProgressLineChart = ({ title, data, unit = "%", color = "hsl(217 91% 65%)" }: Props) => {
  return (
    <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 100% / 0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "hsl(230 50% 10%)", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v}${unit}`, ""]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#g-${title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressLineChart;
