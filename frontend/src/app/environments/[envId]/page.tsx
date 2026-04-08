"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { ActionConsole } from "@/components/environments/ActionConsole";
import { api, type EnvironmentMeta, type SessionRecord, type ScoreCard } from "@/lib/api";
import { useAgentStore } from "@/stores/agentStore";
import { envIconEmoji, formatRelative } from "@/lib/utils";

export default function EnvDetailPage() {
  const params = useParams();
  const envId = params?.envId as string;

  const [env, setEnv] = useState<EnvironmentMeta | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [scorecard, setScorecard] = useState<ScoreCard | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeSessionId, isDone, stepHistory } = useAgentStore();

  // Load env meta + sessions
  useEffect(() => {
    if (!envId) return;
    setLoading(true);
    Promise.all([api.getEnvironment(envId), api.listEnvSessions(envId)])
      .then(([e, s]) => {
        setEnv(e);
        setSessions(s.sessions);
      })
      .finally(() => setLoading(false));
  }, [envId]);

  // Refresh sessions after each step
  useEffect(() => {
    if (!envId || stepHistory.length === 0) return;
    api.listEnvSessions(envId).then((s) => setSessions(s.sessions));
  }, [stepHistory, envId]);

  // Load scorecard when session completes
  useEffect(() => {
    if (isDone && activeSessionId && envId) {
      api.getScore(envId, activeSessionId).then(setScorecard).catch(() => {});
    }
  }, [isDone, activeSessionId, envId]);

  const handleCardClick = async (s: SessionRecord) => {
    setSelectedSession(s);
    if (s.done) {
      const card = await api.getScore(s.env_id, s.session_id).catch(() => null);
      setScorecard(card);
    }
  };

  if (loading || !env) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-[#4B5563]">
          Loading environment…
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={env.name}
          subtitle={env.category}
          actions={
            <span
              className="badge"
              style={{ backgroundColor: `${env.color}18`, color: env.color, borderColor: `${env.color}30` }}
            >
              {env.tag}
            </span>
          }
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Main panel */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Env header */}
            <div className="card p-5 flex items-start gap-4 animate-fade-in">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${env.color}18` }}
              >
                {envIconEmoji(env.icon)}
              </div>
              <div className="flex-1">
                <h2 className="text-[15px] font-semibold text-white mb-1">{env.description}</h2>
                <div className="flex gap-4 text-[11px] text-[#6B7280]">
                  <span>{env.scenario_count} scenarios</span>
                  <span>{env.max_steps} max steps</span>
                  <span>{env.max_score} max score</span>
                  <span>{sessions.length} total sessions</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {env.actions.map((a) => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded bg-[#111827] border border-[#374151] text-[#6B7280] font-mono">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kanban */}
            <div className="card p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-white">Session Board</h3>
                <span className="text-[11px] text-[#4B5563]">{sessions.length} sessions</span>
              </div>
              <KanbanBoard
                sessions={sessions}
                envColor={env.color}
                envName={env.name}
                onCardClick={handleCardClick}
              />
            </div>

            {/* Scorecard panel (shown after completion) */}
            {scorecard && (
              <div className="card p-5 animate-fade-in" style={{ borderColor: `${env.color}30` }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold text-white">Score Card</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: scorecard.percentage >= 80 ? "#10B981" : scorecard.percentage >= 60 ? "#F59E0B" : "#EF4444" }}
                    >
                      {scorecard.total.toFixed(1)}
                    </span>
                    <span className="text-[#4B5563] text-sm">/ {scorecard.max_possible}</span>
                    <span
                      className="badge ml-2"
                      style={{
                        backgroundColor: scorecard.percentage >= 80 ? "#10B98120" : scorecard.percentage >= 60 ? "#F59E0B20" : "#EF444420",
                        color: scorecard.percentage >= 80 ? "#10B981" : scorecard.percentage >= 60 ? "#F59E0B" : "#EF4444",
                        borderColor: scorecard.percentage >= 80 ? "#10B98130" : scorecard.percentage >= 60 ? "#F59E0B30" : "#EF444430",
                      }}
                    >
                      Grade {scorecard.grade}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {Object.entries(scorecard.breakdown).map(([k, v]) => (
                    <div key={k} className="bg-[#111827] rounded-lg p-3">
                      <p className="text-[10px] text-[#6B7280] mb-1 capitalize">{k.replace(/_/g, " ")}</p>
                      <p className={`text-[14px] font-bold ${v >= 0 ? "text-white" : "text-[#EF4444]"}`}>
                        {v >= 0 ? "+" : ""}{v.toFixed(1)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-[11px] text-[#6B7280]">
                  <span>Steps: <span className="text-[#9CA3AF]">{scorecard.steps_taken}</span></span>
                  <span>Invalid actions: <span className="text-[#EF4444]">{scorecard.invalid_actions}</span></span>
                  <span>Completed: <span className={scorecard.completed ? "text-[#10B981]" : "text-[#F59E0B]"}>{scorecard.completed ? "Yes" : "No"}</span></span>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — Action Console */}
          <div className="w-72 flex-shrink-0 border-l border-[#1F2937] p-4 overflow-y-auto bg-[#0D1117]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4B5563] mb-3">
              Agent Console
            </p>
            <ActionConsole env={env} />
          </div>
        </div>
      </div>
    </div>
  );
}
