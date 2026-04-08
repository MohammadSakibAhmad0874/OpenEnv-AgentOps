import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — OpenEnv AgentOps",
  description: "Terms of service for OpenEnv AgentOps platform.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using OpenEnv AgentOps (\"the Platform\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.",
      "These terms apply to all users who access the Platform, whether via self-hosted deployment, Hugging Face Spaces, or any other officially distributed instance.",
    ],
  },
  {
    title: "2. MIT License",
    content: [
      "OpenEnv AgentOps is open-source software released under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions of the MIT License.",
      "The MIT License is included in full in the project repository. Your use of the Platform automatically constitutes acceptance of the MIT License terms.",
    ],
  },
  {
    title: "3. Permitted Use",
    content: [
      "You may use OpenEnv for research, education, commercial development, internal evaluation, and any other lawful purpose.",
      "You may integrate OpenEnv with your own AI agents or LLM providers for evaluation purposes.",
      "You may modify the Platform and create derivative works under the terms of the MIT License.",
    ],
  },
  {
    title: "4. Prohibited Use",
    content: [
      "You may not use the Platform for any illegal purpose or in violation of any applicable local, national, or international law or regulation.",
      "You may not use the Platform to evaluate AI agents designed to cause harm, discrimination, or illegal activity.",
      "You may not claim official endorsement from the OpenEnv project without explicit written permission.",
    ],
  },
  {
    title: "5. No Warranties",
    content: [
      "THE PLATFORM IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.",
      "The simulation environments and reward scores are created for evaluation purposes only and do not constitute professional advice in any field (legal, medical, financial, security, etc.).",
    ],
  },
  {
    title: "6. Limitation of Liability",
    content: [
      "IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
      "This includes, without limitation, any direct, indirect, incidental, special, exemplary, or consequential damages resulting from decisions made based on AI agent evaluation scores produced by the Platform.",
    ],
  },
  {
    title: "7. Third-Party Integrations",
    content: [
      "The Platform is designed to integrate with third-party LLM providers (OpenAI, Anthropic, Google, etc.). Your use of those services is governed by their respective terms of service.",
      "We are not responsible for the behavior, accuracy, or costs incurred from third-party AI services you connect to the Platform.",
    ],
  },
  {
    title: "8. Changes to Terms",
    content: [
      "We reserve the right to update these terms at any time. Material changes will be communicated via the project's GitHub repository. Continued use of the Platform after such changes constitutes acceptance of the new terms.",
    ],
  },
];

export default function TermsPage() {
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
          <span className="badge badge-warning mb-6 inline-flex">Legal</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms of Service</h1>
          <p className="text-[#6B7280]">
            Effective date: <strong className="text-[#9CA3AF]">January 1, 2025</strong>
          </p>
          <p className="text-[#9CA3AF] mt-3 max-w-xl mx-auto">
            OpenEnv is MIT-licensed open-source software. These terms are straightforward — read on.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* MIT badge */}
          <div className="glass p-6 rounded-2xl mb-10 border border-[#F59E0B30]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B20] border border-[#F59E0B30] flex items-center justify-center text-xl flex-shrink-0">
                📄
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">MIT Licensed</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">
                  OpenEnv is free and open source, licensed under the MIT License. You can use it commercially,
                  modify it, and distribute it — with minimal restrictions. The full license is in the repository.
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
              <Link href="/privacy" className="text-[#6B7280] hover:text-white text-sm transition-colors">
                Privacy Policy
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
