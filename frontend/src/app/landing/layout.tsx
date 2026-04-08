import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenEnv AgentOps — OS for AI Work Agents",
  description:
    "The multi-domain evaluation platform for AI agents. Simulate real business workflows — SupportDesk, CyberSOC, RefundOps, ClinicOps — with deterministic grading and real-time scoring.",
  openGraph: {
    title: "OpenEnv AgentOps",
    description: "The Operating System for AI Work Agents",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
