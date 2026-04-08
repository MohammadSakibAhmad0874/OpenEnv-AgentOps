"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Environments", href: "/environments" },
  { label: "Evaluations", href: "/evaluations" },
  { label: "Live Data", href: "/live" },
  { label: "Agents", href: "/agents" },
  { label: "About", href: "/about" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "site-header animate-fade-in-down",
        scrolled && "shadow-[0_2px_40px_rgba(0,0,0,0.6)]"
      )}
    >
      {/* Logo */}
      <Link href="/landing" className="flex items-center gap-3 no-underline group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all">
          OE
        </div>
        <div>
          <p className="text-[15px] font-bold text-white leading-none">OpenEnv</p>
          <p className="text-[10px] text-[#6366F1] leading-none font-medium tracking-wider">AGENTOPS</p>
        </div>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] transition-all"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-3">
        <Link href="/settings" className="text-[13px] text-[#6B7280] hover:text-white transition-colors">
          Settings
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[13px] font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
        >
          Open Dashboard →
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 text-[#9CA3AF] hover:text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0D1117] border-b border-[#1F2937] py-4 px-6 flex flex-col gap-2 md:hidden animate-fade-in">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-[14px] text-[#9CA3AF] hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-2 py-2.5 text-center rounded-lg bg-[#6366F1] text-white text-[14px] font-semibold"
          >
            Open Dashboard →
          </Link>
        </div>
      )}
    </header>
  );
}
