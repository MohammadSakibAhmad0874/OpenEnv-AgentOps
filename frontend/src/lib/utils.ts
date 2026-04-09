import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function gradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "text-success";
  if (grade === "B") return "text-accent";
  if (grade === "C") return "text-warning";
  return "text-danger";
}

export function percentageColor(pct: number): string {
  if (pct >= 85) return "#10B981";
  if (pct >= 65) return "#6366F1";
  if (pct >= 50) return "#F59E0B";
  return "#EF4444";
}

export function envIconEmoji(icon: string): string {
  const map: Record<string, string> = {
    headset: "🎧",
    shield: "🛡️",
    receipt: "🧾",
    stethoscope: "🏥",
  };
  return map[icon] ?? "⚡";
}
