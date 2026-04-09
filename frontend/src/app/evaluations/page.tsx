"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { api, type SessionRecord, type ScoreCard } from "@/lib/api";
import { formatRelative } from "@/lib/utils";

const ENV_COLORS: Record<string, string> = {
  supportdesk: "#6366F1",
  cybersoc: "#EF4444",
  refundops: "#F59E0B",
  clinicops: "#10B981",
};

const ENV_NAMES: Record<string, string> = {
  supportdesk: "SupportDesk",
  cybersoc: "CyberSOC",
  refundops: "RefundOps",
  clinicops: "ClinicOps",
};

export default function EvaluationsPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [replay, setReplay] = useState<SessionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.listAllSessions()
      .then((d) => setSessions(d.sessions))
      .finally(() => setLoading(false));
  }, []);

  const completedSessions = sessions.filter((s) => s.done);
  const filtered = filter === "all"
    ? completedSessions
    : completedSessions.filter((s) => s.env_id === filter);

  const envSummary = ["supportdesk", "cybersoc", "refundops", "clinicops"].map((envId) => {
    const envSessions = completedSessions.filter((s) => s.env_id === envId);
    const avg = envSessions.length
      ? envSessions.reduce((sum, s) => sum + s.total_reward, 0) / envSessions.length
      : null;
    return { envId, count: envSessions.length, avg };
  });

  const handleReplay = async (s: SessionRecord) => {
    const full = await api.getReplay(s.session_id).catch(() => null);
    setReplay(full as SessionRecord);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title="Evaluations" subtitle={`${completedSessions.length} completed sessions`} />

        <div className="flex-1 flex overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Agent Scorecard</h2>
              <p className="text-[13px] text-[#6B7280]">Deterministic evaluation results across all environments.</p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger">
              {envSummary.map(({ envId, count, avg }) => (
                <div key={envId} className="card p-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ENV_COLORS[envId] }} />
                    <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      {ENV_NAMES[envId]}
                    </span>
                  </div>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: avg !== null ? (avg >= 80 ? "#10B981" : avg >= 60 ? "#F59E0B" : "#EF4444") : "#4B5563" }}
                  >
                    {avg !== null ? `${avg.toFixed(0)}` : "—"}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">{count} sessions</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", ...Object.keys(ENV_NAMES)].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all capitalize ${
                    filter === f
                      ? "bg-[#6366F1] border-[#6366F1] text-white"
                      : "bg-[#111827] border-[#374151] text-[#6B7280] hover:border-[#6366F1]"
                  }`}
                >
                  {f === "all" ? "All" : ENV_NAMES[f]}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[#1F2937] bg-[#111827]">
                      <th className="text-left py-3 px-4 text-[#6B7280] font-medium">Session</th>
                      <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Environment</th>
                      <th className="text-left py-3 px-3 text-[#6B7280] font-medium">Scenario</th>
                      <th className="text-center py-3 px-3 text-[#6B7280] font-medium">Score</th>
                      <th className="text-center py-3 px-3 text-[#6B7280] font-medium">Grade</th>
                      <th className="text-center py-3 px-3 text-[#6B7280] font-medium">Steps</th>
                      <th className="text-center py-3 px-3 text-[#6B7280] font-medium">Invalid</th>
                      <th className="text-left py-3 px-3 text-[#6B7280] font-medium">When</th>
                      <th className="text-center py-3 px-3 text-[#6B7280] font-medium">Replay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-[#1F2937]">
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j} className="py-3 px-4">
                              <div className="shimmer h-3 rounded w-full" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-[#4B5563]">
                          No completed sessions. Run an environment first.
                        </td>
                      </tr>
                    )}
                    {filtered.map((s) => {
                      const pct = Math.round((s.total_reward / 100) * 100);
                      const grade =
                        pct >= 95 ? "A+" : pct >= 85 ? "A" : pct >= 75 ? "B" : pct >= 65 ? "C" : pct >= 50 ? "D" : "F";
                      const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
                      return (
                        <tr
                          key={s.session_id}
                          className="border-b border-[#1F2937] last:border-0 hover:bg-[#111827] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="text-[#9CA3AF] font-mono text-[11px]">
                              {s.session_id.slice(0, 14)}…
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ENV_COLORS[s.env_id] }} />
                              <span className="text-[#D1D5DB]">{ENV_NAMES[s.env_id] ?? s.env_id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#6B7280] font-mono text-[11px]">
                            {s.scenario_id ?? "—"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-16 h-1.5 bg-[#111827] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: color }}
                                />
                              </div>
                              <span className="font-bold" style={{ color }}>{s.total_reward.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-[13px]" style={{ color }}>{grade}</span>
                          </td>
                          <td className="py-3 px-3 text-center text-[#9CA3AF]">{s.steps}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={s.invalid_actions > 0 ? "text-[#EF4444]" : "text-[#4B5563]"}>
                              {s.invalid_actions}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#6B7280]">{formatRelative(s.created_at)}</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleReplay(s)}
                              className="px-2.5 py-1 rounded bg-[#111827] border border-[#374151] text-[10px] text-[#9CA3AF] hover:border-[#6366F1] hover:text-[#818CF8] transition-all"
                            >
                              ▶ Replay
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Replay panel */}
          {replay && (
            <div className="w-80 flex-shrink-0 border-l border-[#1F2937] bg-[#0D1117] flex flex-col">
              <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
                <p className="text-[12px] font-semibold text-white">Replay Viewer</p>
                <button
                  onClick={() => setReplay(null)}
                  className="text-[#4B5563] hover:text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-4 text-[11px] border-b border-[#1F2937]">
                <p className="text-[#6B7280] mb-1">Session: <span className="text-[#9CA3AF] font-mono">{replay.session_id.slice(0, 18)}…</span></p>
                <p className="text-[#6B7280]">Env: <span className="text-[#9CA3AF]">{ENV_NAMES[replay.env_id] ?? replay.env_id}</span></p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 terminal">
                {(replay.action_log ?? []).map((entry, i) => (
                  <div key={i} className="mb-3 pb-3 border-b border-[#1F2937] last:border-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[#6366F1]">step({entry.step})</span>
                      <span className={entry.reward_value >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                        {entry.reward_value >= 0 ? "+" : ""}{entry.reward_value.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[#818CF8] mb-0.5">{entry.action_type}</p>
                    <p className="text-[#6B7280] text-[10px] leading-relaxed">{entry.reward_explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
