"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/stores/agentStore";
import type { EnvironmentMeta } from "@/lib/api";

interface ActionConsoleProps {
  env: EnvironmentMeta;
}

const ACTION_TEMPLATES: Record<string, Record<string, unknown>> = {
  classify: { category: "billing", priority: "P1" },
  ask_question: { question: "Can you provide your order ID?" },
  resolve: { resolution_note: "Issue resolved by resetting account access." },
  refund: { amount: 99.99, reason: "Wrong item received." },
  escalate: { team: "Engineering", reason: "Production API outage requires engineering team." },
  classify_alert: { alert_id: "ALT-001", severity: "critical" },
  escalate_alert: { alert_id: "ALT-001", team: "SOC" },
  dismiss: { alert_id: "ALT-002", reason: "Confirmed false positive — internal monitoring scan." },
  block_ip: { alert_id: "ALT-003", ip: "185.220.101.17" },
  approve: { note: "Item is within 30-day return window with valid evidence." },
  deny: { reason: "Return request is outside the 30-day policy window." },
  request_info: { info_needed: "Please provide photos of the defect and your order ID." },
  triage: { patient_id: "PAT-001", urgency_level: 5 },
  schedule: { patient_id: "PAT-001", slot_id: "SLOT-001" },
  reschedule: { patient_id: "PAT-002", new_slot_id: "SLOT-004", reason: "Lower urgency." },
  cancel: { patient_id: "PAT-002", reason: "Patient requested cancellation." },
};

type PanelTab = "console" | "observation" | "reasoning";

function JsonViewer({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) return <span className="text-[#4B5563]">null</span>;
  if (typeof data === "boolean") return <span className="text-[#F59E0B]">{String(data)}</span>;
  if (typeof data === "number") return <span className="text-[#06B6D4]">{data}</span>;
  if (typeof data === "string") return <span className="text-[#10B981]">&quot;{data}&quot;</span>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-[#9CA3AF]">[]</span>;
    return (
      <span>
        <span className="text-[#9CA3AF]">[</span>
        <div style={{ marginLeft: `${(depth + 1) * 12}px` }}>
          {data.slice(0, 8).map((item, i) => (
            <div key={i}>
              <JsonViewer data={item} depth={depth + 1} />
              {i < data.length - 1 && <span className="text-[#4B5563]">,</span>}
            </div>
          ))}
          {data.length > 8 && <div className="text-[#4B5563]">… {data.length - 8} more</div>}
        </div>
        <span className="text-[#9CA3AF]">]</span>
      </span>
    );
  }
  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-[#9CA3AF]">{"{}"}</span>;
    return (
      <span>
        <span className="text-[#9CA3AF]">{"{"}</span>
        <div style={{ marginLeft: `${(depth + 1) * 12}px` }}>
          {entries.map(([k, v], i) => (
            <div key={k}>
              <span className="text-[#818CF8]">{k}</span>
              <span className="text-[#4B5563]">: </span>
              <JsonViewer data={v} depth={depth + 1} />
              {i < entries.length - 1 && <span className="text-[#4B5563]">,</span>}
            </div>
          ))}
        </div>
        <span className="text-[#9CA3AF]">{"}"}</span>
      </span>
    );
  }
  return <span className="text-[#9CA3AF]">{String(data)}</span>;
}

export function ActionConsole({ env }: ActionConsoleProps) {
  const { activeSessionId, stepEnv, resetEnv, isLoading, stepHistory, isDone, error, observation } =
    useAgentStore();

  const [selectedAction, setSelectedAction] = useState(env.actions[0] ?? "");
  const [params, setParams] = useState<string>(
    JSON.stringify(ACTION_TEMPLATES[env.actions[0]] ?? {}, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>("console");

  const handleActionChange = (a: string) => {
    setSelectedAction(a);
    setParams(JSON.stringify(ACTION_TEMPLATES[a] ?? {}, null, 2));
    setParseError(null);
  };

  const handleStep = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(params);
      setParseError(null);
    } catch {
      setParseError("Invalid JSON in parameters field.");
      return;
    }
    await stepEnv(env.id, { type: selectedAction, parameters: parsed });
    setActiveTab("reasoning");
  };

  const handleReset = async () => {
    await resetEnv(env.id);
    setActiveTab("observation");
  };

  const lastStep = stepHistory[stepHistory.length - 1];

  const TABS: { id: PanelTab; label: string }[] = [
    { id: "console", label: "Console" },
    { id: "observation", label: "State" },
    { id: "reasoning", label: "Reasoning" },
  ];

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Tab bar */}
      <div className="flex gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all border",
              activeTab === t.id
                ? "bg-[#6366F1] border-[#6366F1] text-white"
                : "bg-[#111827] border-[#374151] text-[#6B7280] hover:text-[#9CA3AF]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Console Tab ── */}
      {activeTab === "console" && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Session status */}
          <div className="card p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-0.5">Session ID</p>
              <p className="text-[11px] text-[#9CA3AF] font-mono">
                {activeSessionId ? activeSessionId.slice(0, 22) + "…" : "No active session"}
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] font-medium transition-colors disabled:opacity-50"
            >
              {activeSessionId ? "↺ Reset" : "▶ Start"}
            </button>
          </div>

          {/* Action selector */}
          {activeSessionId && !isDone && (
            <div className="card p-3 flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider">
                Execute Action
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-1.5">
                {env.actions.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleActionChange(a)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[11px] font-mono transition-all border",
                      selectedAction === a
                        ? "bg-[#6366F1] border-[#6366F1] text-white"
                        : "bg-[#111827] border-[#374151] text-[#6B7280] hover:border-[#6366F1] hover:text-[#818CF8]"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>

              {/* Params */}
              <div>
                <p className="text-[10px] text-[#6B7280] mb-1 font-mono">Parameters (JSON)</p>
                <textarea
                  value={params}
                  onChange={(e) => {
                    setParams(e.target.value);
                    setParseError(null);
                  }}
                  rows={5}
                  className="w-full bg-[#070A0F] border border-[#374151] rounded-lg p-2.5 text-[11px] font-mono text-[#9CA3AF] focus:outline-none focus:border-[#6366F1] resize-none"
                  spellCheck={false}
                />
                {parseError && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{parseError}</p>
                )}
              </div>

              <button
                onClick={handleStep}
                disabled={isLoading || !activeSessionId}
                className="w-full py-2 rounded-lg bg-[#111827] border border-[#374151] hover:border-[#6366F1] hover:bg-[#6366F115] text-[12px] font-medium text-[#D1D5DB] transition-all disabled:opacity-40"
              >
                {isLoading ? "Running…" : `→ step( ${selectedAction} )`}
              </button>
            </div>
          )}

          {isDone && (
            <div className="card p-3 bg-[#10B98110] border-[#10B98130]">
              <p className="text-[12px] text-[#10B981] font-semibold">✓ Episode complete</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">Check Evaluations for score details.</p>
            </div>
          )}

          {error && (
            <div className="card p-3 bg-[#EF444410] border-[#EF444430]">
              <p className="text-[11px] text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Step log */}
          {stepHistory.length > 0 && (
            <div className="flex-1 terminal overflow-y-auto">
              <p className="text-[10px] text-[#4B5563] mb-2 uppercase tracking-widest">Action Log</p>
              {stepHistory.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "mb-2 pb-2 border-b border-[#1F2937] last:border-0 animate-fade-in"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[#6366F1]">step({step.step})</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        step.reward.value >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                      )}
                    >
                      {step.reward.value >= 0 ? "+" : ""}{step.reward.value.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[#6B7280] text-[10px] leading-relaxed">
                    {step.reward.explanation}
                  </p>
                  {step.done && (
                    <span className="text-[#10B981] text-[10px]">■ terminal</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Observation/State Tab ── */}
      {activeTab === "observation" && (
        <div className="flex-1 flex flex-col gap-2">
          {!activeSessionId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#4B5563] text-[12px] mb-3">No active session</p>
                <button
                  onClick={() => { handleReset(); }}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-[#6366F1] text-white text-[12px] font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                >
                  ▶ Start Session
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[#4B5563] uppercase tracking-widest">Current Observation</p>
                <span className="text-[9px] text-[#6366F1]">step {stepHistory.length}</span>
              </div>
              <div className="flex-1 terminal overflow-y-auto text-[10.5px]">
                {observation ? (
                  <JsonViewer data={observation} />
                ) : (
                  <span className="text-[#4B5563]">No observation data yet</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Reasoning Tab ── */}
      {activeTab === "reasoning" && (
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-[10px] text-[#4B5563] uppercase tracking-widest mb-1">Agent Reasoning Trace</p>
          {stepHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#4B5563] text-[12px] text-center">
                No steps taken yet.<br />
                <span className="text-[11px]">Start a session and execute actions.</span>
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {stepHistory.map((step, i) => {
                const isPositive = step.reward.value >= 0;
                const breakdownEntries = Object.entries(step.reward.breakdown ?? {});
                return (
                  <div
                    key={i}
                    className={cn(
                      "card p-3 animate-fade-in text-[11px]",
                      isPositive ? "border-[#10B98120]" : "border-[#EF444420]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#818CF8] font-mono font-semibold">
                        step {step.step}
                      </span>
                      <span className={`font-bold text-[12px] ${isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {isPositive ? "+" : ""}{step.reward.value.toFixed(1)} pts
                      </span>
                    </div>
                    <p className="text-[#9CA3AF] leading-relaxed mb-2">{step.reward.explanation}</p>
                    {breakdownEntries.length > 0 && (
                      <div className="border-t border-[#1F2937] pt-2 flex flex-col gap-1">
                        {breakdownEntries.map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[10px]">
                            <span className="text-[#4B5563] capitalize">{k.replace(/_/g, " ")}</span>
                            <span className={Number(v) >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                              {Number(v) >= 0 ? "+" : ""}{Number(v).toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {step.done && (
                      <div className="mt-2 text-[10px] text-[#10B981] font-semibold">■ Terminal state</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
