"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const AGENTS = [
  {
    id: "agent-gpt4o",
    name: "GPT-4o Agent",
    model: "gpt-4o",
    status: "active",
    sessions: 12,
    avgScore: 78,
    color: "#6366F1",
  },
  {
    id: "agent-claude",
    name: "Claude 3.5 Agent",
    model: "claude-3-5-sonnet",
    status: "active",
    sessions: 8,
    avgScore: 84,
    color: "#8B5CF6",
  },
  {
    id: "agent-gemini",
    name: "Gemini 1.5 Agent",
    model: "gemini-1.5-pro",
    status: "testing",
    sessions: 3,
    avgScore: 61,
    color: "#06B6D4",
  },
  {
    id: "agent-custom",
    name: "Custom Rule-Based",
    model: "deterministic",
    status: "inactive",
    sessions: 0,
    avgScore: 0,
    color: "#10B981",
  },
];

export default function AgentsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title="Agents"
          subtitle="Registered agent configurations"
          actions={
            <button className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] font-medium transition-colors">
              + Register Agent
            </button>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Agent Registry</h2>
            <p className="text-[13px] text-[#6B7280]">
              Configure and compare agents across all simulation environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="card p-5 animate-fade-in hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: `${agent.color}25` }}
                    >
                      <span style={{ color: agent.color }}>{agent.name[0]}</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-white">{agent.name}</h3>
                      <p className="text-[11px] text-[#6B7280] font-mono">{agent.model}</p>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      agent.status === "active"
                        ? "badge-success"
                        : agent.status === "testing"
                        ? "badge-warning"
                        : "badge-muted"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#111827] rounded-lg p-3">
                    <p className="text-[10px] text-[#6B7280] mb-1">Sessions Run</p>
                    <p className="text-[18px] font-bold text-white">{agent.sessions}</p>
                  </div>
                  <div className="bg-[#111827] rounded-lg p-3">
                    <p className="text-[10px] text-[#6B7280] mb-1">Avg Score</p>
                    <p
                      className="text-[18px] font-bold"
                      style={{
                        color:
                          agent.avgScore >= 80
                            ? "#10B981"
                            : agent.avgScore >= 60
                            ? "#F59E0B"
                            : agent.avgScore > 0
                            ? "#EF4444"
                            : "#4B5563",
                      }}
                    >
                      {agent.avgScore > 0 ? `${agent.avgScore}%` : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-[#111827] border border-[#374151] text-[11px] text-[#9CA3AF] hover:border-[#6366F1] hover:text-[#818CF8] transition-all">
                    View Sessions
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-[#6366F115] border border-[#6366F130] text-[11px] text-[#818CF8] hover:bg-[#6366F125] transition-all">
                    Run Evaluation
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Agent comparison table */}
          <div className="card p-5 mt-6 animate-fade-in">
            <h3 className="text-[13px] font-semibold text-white mb-4">Cross-Environment Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    <th className="text-left py-2 pr-4 text-[#6B7280] font-medium">Agent</th>
                    <th className="text-center py-2 px-3 text-[#6B7280] font-medium">SupportDesk</th>
                    <th className="text-center py-2 px-3 text-[#6B7280] font-medium">CyberSOC</th>
                    <th className="text-center py-2 px-3 text-[#6B7280] font-medium">RefundOps</th>
                    <th className="text-center py-2 px-3 text-[#6B7280] font-medium">ClinicOps</th>
                    <th className="text-center py-2 px-3 text-[#6B7280] font-medium">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENTS.filter((a) => a.sessions > 0).map((agent) => (
                    <tr key={agent.id} className="border-b border-[#1F2937] last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                          <span className="text-white font-medium">{agent.name}</span>
                        </div>
                      </td>
                      {["—", "—", "—", "—"].map((v, i) => (
                        <td key={i} className="text-center py-3 px-3 text-[#4B5563]">{v}</td>
                      ))}
                      <td className="text-center py-3 px-3">
                        <span
                          className="font-bold"
                          style={{ color: agent.avgScore >= 80 ? "#10B981" : "#F59E0B" }}
                        >
                          {agent.avgScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
