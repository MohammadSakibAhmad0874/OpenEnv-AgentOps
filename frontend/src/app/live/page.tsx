"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Submission = {
  id: string;
  type: "ticket" | "alert" | "email";
  env_id: string;
  submitted_at: string;
  status: string;
  data: Record<string, unknown>;
};

type Tab = "ticket" | "alert" | "email";
type Mode = "demo" | "live";

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

export default function LiveDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ticket");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("demo");
  const [modeLoading, setModeLoading] = useState(false);

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    body: "",
    customer_name: "",
    customer_email: "",
    priority_hint: "P2",
    category_hint: "general",
    source: "web_form",
  });

  // Alert form state
  const [alertForm, setAlertForm] = useState({
    alert_type: "",
    severity: "medium",
    source_ip: "",
    description: "",
    affected_system: "",
  });

  // Email form state
  const [emailForm, setEmailForm] = useState({
    sender_name: "",
    sender_email: "",
    subject: "",
    body: "",
  });

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await req<Submission[]>("/api/v1/live/submissions");
      setSubmissions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMode = useCallback(async () => {
    try {
      const data = await req<{ mode: Mode }>("/api/v1/settings/");
      setMode(data.mode);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
    loadMode();
  }, [loadSubmissions, loadMode]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };
  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const handleToggleMode = async () => {
    setModeLoading(true);
    const newMode = mode === "demo" ? "live" : "demo";
    try {
      await req("/api/v1/settings/mode", {
        method: "POST",
        body: JSON.stringify({ mode: newMode }),
      });
      setMode(newMode);
      showSuccess(`Switched to ${newMode.toUpperCase()} mode`);
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setModeLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await req("/api/v1/live/tickets", {
        method: "POST",
        body: JSON.stringify(ticketForm),
      });
      showSuccess("Ticket submitted successfully!");
      setTicketForm({ subject: "", body: "", customer_name: "", customer_email: "", priority_hint: "P2", category_hint: "general", source: "web_form" });
      loadSubmissions();
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await req("/api/v1/live/alerts", {
        method: "POST",
        body: JSON.stringify(alertForm),
      });
      showSuccess("Alert submitted successfully!");
      setAlertForm({ alert_type: "", severity: "medium", source_ip: "", description: "", affected_system: "" });
      loadSubmissions();
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await req("/api/v1/live/emails", {
        method: "POST",
        body: JSON.stringify(emailForm),
      });
      showSuccess("Email submitted successfully!");
      setEmailForm({ sender_name: "", sender_email: "", subject: "", body: "" });
      loadSubmissions();
    } catch (e: unknown) {
      showError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const TYPE_COLORS: Record<string, string> = {
    ticket: "#6366F1",
    alert: "#EF4444",
    email: "#10B981",
  };

  const inputCls = "w-full bg-[#070A0F] border border-[#374151] rounded-lg px-3 py-2.5 text-[13px] text-[#D1D5DB] focus:outline-none focus:border-[#6366F1] transition-colors placeholder-[#4B5563]";
  const labelCls = "text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1 block";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title="Live Data"
          subtitle="Ingest real-world tickets, alerts & emails"
          actions={
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-semibold ${mode === "live" ? "text-[#10B981]" : "text-[#6B7280]"}`}>
                {mode === "demo" ? "DEMO MODE" : "● LIVE MODE"}
              </span>
              <button
                onClick={handleToggleMode}
                disabled={modeLoading}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  mode === "live" ? "bg-[#10B981]" : "bg-[#374151]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                    mode === "live" ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          }
        />

        {/* Toast notifications */}
        {successMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-[#10B98120] border border-[#10B98140] text-[#10B981] text-[13px] font-medium animate-fade-in shadow-lg">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-[#EF444420] border border-[#EF444440] text-[#EF4444] text-[13px] font-medium animate-fade-in shadow-lg">
            ✗ {errorMsg}
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Submission Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Live Data Ingestion</h2>
              <p className="text-[13px] text-[#6B7280]">
                Submit real support tickets, security alerts, or customer emails. 
                These become live simulation scenarios that agents can process.
              </p>
            </div>

            {/* Mode banner */}
            <div className={`mb-6 p-4 rounded-lg border animate-fade-in ${
              mode === "live"
                ? "bg-[#10B98110] border-[#10B98130]"
                : "bg-[#6366F110] border-[#6366F130]"
            }`}>
              <p className={`text-[13px] font-semibold mb-0.5 ${mode === "live" ? "text-[#10B981]" : "text-[#818CF8]"}`}>
                {mode === "live" ? "● Live Mode Active" : "Demo Mode"}
              </p>
              <p className="text-[11px] text-[#6B7280]">
                {mode === "live"
                  ? "Data submitted here will be used directly in agent simulations."
                  : "Running on sample data. Toggle to Live Mode to use real submissions."}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["ticket", "alert", "email"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={activeTab === t ? { backgroundColor: `${TYPE_COLORS[t]}20`, color: TYPE_COLORS[t], borderColor: `${TYPE_COLORS[t]}40` } : {}}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all capitalize ${
                    activeTab !== t ? "bg-[#111827] border-[#374151] text-[#6B7280] hover:border-[#6366F1]" : ""
                  }`}
                >
                  {t === "ticket" ? "🎫 Support Ticket" : t === "alert" ? "🚨 Security Alert" : "📧 Email"}
                </button>
              ))}
            </div>

            {/* Ticket Form */}
            {activeTab === "ticket" && (
              <form onSubmit={handleSubmitTicket} className="card p-6 animate-fade-in flex flex-col gap-4">
                <h3 className="text-[13px] font-semibold text-white">Submit Support Ticket</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Customer Name</label>
                    <input required className={inputCls} value={ticketForm.customer_name} onChange={e => setTicketForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className={labelCls}>Customer Email</label>
                    <input required type="email" className={inputCls} value={ticketForm.customer_email} onChange={e => setTicketForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="jane@example.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Subject</label>
                  <input required className={inputCls} value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} placeholder="My order never arrived" />
                </div>
                <div>
                  <label className={labelCls}>Ticket Body</label>
                  <textarea required rows={5} className={inputCls} value={ticketForm.body} onChange={e => setTicketForm(f => ({ ...f, body: e.target.value }))} placeholder="Describe the issue in detail..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Priority Hint</label>
                    <select className={inputCls} value={ticketForm.priority_hint} onChange={e => setTicketForm(f => ({ ...f, priority_hint: e.target.value }))}>
                      <option value="P1">P1 — Critical</option>
                      <option value="P2">P2 — Normal</option>
                      <option value="P3">P3 — Low</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Category Hint</label>
                    <select className={inputCls} value={ticketForm.category_hint} onChange={e => setTicketForm(f => ({ ...f, category_hint: e.target.value }))}>
                      {["billing", "account", "shipping", "technical", "general"].map(c => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button disabled={sending} type="submit" className="w-full py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                  {sending ? "Submitting…" : "Submit Ticket →"}
                </button>
              </form>
            )}

            {/* Alert Form */}
            {activeTab === "alert" && (
              <form onSubmit={handleSubmitAlert} className="card p-6 animate-fade-in flex flex-col gap-4">
                <h3 className="text-[13px] font-semibold text-white">Submit Security Alert</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Alert Type</label>
                    <input required className={inputCls} value={alertForm.alert_type} onChange={e => setAlertForm(f => ({ ...f, alert_type: e.target.value }))} placeholder="brute_force_attempt" />
                  </div>
                  <div>
                    <label className={labelCls}>Severity</label>
                    <select className={inputCls} value={alertForm.severity} onChange={e => setAlertForm(f => ({ ...f, severity: e.target.value }))}>
                      {["low", "medium", "high", "critical"].map(s => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Source IP</label>
                    <input className={inputCls} value={alertForm.source_ip} onChange={e => setAlertForm(f => ({ ...f, source_ip: e.target.value }))} placeholder="185.220.101.17" />
                  </div>
                  <div>
                    <label className={labelCls}>Affected System</label>
                    <input className={inputCls} value={alertForm.affected_system} onChange={e => setAlertForm(f => ({ ...f, affected_system: e.target.value }))} placeholder="auth-service-prod" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea required rows={5} className={inputCls} value={alertForm.description} onChange={e => setAlertForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what happened, pattern observed, potential impact..." />
                </div>
                <button disabled={sending} type="submit" className="w-full py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                  {sending ? "Submitting…" : "Submit Alert →"}
                </button>
              </form>
            )}

            {/* Email Form */}
            {activeTab === "email" && (
              <form onSubmit={handleSubmitEmail} className="card p-6 animate-fade-in flex flex-col gap-4">
                <h3 className="text-[13px] font-semibold text-white">Submit Customer Email</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Sender Name</label>
                    <input required className={inputCls} value={emailForm.sender_name} onChange={e => setEmailForm(f => ({ ...f, sender_name: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className={labelCls}>Sender Email</label>
                    <input required type="email" className={inputCls} value={emailForm.sender_email} onChange={e => setEmailForm(f => ({ ...f, sender_email: e.target.value }))} placeholder="john@company.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Subject</label>
                  <input required className={inputCls} value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Refund request for order #12345" />
                </div>
                <div>
                  <label className={labelCls}>Email Body</label>
                  <textarea required rows={5} className={inputCls} value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} placeholder="Email content goes here..." />
                </div>
                <button disabled={sending} type="submit" className="w-full py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-semibold transition-colors disabled:opacity-50">
                  {sending ? "Submitting…" : "Submit Email →"}
                </button>
              </form>
            )}
          </div>

          {/* Right: Live Submissions Feed */}
          <div className="w-80 flex-shrink-0 border-l border-[#1F2937] bg-[#0D1117] overflow-y-auto">
            <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
              <p className="text-[12px] font-semibold text-white">Live Submissions</p>
              <button onClick={loadSubmissions} className="text-[10px] text-[#6366F1] hover:text-[#818CF8]">
                ↻ Refresh
              </button>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {loading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-3 animate-pulse">
                    <div className="shimmer h-3 w-24 rounded mb-2" />
                    <div className="shimmer h-2 w-full rounded" />
                  </div>
                ))
              )}
              {!loading && submissions.length === 0 && (
                <p className="text-[11px] text-[#4B5563] text-center py-8">No submissions yet.</p>
              )}
              {submissions.map((sub) => {
                const color = TYPE_COLORS[sub.type] ?? "#6B7280";
                const raw = sub.data as Record<string, unknown>;
                const ticket = raw?.ticket as Record<string, string> | undefined;
                const subject: string = ticket?.subject ?? (raw?.alert_type as string) ?? (raw?.subject as string) ?? "—";
                return (
                  <div key={sub.id} className="card p-3 animate-fade-in hover:border-[#4B5563] transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                        {sub.type}
                      </span>
                      <span className="text-[9px] text-[#4B5563]">
                        {new Date(sub.submitted_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] truncate">{subject}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-[#4B5563] font-mono">{sub.id.slice(0, 22)}</span>
                      <span className="badge badge-muted">{sub.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
