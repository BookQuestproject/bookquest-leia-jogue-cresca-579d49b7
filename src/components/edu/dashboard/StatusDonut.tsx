import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface Props {
  ahead: number;
  onTrack: number;
  late: number;
}

export const StatusDonut = ({ ahead, onTrack, late }: Props) => {
  const data = [
    { name: "Adiantados", value: ahead, color: "hsl(142 71% 50%)" },
    { name: "No prazo",    value: onTrack, color: "hsl(48 96% 55%)" },
    { name: "Atrasados",  value: late, color: "hsl(0 84% 60%)" },
  ];
  const total = ahead + onTrack + late;

  return (
    <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-accent" />
          Status dos alunos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(230 50% 10%)", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold tabular-nums">{total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">alunos</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {data.map(d => (
            <div key={d.name} className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px] text-muted-foreground">{d.name}</span>
              </div>
              <p className="text-sm font-semibold tabular-nums">{d.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDonut;
