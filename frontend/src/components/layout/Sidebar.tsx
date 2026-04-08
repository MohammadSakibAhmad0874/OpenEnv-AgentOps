"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme } from "@/contexts/ThemeContext";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const NAV = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Environments",
    href: "/environments",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
  },
  {
    label: "Agents",
    href: "/agents",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Evaluations",
    href: "/evaluations",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    label: "Live Data",
    href: "/live",
    liveIndicator: true,
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

const ENVS = [
  { label: "SupportDesk", href: "/environments/supportdesk", dot: "#6366F1" },
  { label: "CyberSOC",    href: "/environments/cybersoc",    dot: "#EF4444" },
  { label: "RefundOps",   href: "/environments/refundops",   dot: "#F59E0B" },
  { label: "ClinicOps",   href: "/environments/clinicops",   dot: "#10B981" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<"demo" | "live">("demo");

  useEffect(() => {
    fetch(`${BASE}/api/v1/settings/`)
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => {});
  }, []);

  const isDark = theme === "dark";

  return (
    <aside
      className={cn(
        "sidebar-root flex-shrink-0 h-full flex flex-col border-r",
        collapsed ? "sidebar-collapsed w-[64px]" : "w-[220px]"
      )}
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-sidebar)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center border-b flex-shrink-0"
        style={{
          borderColor: "var(--border-subtle)",
          padding: collapsed ? "16px 0" : "16px 20px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Link href="/landing" className="flex items-center gap-2.5 group no-underline" title="Back to Home">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-all">
            OE
          </div>
          {!collapsed && (
            <div className="sidebar-label overflow-hidden">
              <p className="text-[13px] font-semibold leading-tight group-hover:text-[#818CF8] transition-colors" style={{ color: "var(--text-primary)" }}>OpenEnv</p>
              <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>AgentOps</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn("nav-item relative", active && "active", collapsed && "justify-center px-0")}
              style={collapsed ? { padding: "10px", justifyContent: "center" } : {}}
            >
              {item.icon}
              {!collapsed && (
                <span className="sidebar-label flex-1">{item.label}</span>
              )}
              {!collapsed && item.liveIndicator && mode === "live" && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse flex-shrink-0" />
              )}
              {collapsed && item.liveIndicator && mode === "live" && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              )}
            </Link>
          );
        })}

        {/* Environments sub-section */}
        {!collapsed && (
          <>
            <div className="mt-4 mb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-subtle)" }}>
                Environments
              </p>
            </div>
            {ENVS.map((env) => {
              const active = pathname === env.href || pathname.startsWith(env.href + "/");
              return (
                <Link
                  key={env.href}
                  href={env.href}
                  className={cn("nav-item text-[13px]", active && "active")}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: env.dot }} />
                  <span className="sidebar-label">{env.label}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* Back to Home */}
        <div className={cn("mt-auto pt-4 border-t", collapsed ? "flex justify-center" : "")} style={{ borderColor: "var(--border-subtle)" }}>
          <Link
            href="/landing"
            title="Back to Home"
            className={cn("nav-item text-[12px]", collapsed && "justify-center")}
            style={collapsed ? { padding: "10px" } : {}}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!collapsed && <span className="sidebar-label">Back to Home</span>}
          </Link>
        </div>
      </nav>

      {/* Footer: theme toggle + mode badge + collapse button */}
      <div className="border-t flex-shrink-0" style={{ borderColor: "var(--border-subtle)", padding: collapsed ? "12px 8px" : "12px 16px" }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-medium transition-all mb-2",
            collapsed ? "justify-center" : ""
          )}
          style={{ background: "var(--nav-hover)", color: "var(--text-secondary)" }}
        >
          {isDark ? (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="flex-shrink-0">
              <circle cx="12" cy="12" r="5" />
              <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="flex-shrink-0">
              <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
          {!collapsed && <span className="sidebar-label">{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Mode badge when not collapsed */}
        {!collapsed && mode === "live" && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-[#10B98115] border border-[#10B98130] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#10B981]">LIVE MODE ACTIVE</span>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: "transparent",
            color: "var(--text-subtle)",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <svg
            width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            className="flex-shrink-0 transition-transform duration-300"
            style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="sidebar-label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
