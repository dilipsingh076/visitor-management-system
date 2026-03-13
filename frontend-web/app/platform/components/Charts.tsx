"use client";

interface GrowthChartProps {
  data: { date: string; count: number }[];
  title?: string;
}

export function GrowthChart({ data, title }: GrowthChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <div className="h-48 flex items-end gap-0.5">
        {data.slice(-30).map((item, index) => {
          const height = (item.count / maxCount) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t group relative"
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-card text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none z-10">
                {item.count} on {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{data.length > 0 ? new Date(data[0]?.date).toLocaleDateString() : ""}</span>
        <span>{data.length > 0 ? new Date(data[data.length - 1]?.date).toLocaleDateString() : ""}</span>
      </div>
    </div>
  );
}

interface RevenueChartProps {
  data: { date: string; amount: number }[];
  title?: string;
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const maxAmount = Math.max(...data.map((d) => Number(d.amount)), 1);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <div className="h-48 flex items-end gap-1">
        {data.map((item, index) => {
          const height = (Number(item.amount) / maxAmount) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-info/30 hover:bg-info/50 transition-colors rounded-t group relative"
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-card text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none z-10">
                ₹{Number(item.amount).toLocaleString()} - {item.date}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data.slice(0, 1).map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
        {data.slice(-1).map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}

interface BreakdownChartProps {
  data: Record<string, number>;
  title?: string;
}

const COLORS = [
  "bg-primary",
  "bg-info",
  "bg-success",
  "bg-warning",
  "bg-error",
  "bg-purple-500",
];

export function BreakdownChart({ data, title }: BreakdownChartProps) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0 || total === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      
      {/* Donut-like bar visualization */}
      <div className="h-4 rounded-full overflow-hidden flex bg-muted-bg mb-4">
        {entries.map(([name, value], index) => {
          const percentage = (value / total) * 100;
          return (
            <div
              key={name}
              className={`${COLORS[index % COLORS.length]} transition-all`}
              style={{ width: `${percentage}%` }}
              title={`${name}: ${value} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {entries.map(([name, value], index) => {
          const percentage = (value / total) * 100;
          return (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${COLORS[index % COLORS.length]}`} />
                <span className="text-sm text-foreground capitalize">
                  {name.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{value}</span>
                <span className="text-xs text-muted-foreground">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface VisitorTrendChartProps {
  data: { date: string; visitors: number; checkins: number }[];
  title?: string;
}

export function VisitorTrendChart({ data, title }: VisitorTrendChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.visitors, d.checkins)),
    1
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <div className="h-48 flex items-end gap-1">
        {data.map((item, index) => {
          const visitorsHeight = (item.visitors / maxValue) * 100;
          const checkinsHeight = (item.checkins / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex gap-px items-end group relative">
              <div
                className="flex-1 bg-success/40 rounded-t"
                style={{ height: `${Math.max(visitorsHeight, 2)}%` }}
              />
              <div
                className="flex-1 bg-info/40 rounded-t"
                style={{ height: `${Math.max(checkinsHeight, 2)}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-card text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition pointer-events-none z-10">
                V: {item.visitors}, C: {item.checkins}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
          <span className="text-muted-foreground">Visitors</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-info/40" />
          <span className="text-muted-foreground">Check-ins</span>
        </div>
      </div>
    </div>
  );
}
