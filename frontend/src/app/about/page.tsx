import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — OpenEnv AgentOps",
  description:
    "Learn about OpenEnv AgentOps — the open-source operating system for evaluating AI work agents across realistic business simulations.",
};

const TEAM_VALUES = [
  {
    icon: "🔬",
    title: "Research-Driven",
    desc: "Every environment is grounded in real-world business workflows, not synthetic benchmarks. We obsess over ecological validity.",
    color: "#6366F1",
  },
  {
    icon: "🔓",
    title: "Radically Open",
    desc: "MIT licensed, fully open source. We believe the evaluation infrastructure for AI should be owned by the community.",
    color: "#10B981",
  },
  {
    icon: "⚖️",
    title: "Rigorous & Fair",
    desc: "Deterministic grading means every agent is evaluated the same way. No cherry-picking. No prompt gaming. Just raw performance.",
    color: "#F59E0B",
  },
  {
    icon: "🚀",
    title: "Production-Focused",
    desc: "We build for agents that will be deployed in real companies. If it doesn't reflect real work, we don't ship it.",
    color: "#EF4444",
  },
];

const TIMELINE = [
  {
    year: "2024 Q3",
    title: "OpenEnv Conceived",
    desc: "Frustrated by toy benchmarks, the founding team began designing a simulation framework for real agentic tasks.",
    color: "#6366F1",
  },
  {
    year: "2024 Q4",
    title: "First Environment",
    desc: "SupportDesk v0.1 shipped — the first fully deterministic customer support simulation with partial rewards.",
    color: "#8B5CF6",
  },
  {
    year: "2025 Q1",
    title: "Four Domains Live",
    desc: "CyberSOC, RefundOps, and ClinicOps joined the platform. The OpenEnv Spec was formalized as a Pydantic interface.",
    color: "#06B6D4",
  },
  {
    year: "2025 Q2",
    title: "v1.0 Released",
    desc: "Public launch with full REST API, baseline agent, Docker support, and Hugging Face Spaces deployment.",
    color: "#10B981",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="badge badge-accent mb-6 inline-flex">About OpenEnv</span>
          <h1
            className="font-black leading-tight tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Building the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              evaluation layer
            </span>
            <br />
            for the agentic era
          </h1>
          <p className="text-[#9CA3AF] text-xl leading-relaxed max-w-2xl mx-auto">
            OpenEnv is an open-source operating system for AI work agents. We build realistic,
            deterministic business simulations so researchers and engineers can measure what actually matters.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 border-y border-[#1F2937]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge badge-success mb-4 inline-flex">Our Mission</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
              Stop benchmarking. Start simulating.
            </h2>
            <p className="text-[#9CA3AF] text-lg leading-relaxed mb-4">
              Today&apos;s AI benchmarks measure trivia, not capability. An agent that scores 90% on MMLU
              may fail completely when asked to resolve a billing dispute with a real customer.
            </p>
            <p className="text-[#9CA3AF] leading-relaxed">
              OpenEnv closes this gap by recreating complete business contexts — with multi-turn interactions,
              real policies, SLA timers, and partial rewards — so you know exactly how your agent will perform
              before it goes live.
            </p>
          </div>
          <div className="glass p-8 rounded-2xl space-y-4">
            {[
              { label: "Lines of simulation logic", val: "12,000+" },
              { label: "Distinct reward signals", val: "48" },
              { label: "Business domains covered", val: "4" },
              { label: "Open source contributors", val: "MIT" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-[#1F2937] last:border-0">
                <span className="text-[#9CA3AF] text-sm">{s.label}</span>
                <span
                  className="font-black text-lg"
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-accent mb-4 inline-flex">Core Values</span>
            <h2 className="text-4xl font-black text-white">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM_VALUES.map((v) => (
              <div
                key={v.title}
                className="glass p-7 rounded-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: `${v.color}20`, border: `1px solid ${v.color}30` }}
                >
                  {v.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 bg-[#080C10]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge badge-warning mb-4 inline-flex">Roadmap</span>
            <h2 className="text-4xl font-black text-white">Our journey so far</h2>
          </div>
          <div className="relative pl-8">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gradient-to-b from-[#6366F1] via-[#8B5CF6] to-transparent" />
            <div className="flex flex-col gap-10">
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative">
                  <div
                    className="absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 border-[#0B0F14]"
                    style={{ background: t.color }}
                  />
                  <div className="glass p-6 rounded-xl ml-4">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.color }}>
                      {t.year}
                    </span>
                    <h3 className="font-bold text-white text-lg mt-1 mb-2">{t.title}</h3>
                    <p className="text-[#6B7280] text-sm leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to evaluate your agent?
          </h2>
          <p className="text-[#9CA3AF] mb-8">
            Start with the baseline agent or plug in your own LLM. No sign-up required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
              <span>Open Dashboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/environments" className="btn-secondary text-base px-8 py-3.5">
              Browse Environments →
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
