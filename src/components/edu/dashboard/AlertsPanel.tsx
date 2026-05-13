import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AlertItem = {
  id: string;
  tone: "danger" | "warning" | "success";
  title: string;
  cta?: string;
  onClick?: () => void;
};

const toneStyles: Record<AlertItem["tone"], string> = {
  danger:  "border-l-destructive bg-destructive/5 text-destructive",
  warning: "border-l-[hsl(48_96%_55%)] bg-[hsl(48_96%_55%/0.06)] text-[hsl(48_96%_65%)]",
  success: "border-l-[hsl(142_71%_45%)] bg-[hsl(142_71%_45%/0.06)] text-[hsl(142_71%_60%)]",
};

export const AlertsPanel = ({ alerts }: { alerts: AlertItem[] }) => {
  return (
    <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          Alertas inteligentes
          {alerts.length > 0 && (
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{alerts.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Tudo em ordem por aqui. Nenhum alerta no momento.
          </p>
        )}
        {alerts.map(a => (
          <div
            key={a.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${toneStyles[a.tone]}`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 opacity-80" />
            <p className="text-xs flex-1 text-foreground/90">{a.title}</p>
            {a.cta && (
              <Button variant="ghost" size="sm" onClick={a.onClick} className="h-7 text-[11px] gap-1">
                {a.cta} <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
