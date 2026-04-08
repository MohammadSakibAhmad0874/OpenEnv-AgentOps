"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { toggle, collapsed } = useSidebar();

  return (
    <div
      className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-topbar)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors md:hidden"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-[14px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{title}</h1>
          {subtitle && (
            <p className="text-[11px] leading-tight" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            width="13" height="13" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}
            style={{ color: "var(--text-subtle)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-48 rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none transition-colors border"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          />
        </div>

        {actions}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
          }}
        >
          {theme === "dark" ? (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="5" />
              <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors relative border"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ color: "var(--text-secondary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
        </div>
      </div>
    </div>
  );
}
