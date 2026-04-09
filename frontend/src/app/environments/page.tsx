"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { EnvironmentCard } from "@/components/environments/EnvironmentCard";
import { api, type EnvironmentMeta, type SessionRecord } from "@/lib/api";

export default function EnvironmentsPage() {
  const [envs, setEnvs] = useState<EnvironmentMeta[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      api.listEnvironments(),
      api.listAllSessions().catch(() => ({ sessions: [] })),
    ])
      .then(([eData, sData]) => {
        setEnvs(eData?.environments ?? []);
        setSessions(sData.sessions);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(envs.map((e) => e.category)))];
  const filtered = filter === "all" ? envs : envs.filter((e) => e.category === filter);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Environments" subtitle={`${envs.length} domains available`} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Simulation Environments</h2>
          <p className="text-[13px] text-[#6B7280]">
            Select a domain to run step-by-step agent evaluation with deterministic scoring.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all capitalize ${
                filter === cat
                  ? "bg-[#6366F1] border-[#6366F1] text-white"
                  : "bg-[#111827] border-[#374151] text-[#6B7280] hover:border-[#6366F1] hover:text-[#818CF8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 stagger">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 h-48 shimmer" />
              ))
            : filtered.map((env) => {
                const envSessions = sessions.filter((s) => s.env_id === env.id);
                const lastDone = envSessions.filter((s) => s.done)[0];
                return (
                  <EnvironmentCard
                    key={env.id}
                    env={env}
                    sessionCount={envSessions.length}
                    lastScore={lastDone ? Math.round(lastDone.total_reward) : null}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
}
