"use client";

import Link from "next/link";

const LINKS = {
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Environments", href: "/environments" },
    { label: "Evaluations", href: "/evaluations" },
    { label: "Agents", href: "/agents" },
    { label: "Live Data", href: "/live" },
    { label: "Settings", href: "/settings" },
  ],
  Domains: [
    { label: "SupportDesk", href: "/environments/supportdesk" },
    { label: "CyberSOC", href: "/environments/cybersoc" },
    { label: "RefundOps", href: "/environments/refundops" },
    { label: "ClinicOps", href: "/environments/clinicops" },
  ],
  Developer: [
    { label: "API Docs", href: "http://localhost:8000/docs", external: true },
    { label: "OpenEnv Spec", href: "/openenv.yaml", external: true },
    { label: "GitHub", href: "https://github.com", external: true },
    { label: "Hugging Face", href: "https://huggingface.co", external: true },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const STATS = [
  { label: "Environments", value: "4" },
  { label: "Tasks Simulated", value: "1,200+" },
  { label: "Reward Dimensions", value: "12" },
  { label: "Avg. Score Accuracy", value: "98.4%" },
];

const SOCIAL = [
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Hugging Face",
    href: "https://huggingface.co",
    icon: (
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
  },
];

export function LandingFooter() {
  return (
    <footer className="site-footer">
      <div className="max-w-7xl mx-auto">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-[#1F2937]">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-[12px] text-[#6B7280] mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main links grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 mb-12 border-b border-[#1F2937]">

          {/* Brand col — spans 2 */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group no-underline">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                OE
              </div>
              <div>
                <p className="text-[15px] font-bold text-white leading-none">OpenEnv</p>
                <p className="text-[10px] text-[#6366F1] leading-none font-medium tracking-wider">AGENTOPS</p>
              </div>
            </Link>
            <p className="text-[13px] text-[#6B7280] leading-relaxed max-w-[220px] mb-5">
              The OS for AI Work Agents. Real business tasks, deterministic grading, real results.
            </p>
            <div className="flex gap-2 mb-5">
              <span className="badge badge-success">v1.0.0</span>
              <span className="badge badge-accent">MIT License</span>
              <span className="badge badge-muted">Open Source</span>
            </div>
            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIAL.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#6B7280] hover:text-white hover:border-[#6366F1] transition-all"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#4B5563] mb-4">{section}</p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={"external" in item && item.external ? "_blank" : undefined}
                      className="text-[13px] text-[#6B7280] hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {item.label}
                      {"external" in item && item.external && (
                        <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <p className="text-[12px] text-[#4B5563]">
            © 2025 OpenEnv AgentOps. Built with FastAPI + Next.js. Released under the MIT License.
          </p>
          <div className="flex items-center gap-6">
            {/* Quick legal links */}
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-[12px] text-[#4B5563] hover:text-[#9CA3AF] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[12px] text-[#4B5563] hover:text-[#9CA3AF] transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-[12px] text-[#4B5563] hover:text-[#9CA3AF] transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[12px] text-[#6B7280]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
