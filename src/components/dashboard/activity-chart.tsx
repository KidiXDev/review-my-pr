"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActivity } from "@/hooks/use-activity";
import { Loader2 } from "lucide-react";

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize text-muted-foreground">
              {entry.dataKey}
            </span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityChart() {
  const { data: chartData, isLoading } = useActivity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[320px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-sm text-muted-foreground">
        No activity data yet. Events will appear here once webhooks are
        received.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradEvents" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: "var(--color-border)" }}
        />
        <Area
          type="monotone"
          dataKey="events"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#gradEvents)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }}
        />
        <Area
          type="monotone"
          dataKey="messages"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          fill="url(#gradMessages)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-card)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
