import { cn, formatValue } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value?: number;
  unit: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  warning?: boolean;
  spoiled?: boolean;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  warning, 
  spoiled,
  isLoading 
}: MetricCardProps) {
  
  let statusColor = "text-primary bg-primary/10";
  let borderColor = "border-border/50";
  
  if (spoiled) {
    statusColor = "text-spoiled bg-spoiled/10";
    borderColor = "border-spoiled/30";
  } else if (warning) {
    statusColor = "text-warning bg-warning/10";
    borderColor = "border-warning/30";
  }

  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border",
      borderColor
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", statusColor)}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <h3 className="font-medium text-muted-foreground">{title}</h3>
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-1">
        {isLoading ? (
          <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
        ) : (
          <>
            <span className={cn(
              "font-display font-bold text-4xl tracking-tight",
              spoiled ? "text-spoiled" : warning ? "text-warning" : "text-foreground"
            )}>
              {formatValue(value)}
            </span>
            <span className="text-muted-foreground font-medium pb-1">{unit}</span>
          </>
        )}
      </div>
    </div>
  );
}
