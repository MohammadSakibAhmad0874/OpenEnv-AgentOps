"use client";

import { cn, formatRelative, envIconEmoji } from "@/lib/utils";
import type { EnvironmentMeta } from "@/lib/api";
import Link from "next/link";

interface EnvironmentCardProps {
  env: EnvironmentMeta;
  sessionCount?: number;
  lastScore?: number | null;
}

export function EnvironmentCard({ env, sessionCount = 0, lastScore = null }: EnvironmentCardProps) {
  const statusColor =
    env.status === "active" ? "#10B981" : env.status === "beta" ? "#F59E0B" : "#6B7280";

  return (
    <Link href={`/environments/${env.id}`} className="block">
      <div className="card p-5 animate-fade-in hover:shadow-card-hover cursor-pointer group transition-all duration-200 hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${env.color}18`, border: `1px solid ${env.color}30` }}
            >
              {envIconEmoji(env.icon)}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white group-hover:text-[#818CF8] transition-colors">
                {env.name}
              </h3>
              <span className="badge badge-muted mt-0.5" style={{ backgroundColor: `${env.color}18`, color: env.color, borderColor: `${env.color}30` }}>
                {env.tag}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[10px] text-[#6B7280] capitalize">{env.status}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#6B7280] leading-relaxed mb-4 line-clamp-2">
          {env.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#1F2937]">
          <div className="text-center">
            <p className="text-[13px] font-semibold text-white">{env.scenario_count}</p>
            <p className="text-[10px] text-[#6B7280]">Scenarios</p>
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-white">{env.max_steps}</p>
            <p className="text-[10px] text-[#6B7280]">Max Steps</p>
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-white">{sessionCount}</p>
            <p className="text-[10px] text-[#6B7280]">Sessions</p>
          </div>
          {lastScore !== null && (
            <div className="ml-auto text-right">
              <p
                className="text-[15px] font-bold"
                style={{ color: lastScore >= 80 ? "#10B981" : lastScore >= 60 ? "#F59E0B" : "#EF4444" }}
              >
                {lastScore}%
              </p>
              <p className="text-[10px] text-[#6B7280]">Last Score</p>
            </div>
          )}
        </div>

        {/* Actions preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {env.actions.slice(0, 4).map((a) => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-[#111827] border border-[#374151] text-[#6B7280] font-mono">
              {a}
            </span>
          ))}
          {env.actions.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#111827] border border-[#374151] text-[#6B7280]">
              +{env.actions.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
