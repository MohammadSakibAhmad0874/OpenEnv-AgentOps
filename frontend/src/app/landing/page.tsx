"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

/* ─── Data ─────────────────────────────────────────── */
const ENVS = [
  {
    id: "supportdesk",
    name: "SupportDesk",
    tag: "Hero Module",
    description: "Resolve customer tickets with SLA timers, knowledge base lookups, and conversation history.",
    color: "#6366F1",
    colorMid: "#8B5CF6",
    icon: "🎧",
    score: "94.2",
    difficulty: "Medium",
    category: "Customer Ops",
  },
  {
    id: "cybersoc",
    name: "CyberSOC",
    tag: "Security",
    description: "Classify and respond to live security alerts across a production network in real-time.",
    color: "#EF4444",
    colorMid: "#F97316",
    icon: "🛡️",
    score: "81.7",
    difficulty: "Hard",
    category: "Security Ops",
  },
  {
    id: "refundops",
    name: "RefundOps",
    tag: "Finance",
    description: "Policy-based refund adjudication — approve, deny, or request additional information.",
    color: "#F59E0B",
    colorMid: "#FBBF24",
    icon: "🧾",
    score: "89.3",
    difficulty: "Easy",
    category: "Finance & Compliance",
  },
  {
    id: "clinicops",
    name: "ClinicOps",
    tag: "Healthcare",
    description: "Triage patients by urgency and assign optimal appointment slots with doctor availability.",
    color: "#10B981",
    colorMid: "#34D399",
    icon: "🩺",
    score: "76.5",
    difficulty: "Hard",
    category: "Healthcare",
  },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-World Tasks",
    desc: "Every environment simulates actual business workflows — no toy problems, no trivial grids.",
    color: "#6366F1",
  },
  {
    icon: "🎯",
    title: "Deterministic Grading",
    desc: "Reward functions score 0.0–1.0 with partial credit, penalties for hallucinations and repetition.",
    color: "#10B981",
  },
  {
    icon: "📊",
    title: "Evaluation Suite",
    desc: "Replay every session, inspect step-by-step reasoning, and compare agents on leaderboards.",
    color: "#F59E0B",
  },
  {
    icon: "🔌",
    title: "OpenEnv Spec",
    desc: "Typed Pydantic models, step(), reset(), state() — plug any LLM into the standard interface.",
    color: "#EF4444",
  },
  {
    icon: "📡",
    title: "Live Ingestion",
    desc: "Stream real tickets, alerts, and emails into active environments for live agent evaluation.",
    color: "#8B5CF6",
  },
  {
    icon: "🐳",
    title: "Dockerized & Ready",
    desc: "Fully containerized. Deploy to Hugging Face Spaces or any cloud in minutes.",
    color: "#06B6D4",
  },
];

const METRICS = [
  { label: "Environments", value: 4, suffix: "" },
  { label: "Reward Signals", value: 12, suffix: "" },
  { label: "Scenarios", value: 10, suffix: "+" },
  { label: "Avg Accuracy", value: 98, suffix: "%" },
];

/* ─── Terminal animation ─────────────────────────── */
const TERMINAL_LINES = [
  { delay: 0,    color: "#6366F1", text: "$ python baseline_agent.py --env supportdesk" },
  { delay: 600,  color: "#9CA3AF", text: "  Loading scenario: support_001_billing_dispute" },
  { delay: 1100, color: "#9CA3AF", text: "  Resetting environment..." },
  { delay: 1500, color: "#10B981", text: "  ✓ Session started: a4f2b8c1" },
  { delay: 2100, color: "#9CA3AF", text: "  → Step 1: classify(category='billing', priority='high')" },
  { delay: 2500, color: "#F59E0B", text: "    reward: +0.25  [classification correct]" },
  { delay: 3000, color: "#9CA3AF", text: "  → Step 2: ask_question(topic='payment_method')" },
  { delay: 3400, color: "#F59E0B", text: "    reward: +0.10  [relevant question]" },
  { delay: 3900, color: "#9CA3AF", text: "  → Step 3: resolve(action='issue_refund', amount=49.99)" },
  { delay: 4400, color: "#10B981", text: "    reward: +0.45  [correct resolution + SLA met]" },
  { delay: 4900, color: "#6366F1", text: "  ─────────────────────────────────────────────" },
  { delay: 5100, color: "#10B981", text: "  Final Score: 0.87 / 1.00  (87.0%)" },
  { delay: 5400, color: "#9CA3AF", text: "  Steps: 3 | Tokens: 412 | Time: 2.1s" },
];

function TerminalWidget() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay + 800));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="terminal relative overflow-hidden" style={{ maxHeight: 340 }}>
      <div className="flex gap-1.5 mb-3">
        <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
        <span className="w-3 h-3 rounded-full bg-[#10B981]" />
        <span className="ml-auto text-[10px] text-[#4B5563]">baseline_agent.py</span>
      </div>
      {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
        <div
          key={i}
          className="animate-fade-in"
          style={{ color: line.color, marginBottom: 2 }}
        >
          {line.text}
          {i === visibleLines - 1 && (
            <span
              className="inline-block w-2 h-4 ml-0.5 rounded-sm"
              style={{
                background: "#6366F1",
                animation: "blink-cursor 0.8s ease-in-out infinite",
                verticalAlign: "middle",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Animated counter ───────────────────────────── */
function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const step = target / 40;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 30);
          observer.disconnect();
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Trusted-by logos (placeholder placards) ───── */
const TRUST_BADGES = [
  { name: "FastAPI", color: "#009688" },
  { name: "Next.js", color: "#FFFFFF" },
  { name: "PyTorch", color: "#EE4C2C" },
  { name: "OpenAI", color: "#10A37F" },
  { name: "Hugging Face", color: "#FFD21E" },
  { name: "Docker", color: "#2496ED" },
];

/* ─── Main Page ──────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-x-hidden">
      <LandingHeader />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-28 pb-0 px-6 overflow-hidden">

        {/* Ambient light blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 700, height: 700,
              top: "-15%", right: "-15%",
              background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
              animation: "drift 10s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 500, height: 500,
              bottom: "5%", left: "-10%",
              background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)",
              animation: "drift 14s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: 350, height: 350,
              top: "50%", left: "45%",
              background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)",
              animation: "drift 11s ease-in-out infinite",
              animationDelay: "4s",
            }}
          />
        </div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
            `,
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative max-w-7xl mx-auto">

          {/* ── Announcement pill ── */}
          <div className="flex justify-center mb-10 animate-fade-in-up">
            <Link
              href="/environments"
              className="flex items-center gap-2.5 px-5 py-2 rounded-full text-[12px] font-medium text-[#818CF8] transition-all group"
              style={{
                background: "linear-gradient(90deg, rgba(99,102,241,0.10), rgba(139,92,246,0.10))",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
                <span className="text-[#10B981] font-semibold">New</span>
                <span className="text-[#6B7280]">—</span>
                ClinicOps v1.2 just shipped with patient triage simulation
              </span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ── Main headline ── */}
          <div className="text-center max-w-5xl mx-auto mb-8">
            <h1
              className="font-black leading-[1.03] tracking-tight"
              style={{ fontSize: "clamp(3rem, 7.5vw, 7.5rem)" }}
            >
              <span className="block text-white animate-fade-in-up delay-100">
                The Operating System
              </span>
              <span
                className="block animate-fade-in-up delay-200 animate-gradient"
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #06B6D4 65%, #6366F1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "300% 300%",
                }}
              >
                for AI Work Agents
              </span>
            </h1>

            <p className="mt-7 text-[#9CA3AF] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
              Evaluate AI agents on <strong className="text-white">real business tasks</strong> — support tickets, security alerts, refund policies, and clinic scheduling — with deterministic, reproducible scoring.
            </p>
          </div>

          {/* ── CTA Row ── */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up delay-400">
            <Link href="/dashboard" className="btn-primary text-base px-9 py-4 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_50px_rgba(99,102,241,0.55)] transition-shadow">
              <span>Open Dashboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/environments" className="btn-secondary text-base px-9 py-4">
              Browse Environments
            </Link>
            <Link href="/evaluations" className="btn-secondary text-base px-9 py-4">
              Evaluations →
            </Link>
          </div>

          {/* ── Social proof row ── */}
          <div className="flex justify-center gap-6 mb-14 animate-fade-in-up delay-500">
            {[
              { icon: "⭐", text: "MIT Licensed" },
              { icon: "🐳", text: "Docker Ready" },
              { icon: "🤗", text: "HF Spaces" },
              { icon: "⚡", text: "FastAPI Powered" },
            ].map((p) => (
              <div key={p.text} className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                <span>{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          {/* ── Bento grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up delay-500">

            {/* Terminal — spans 2 cols */}
            <div className="lg:col-span-2 glass p-1 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.08)]">
              <TerminalWidget />
            </div>

            {/* Right stats column */}
            <div className="flex flex-col gap-4">

              {/* Env status */}
              <div className="glass p-5 rounded-2xl flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">Platform Status</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "SupportDesk", pct: 94.2, color: "#6366F1" },
                    { name: "RefundOps",   pct: 89.3, color: "#F59E0B" },
                    { name: "CyberSOC",    pct: 81.7, color: "#EF4444" },
                    { name: "ClinicOps",   pct: 76.5, color: "#10B981" },
                  ].map((e) => (
                    <div key={e.name}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#9CA3AF]">{e.name}</span>
                        <span className="font-mono font-bold" style={{ color: e.color }}>{e.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${e.pct}%`,
                            background: `linear-gradient(90deg, ${e.color}80, ${e.color})`,
                            transition: "width 1.2s ease-out",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest reward */}
              <div className="glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">Latest Session</div>
                  <span className="badge badge-success text-[9px]">SupportDesk</span>
                </div>
                <div className="text-4xl font-black text-white font-mono mb-1">0.87</div>
                <div className="text-[12px] text-[#10B981] mb-4">↑ 3.2% above baseline</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Class.", val: "+0.25", c: "#6366F1" },
                    { label: "Resolv.", val: "+0.45", c: "#10B981" },
                    { label: "SLA",    val: "+0.17", c: "#F59E0B" },
                  ].map((r) => (
                    <div key={r.label} className="text-center rounded-lg bg-[#111827] py-2.5">
                      <div className="text-[11px] font-bold" style={{ color: r.c }}>{r.val}</div>
                      <div className="text-[9px] text-[#4B5563] mt-0.5">{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trusted-by strip */}
          <div className="mt-16 pb-0 text-center animate-fade-in-up delay-600">
            <p className="text-[11px] uppercase tracking-widest text-[#374151] font-semibold mb-6">
              Powered by &amp; compatible with
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b.name}
                  className="px-5 py-2 rounded-lg border border-[#1F2937] bg-[#111827] text-[13px] font-semibold transition-all hover:border-[#374151]"
                  style={{ color: b.color === "#FFFFFF" ? "#9CA3AF" : b.color }}
                >
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #0B0F14)" }} />
      </section>

      {/* ══════════ METRICS BAR ══════════ */}
      <section className="py-20 border-y border-[#1F2937]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {METRICS.map((m) => (
              <div key={m.label}>
                <p
                  className="text-5xl font-black"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <Counter target={m.value} suffix={m.suffix} />
                </p>
                <p className="text-[12px] text-[#6B7280] uppercase tracking-widest mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-success mb-4 inline-flex">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              From agent to{" "}
              <span className="gradient-text">score in seconds</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Three steps to a reproducible, deterministic evaluation of any AI agent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />

            {[
              {
                step: "01",
                title: "Choose an Environment",
                desc: "Select from SupportDesk, CyberSOC, RefundOps, or ClinicOps. Each is a full business simulation.",
                color: "#6366F1",
                icon: "🌐",
              },
              {
                step: "02",
                title: "Connect Your Agent",
                desc: "Implement the OpenEnv Spec — just step(), reset(), and state(). Works with any LLM or agent framework.",
                color: "#8B5CF6",
                icon: "🔌",
              },
              {
                step: "03",
                title: "Get Your Score",
                desc: "The deterministic grader returns a 0–1.0 score with partial credit, step-by-step breakdowns, and replay.",
                color: "#06B6D4",
                icon: "📊",
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className="glass p-7 rounded-2xl group hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ background: `${step.color}20`, border: `1px solid ${step.color}35` }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="text-4xl font-black opacity-20 font-mono"
                    style={{ color: step.color }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ENVIRONMENTS BENTO ══════════ */}
      <section className="py-24 px-6 bg-[#080C10]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-accent mb-4 inline-flex">Simulation Domains</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Four arenas.{" "}
              <span className="gradient-text">One platform.</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Each environment runs a complete business workflow with real rewards, partial credit, and hallucination detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ENVS.map((env, i) => (
              <Link
                key={env.id}
                href={`/environments/${env.id}`}
                className="env-card-landing block"
                style={{
                  background: `linear-gradient(135deg, ${env.color}18 0%, ${env.colorMid}0C 50%, transparent 100%)`,
                  border: `1px solid ${env.color}25`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Shine overlay */}
                <div
                  className="absolute inset-0 rounded-[20px] opacity-0 hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${env.color}15 0%, transparent 60%)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: `${env.color}20`, border: `1px solid ${env.color}30` }}
                      >
                        {env.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{env.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: `${env.color}25`, color: env.color }}
                          >
                            {env.tag}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">{env.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: env.color }}>{env.score}</div>
                      <div className="text-[10px] text-[#6B7280]">avg score</div>
                    </div>
                  </div>

                  <p className="text-[#9CA3AF] text-sm leading-relaxed mb-4">{env.description}</p>

                  <div className="flex items-center justify-between">
                    <div
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: `${env.color}15`, color: `${env.colorMid}` }}
                    >
                      Difficulty: {env.difficulty}
                    </div>
                    <div
                      className="flex items-center gap-1 text-[12px] font-semibold"
                      style={{ color: env.color }}
                    >
                      Simulate Now
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/environments" className="btn-secondary inline-flex">
              View All Environments →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES GRID ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-accent mb-4 inline-flex">Why OpenEnv?</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for{" "}
              <span className="gradient-text">production.</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Not another toy benchmark. OpenEnv simulates work that real AI agents will be deployed to do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="glass p-6 rounded-2xl hover:border-[rgba(255,255,255,0.12)] transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feat.color}20`, border: `1px solid ${feat.color}30` }}
                >
                  {feat.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OPENENV SPEC ══════════ */}
      <section className="py-24 px-6 bg-[#080C10]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge badge-accent mb-4 inline-flex">OpenEnv Spec</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                A standard interface{" "}
                <span className="gradient-text">for every agent.</span>
              </h2>
              <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">
                Any LLM can drop into OpenEnv via the unified Python API. Implement{" "}
                <code className="text-[#818CF8] bg-[#6366F110] px-1.5 py-0.5 rounded text-sm">step()</code>,{" "}
                <code className="text-[#818CF8] bg-[#6366F110] px-1.5 py-0.5 rounded text-sm">reset()</code>, and{" "}
                <code className="text-[#818CF8] bg-[#6366F110] px-1.5 py-0.5 rounded text-sm">state()</code>{" "}
                — that&apos;s it.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  "Pydantic typed models for every action",
                  "Partial rewards — 0.0 to 1.0 granularity",
                  "Hallucination & repetition penalties built-in",
                  "Reproducible baseline agent included",
                  "REST API over FastAPI — no LLM dependency",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#10B98120] border border-[#10B98130] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-[#D1D5DB]">{point}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/dashboard" className="btn-primary">
                  <span>Open Dashboard →</span>
                </Link>
                <Link href="/evaluations" className="btn-secondary">
                  View Evaluations
                </Link>
              </div>
            </div>

            {/* Code snippet */}
            <div className="terminal space-y-1 text-[13px] rounded-2xl">
              <div className="flex gap-1.5 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="ml-3 text-[10px] text-[#4B5563]">openenv_spec.py</span>
              </div>
              {[
                { t: "from openenv import BaseEnvironment, Action", c: "#9CA3AF" },
                { t: "", c: "#9CA3AF" },
                { t: "class MyEnv(BaseEnvironment):", c: "#818CF8" },
                { t: "    def reset(self) -> Observation:", c: "#9CA3AF" },
                { t: `        self._state = self._load_scenario()`, c: "#6B7280" },
                { t: `        return self._observe()`, c: "#6B7280" },
                { t: "", c: "#9CA3AF" },
                { t: "    def step(self, action: Action) -> StepResult:", c: "#9CA3AF" },
                { t: `        reward = self._grade(action)`, c: "#6B7280" },
                { t: `        return StepResult(reward=reward, ...)`, c: "#6B7280" },
                { t: "", c: "#9CA3AF" },
                { t: "    def score(self) -> ScoreCard:", c: "#9CA3AF" },
                { t: `        return ScoreCard(`, c: "#6B7280" },
                { t: `            total_reward=self._total_reward,`, c: "#6B7280" },
                { t: `            breakdown=self._reward_log,`, c: "#6B7280" },
                { t: `        )`, c: "#6B7280" },
              ].map((line, i) => (
                <div key={i} style={{ color: line.c }}>{line.t || <>&nbsp;</>}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ NAVIGATION CARDS ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Everything in one place
            </h2>
            <p className="text-[#6B7280]">Jump to any section of the platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { href: "/dashboard",    icon: "📊", label: "Dashboard",    desc: "Metrics & overview", color: "#6366F1" },
              { href: "/environments", icon: "🌐", label: "Environments", desc: "4 domains",            color: "#8B5CF6" },
              { href: "/evaluations",  icon: "📋", label: "Evaluations",  desc: "Replay & score",      color: "#10B981" },
              { href: "/agents",       icon: "🤖", label: "Agents",       desc: "Agent registry",      color: "#F59E0B" },
              { href: "/live",         icon: "📡", label: "Live Data",    desc: "Ingest streams",      color: "#EF4444" },
              { href: "/settings",     icon: "⚙️", label: "Settings",     desc: "Configure",           color: "#06B6D4" },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="glass p-5 rounded-2xl text-center hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ background: `${page.color}20`, border: `1px solid ${page.color}25` }}
                >
                  {page.icon}
                </div>
                <p className="font-bold text-white text-sm">{page.label}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">{page.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="py-24 px-6 bg-[#080C10]">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="glass rounded-3xl p-16 relative overflow-hidden"
            style={{ border: "1px solid rgba(99,102,241,0.2)" }}
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-3xl" style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)"
            }} />
            <div className="relative z-10">
              <span className="badge badge-accent mb-6 inline-flex">Open Source & Free</span>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Ready to evaluate<br />
                <span className="gradient-text">your agent?</span>
              </h2>
              <p className="text-[#9CA3AF] text-xl mb-10 max-w-lg mx-auto">
                Spin up a simulation in seconds. No LLM required to start — use the baseline agent or plug in your own.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard" className="btn-primary text-base px-10 py-4">
                  <span>Launch Dashboard</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/environments/supportdesk" className="btn-secondary text-base px-10 py-4">
                  Try SupportDesk →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
