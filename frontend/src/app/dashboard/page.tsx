"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, EnvironmentMeta } from "@/lib/api";

const ENV_ICONS: Record<string, string> = {
  supportdesk: "🎧",
  cybersoc: "🛡️",
  refundops: "🧾",
  clinicops: "🩺",
};

const METRIC_CARDS = [
  {
    label: "Environments",
    value: "4",
    icon: "🌐",
    color: "#6366F1",
    desc: "Active simulation domains",
  },
  {
    label: "Scenarios",
    value: "10+",
    icon: "📋",
    color: "#10B981",
    desc: "Across all environments",
  },
  {
    label: "Top Score",
    value: "94.2%",
    icon: "🏆",
    color: "#F59E0B",
    desc: "SupportDesk baseline",
  },
  {
    label: "Reward Dims",
    value: "12",
    icon: "⚡",
    color: "#EF4444",
    desc: "Multi-axis evaluation",
  },
];

export default function DashboardPage() {
  const [envs, setEnvs] = useState<EnvironmentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listEnvironments()
      .then((data) => {
        setEnvs(data?.environments ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-[#6B7280] text-sm mt-1">OpenEnv AgentOps — Control Panel</p>
        </div>
        <Link
          href="/environments"
          className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-lg transition-all"
        >
          <span>New Simulation</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {METRIC_CARDS.map((m) => (
          <div key={m.label} className="card p-5 animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${m.color}18`, border: `1px solid ${m.color}25` }}
              >
                {m.icon}
              </div>
              <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-3xl font-black text-white">{m.value}</p>
            <p className="text-[11px] text-[#6B7280] mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Backend status */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#EF444415] border border-[#EF444430] text-[#F87171] text-sm flex items-center gap-3">
          <span>⚠️</span>
          <div>
            <p className="font-semibold">Backend not reachable</p>
            <p className="text-[12px] opacity-80 mt-0.5">
              Make sure the FastAPI server is running on port 8000.{" "}
              <code className="font-mono">.venv\Scripts\python -m uvicorn main:app --reload</code>
            </p>
          </div>
        </div>
      )}

      {/* Environments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Simulation Environments</h2>
          <Link href="/environments" className="text-[12px] text-[#6366F1] hover:text-[#818CF8] transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-5 h-32 shimmer" />
            ))}
          </div>
        ) : envs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
            {envs.map((env) => (
              <Link
                key={env.id}
                href={`/environments/${env.id}`}
                className="card p-5 flex items-start gap-4 hover:border-[#4B5563] hover:-translate-y-0.5 transition-all duration-200 animate-fade-in group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${env.color}18`, border: `1px solid ${env.color}25` }}
                >
                  {ENV_ICONS[env.id] ?? "🌐"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm">{env.name}</h3>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background: `${env.color}20`, color: env.color }}
                    >
                      {env.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">{env.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-[#4B5563]">{env.scenario_count} scenarios</span>
                    <span className="text-[11px] text-[#4B5563]">·</span>
                    <span className="text-[11px] text-[#4B5563]">{env.category}</span>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-[#4B5563] group-hover:text-[#6366F1] transition-colors flex-shrink-0 mt-1"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="text-[#6B7280] text-sm">No environments loaded. Is the backend running?</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/evaluations",
            icon: "📊",
            color: "#6366F1",
            title: "Evaluations",
            desc: "Review session scorecards and replay agent reasoning step-by-step.",
          },
          {
            href: "/live",
            icon: "📡",
            color: "#10B981",
            title: "Live Ingestion",
            desc: "Submit real tickets, alerts, and emails into running environments.",
          },
          {
            href: "/agents",
            icon: "🤖",
            color: "#F59E0B",
            title: "Agents",
            desc: "Browse registered agents and launch comparative benchmark runs.",
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="card p-5 hover:border-[#4B5563] hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ background: `${card.color}18`, border: `1px solid ${card.color}25` }}
            >
              {card.icon}
            </div>
            <h3
              className="font-bold text-sm mb-1 group-hover:text-white transition-colors"
              style={{ color: card.color }}
            >
              {card.title}
            </h3>
            <p className="text-[12px] text-[#6B7280] leading-relaxed">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
