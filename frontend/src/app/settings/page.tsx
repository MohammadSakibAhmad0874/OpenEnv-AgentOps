"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Mode = "demo" | "live";

interface PlatformSettings {
  mode: Mode;
  version: string;
  updated_at: string;
  features: Record<string, boolean>;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const ENV_COLORS: Record<string, string> = {
  supportdesk: "#6366F1",
  cybersoc: "#EF4444",
  refundops: "#F59E0B",
  clinicops: "#10B981",
};

const CONTRIBUTORS = [
  {
    name: "Mohammad Sakib Ahmad",
    github: "MohammadSakibAhmad0874",
    role: "Backend Architecture & Environment Design",
    initials: "MS",
    color: "#6366F1",
  },
  {
    name: "adi4sure",
    github: "adi4sure",
    role: "Frontend Dashboard & Evaluation System",
    initials: "AD",
    color: "#10B981",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [modeLoading, setModeLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const data = await req<PlatformSettings>("/api/v1/settings/");
      setSettings(data);
    } catch {
      setSettings({ mode: "demo", version: "1.0.0", updated_at: "", features: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleMode = async () => {
    if (!settings) return;
    const newMode = settings.mode === "demo" ? "live" : "demo";
    setModeLoading(true);
    try {
      await req("/api/v1/settings/mode", {
        method: "POST",
        body: JSON.stringify({ mode: newMode }),
      });
      setSettings((s) => (s ? { ...s, mode: newMode } : s));
      showToast(`Switched to ${newMode.toUpperCase()} mode`);
    } catch (e: unknown) {
      showToast((e as Error).message || "Backend not running — start the FastAPI server", "error");
    } finally {
      setModeLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "var(--bg-app)" }}>
      <TopBar title="Settings" subtitle="Platform configuration" />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-[13px] font-medium animate-fade-in shadow-lg border ${
            toast.type === "success"
              ? "bg-[#10B98120] border-[#10B98140] text-[#10B981]"
              : "bg-[#EF444420] border-[#EF444440] text-[#EF4444]"
          }`}
        >
          {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl" style={{ color: "var(--text-primary)" }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Platform Settings</h2>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Configure your OpenEnv AgentOps instance.</p>
        </div>

        {/* Backend status warning */}
        {loading && (
          <div className="mb-4 px-4 py-3 rounded-lg border text-[12px]" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
            ⏳ Connecting to backend...
          </div>
        )}

        {/* Mode Switch */}
        <div className="card p-6 mb-4 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Data Mode</h3>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                Demo mode uses bundled scenarios. Live mode uses real user-submitted data.
              </p>
            </div>
            <button
              onClick={toggleMode}
              disabled={modeLoading || loading}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
                settings?.mode === "live" ? "bg-[#10B981]" : "bg-[#374151]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
                  settings?.mode === "live" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 rounded-lg border transition-all"
              style={{
                background: settings?.mode === "demo" ? "#6366F115" : "var(--bg-surface)",
                borderColor: settings?.mode === "demo" ? "#6366F140" : "var(--border-color)",
              }}
            >
              <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>🎯 Demo Mode</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Pre-built scenarios. Great for evaluation and testing.</p>
            </div>
            <div
              className="p-3 rounded-lg border transition-all"
              style={{
                background: settings?.mode === "live" ? "#10B98115" : "var(--bg-surface)",
                borderColor: settings?.mode === "live" ? "#10B98140" : "var(--border-color)",
              }}
            >
              <p className="text-[12px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {settings?.mode === "live" ? (
                  <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" /> Live Mode</span>
                ) : "● Live Mode"}
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Real user-submitted data. Production-grade evaluation.</p>
            </div>
          </div>
        </div>

        {/* Platform Info */}
        <div className="card p-6 mb-4 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Platform Information</h3>
          <div className="grid grid-cols-2 gap-y-3 text-[12px]">
            <div style={{ color: "var(--text-muted)" }}>Version</div>
            <div className="font-mono" style={{ color: "var(--text-primary)" }}>{settings?.version ?? "1.0.0"}</div>
            <div style={{ color: "var(--text-muted)" }}>Mode</div>
            <div>
              <span className={`badge ${settings?.mode === "live" ? "badge-success" : "badge-accent"}`}>
                {settings?.mode ?? "demo"}
              </span>
            </div>
            <div style={{ color: "var(--text-muted)" }}>Environments</div>
            <div style={{ color: "var(--text-primary)" }}>4 active</div>
            <div style={{ color: "var(--text-muted)" }}>API Docs</div>
            <div>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
                className="text-[#6366F1] hover:text-[#818CF8] underline">
                Open Swagger UI ↗
              </a>
            </div>
            <div style={{ color: "var(--text-muted)" }}>Last Updated</div>
            <div className="font-mono text-[11px]" style={{ color: "var(--text-secondary)" }}>
              {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        {/* Environment colors */}
        <div className="card p-6 mb-4 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Environments</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(ENV_COLORS).map(([env, color]) => (
              <div key={env} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[13px] capitalize" style={{ color: "var(--text-primary)" }}>{env}</span>
                <span className="text-[11px] font-mono ml-auto" style={{ color: "var(--text-subtle)" }}>{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors */}
        <div className="card p-6 animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Contributors</h3>
          <div className="flex flex-col gap-3">
            {CONTRIBUTORS.map((c) => (
              <div key={c.github} className="flex items-center gap-4 py-2 border-b last:border-0" style={{ borderColor: "var(--border-subtle)" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                  style={{ backgroundColor: `${c.color}30`, border: `1px solid ${c.color}40` }}
                >
                  <span style={{ color: c.color }}>{c.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{c.role}</p>
                </div>
                <a
                  href={`https://github.com/${c.github}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-[#6366F1] hover:text-[#818CF8] transition-colors"
                >
                  @{c.github} ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
