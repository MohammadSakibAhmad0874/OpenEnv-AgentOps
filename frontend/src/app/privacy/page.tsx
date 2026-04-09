import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OpenEnv AgentOps",
  description: "Privacy policy for OpenEnv AgentOps platform.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      "OpenEnv AgentOps is an open-source platform designed to operate locally or on self-hosted infrastructure. In its default configuration, we do not collect any personal information.",
      "If you deploy using our hosted Hugging Face Spaces instance, standard web server logs (IP address, browser type, access timestamps) may be temporarily retained as part of the hosting provider's infrastructure. These logs are not linked to any personal identity.",
      "If you voluntarily contact us via GitHub Issues or email regarding bugs or feature requests, we retain the information you provide solely to respond to your inquiry.",
    ],
  },
  {
    title: "2. Data You Generate",
    content: [
      "All agent evaluation sessions, simulation results, and reward scores are stored locally in your deployment environment. When running OpenEnv locally, this data never leaves your machine.",
      "The Live Data Ingestion feature (when configured) processes events you explicitly stream into the platform. No simulation data is transmitted to any third-party service by default.",
    ],
  },
  {
    title: "3. Cookies & Local Storage",
    content: [
      "The OpenEnv frontend may use browser localStorage to persist UI preferences (e.g., selected environment, theme settings). No tracking cookies are set.",
      "No third-party analytics, advertising networks, or tracking pixels are embedded in the platform.",
    ],
  },
  {
    title: "4. Third-Party Services",
    content: [
      "OpenEnv may load fonts from Google Fonts CDN (fonts.googleapis.com). Google's privacy policy governs this interaction.",
      "If you configure API integrations (e.g., OpenAI, Anthropic, or other LLM providers) within your deployment, those services have their own privacy policies that apply to data you send to them.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "Because OpenEnv is primarily a self-hosted platform, security of your evaluation data depends on the security of your own infrastructure. We recommend following best practices for server hardening, access control, and network security.",
      "We do not transmit or store your agent data on any centralized servers.",
    ],
  },
  {
    title: "6. Open Source",
    content: [
      "OpenEnv is MIT-licensed open-source software. The complete source code is publicly available for audit. You can verify exactly what data the application accesses and transmits.",
    ],
  },
  {
    title: "7. Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time. Changes will be reflected in the project's GitHub repository with a dated commit. Continued use of the platform after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "8. Contact",
    content: [
      "If you have questions about this privacy policy, please open an issue on our GitHub repository or reach out via the contact page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-x-hidden">
      <LandingHeader />

      {/* Hero */}
      <section className="relative pt-36 pb-16 px-6 overflow-hidden">
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
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="badge badge-accent mb-6 inline-flex">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-[#6B7280]">
            Effective date: <strong className="text-[#9CA3AF]">January 1, 2025</strong>
          </p>
          <p className="text-[#9CA3AF] mt-3 max-w-xl mx-auto">
            OpenEnv is built with privacy by design. Here&apos;s exactly what we collect, store, and share — which is very little.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Summary box */}
          <div className="glass p-6 rounded-2xl mb-10 border border-[#6366F130]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#6366F120] border border-[#6366F130] flex items-center justify-center text-xl flex-shrink-0">
                🔒
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Short version</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  OpenEnv is self-hosted. We don&apos;t track you, sell your data, or run ads.
                  Your evaluation sessions stay on your own infrastructure. The only data we might
                  see is if you contact us via GitHub.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-[#1F2937]">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-[#9CA3AF] leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#1F2937] flex flex-wrap gap-4 items-center justify-between">
            <p className="text-[#4B5563] text-sm">© 2025 OpenEnv AgentOps. MIT License.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-[#6B7280] hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-[#6B7280] hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
