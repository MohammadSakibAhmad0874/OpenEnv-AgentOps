"use client";

import { cn } from "@/lib/utils";
import type { SessionRecord } from "@/lib/api";
import { TaskCard } from "./TaskCard";

interface Column {
  id: string;
  label: string;
  color: string;
  filter: (s: SessionRecord) => boolean;
}

const COLUMNS: Column[] = [
  {
    id: "new",
    label: "New",
    color: "#6B7280",
    filter: (s) => !s.done && s.steps === 0,
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "#6366F1",
    filter: (s) => !s.done && s.steps > 0,
  },
  {
    id: "decision",
    label: "Decision",
    color: "#F59E0B",
    filter: (s) => !s.done && s.steps >= 3,
  },
  {
    id: "completed",
    label: "Completed",
    color: "#10B981",
    filter: (s) => s.done,
  },
];

interface KanbanBoardProps {
  sessions: SessionRecord[];
  envColor?: string;
  envName?: string;
  onCardClick?: (session: SessionRecord) => void;
}

export function KanbanBoard({ sessions, envColor, envName, onCardClick }: KanbanBoardProps) {
  // Smart bucketing: in_progress overrides new&decision so sessions only appear once
  const getColumn = (s: SessionRecord): string => {
    if (s.done) return "completed";
    if (s.steps === 0) return "new";
    if (s.steps >= 5) return "decision";
    return "in_progress";
  };

  const bucketed = COLUMNS.reduce<Record<string, SessionRecord[]>>((acc, col) => {
    acc[col.id] = sessions.filter((s) => getColumn(s) === col.id);
    return acc;
  }, {});

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#4B5563] text-sm">
        No sessions yet — hit <span className="mx-1 px-2 py-0.5 rounded bg-[#1F2937] border border-[#374151] font-mono text-xs">Reset</span> to start a new session.
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const items = bucketed[col.id] ?? [];
        return (
          <div key={col.id} className="kanban-col min-w-[220px]">
            {/* Column header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  {col.label}
                </span>
              </div>
              <span className="text-[11px] text-[#4B5563] bg-[#0B0F14] px-1.5 py-0.5 rounded font-mono">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {items.map((s) => (
                <TaskCard
                  key={s.session_id}
                  session={s}
                  envColor={envColor}
                  envName={envName}
                  onClick={() => onCardClick?.(s)}
                />
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 text-[11px] text-[#374151]">Empty</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
