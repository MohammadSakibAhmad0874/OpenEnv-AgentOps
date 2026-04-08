"use client";

import { cn, formatRelative, gradeColor } from "@/lib/utils";
import type { SessionRecord } from "@/lib/api";

interface TaskCardProps {
  session: SessionRecord;
  envColor?: string;
  envName?: string;
  onClick?: () => void;
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  P1: { label: "P1 Critical", color: "#EF4444" },
  P2: { label: "P2 High", color: "#F59E0B" },
  P3: { label: "P3 Normal", color: "#6B7280" },
};

export function TaskCard({ session, envColor = "#6366F1", envName, onClick }: TaskCardProps) {
  const score = session.total_reward;
  const pct = Math.round((score / 100) * 100);
  const done = session.done;
  const steps = session.steps;

  return (
    <div
      className={cn(
        "bg-[#1F2937] border border-[#374151] rounded-lg p-3.5 cursor-pointer",
        "hover:border-[#4B5563] hover:shadow-card-hover transition-all duration-150 animate-fade-in"
      )}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: envColor }}
          />
          <p className="text-[11px] text-[#6B7280] font-medium">{envName ?? session.env_id}</p>
        </div>
        <span className={cn("text-[10px] font-semibold", done ? "text-[#10B981]" : "text-[#F59E0B]")}>
          {done ? "✓ Done" : "● Running"}
        </span>
      </div>

      {/* Session ID */}
      <p className="text-[12px] text-white font-medium mb-1 font-mono truncate">
        {session.session_id.slice(0, 18)}…
      </p>
      <p className="text-[11px] text-[#6B7280] mb-3">
        Scenario: <span className="text-[#9CA3AF]">{session.scenario_id ?? "—"}</span>
      </p>

      {/* Score bar */}
      {done && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#6B7280]">Score</span>
            <span
              className="text-[11px] font-bold"
              style={{ color: pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444" }}
            >
              {score.toFixed(1)} / 100
            </span>
          </div>
          <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, pct)}%`,
                backgroundColor: pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-[#4B5563]">
        <span>{steps} steps</span>
        <span>{formatRelative(session.created_at)}</span>
      </div>
    </div>
  );
}
