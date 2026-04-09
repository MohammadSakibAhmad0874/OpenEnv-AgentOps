"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  accent?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  icon,
  accent = "#6366F1",
  loading,
  onClick,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="shimmer h-3 w-24 rounded mb-4" />
        <div className="shimmer h-8 w-16 rounded mb-2" />
        <div className="shimmer h-2 w-32 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn("card p-5 animate-fade-in", onClick && "cursor-pointer hover:shadow-card-hover")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">{label}</p>
        {icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accent}18` }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1 tabular-nums">{value}</p>
      <div className="flex items-center gap-2">
        {trend && trendValue && (
          <span
            className={cn(
              "text-[11px] font-medium",
              trend === "up" && "text-[#10B981]",
              trend === "down" && "text-[#EF4444]",
              trend === "neutral" && "text-[#6B7280]"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
        {sub && <p className="text-[11px] text-[#6B7280]">{sub}</p>}
      </div>
    </div>
  );
}
