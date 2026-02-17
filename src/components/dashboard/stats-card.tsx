import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  index?: number;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  trend,
  index = 0,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden relative border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 group",
        "hover:border-primary/20",
        className,
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-background/50 border border-white/5 group-hover:border-primary/20 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold tracking-tight text-white group-hover:text-primary/90 transition-colors">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80">
            {trend && (
              <span
                className={cn(
                  "mr-2 font-medium flex items-center",
                  trend.positive ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%
              </span>
            )}
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
