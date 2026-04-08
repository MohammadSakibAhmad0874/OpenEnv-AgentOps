"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

const CHANNELS = [
  {
    icon: "🐙",
    title: "GitHub Issues",
    desc: "Best for bug reports, feature requests, and technical discussions.",
    link: "https://github.com",
    linkLabel: "Open an Issue →",
    color: "#6366F1",
  },
  {
    icon: "📖",
    title: "Documentation",
    desc: "Browse the API reference and integration guides in the FastAPI docs.",
    link: "/dashboard",
    linkLabel: "Open Dashboard →",
    color: "#10B981",
  },
  {
    icon: "🤗",
    title: "Hugging Face Spaces",
    desc: "Deploy and discuss OpenEnv on the Hugging Face Hub.",
    link: "https://huggingface.co",
    linkLabel: "Visit HF Space →",
    color: "#F59E0B",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real deployment this would send to a backend or service
    setSubmitted(true);
  };

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
          <span className="badge badge-accent mb-6 inline-flex">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Contact Us</h1>
          <p className="text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
            Have a question, found a bug, or want to contribute? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Channels */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {CHANNELS.map((ch) => (
            <div
              key={ch.title}
              className="glass p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `${ch.color}20`, border: `1px solid ${ch.color}30` }}
              >
                {ch.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{ch.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">{ch.desc}</p>
              <Link
                href={ch.link}
                target={ch.link.startsWith("http") ? "_blank" : undefined}
                className="text-sm font-semibold transition-colors"
                style={{ color: ch.color }}
              >
                {ch.linkLabel}
              </Link>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="glass p-8 rounded-2xl">
            <h2 className="text-2xl font-black text-white mb-2">Send a Message</h2>
            <p className="text-[#6B7280] text-sm mb-8">
              For general inquiries. For technical issues, please use GitHub Issues.
            </p>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#10B98120] border border-[#10B98130] flex items-center justify-center text-3xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="font-bold text-white text-xl mb-2">Message Received</h3>
                <p className="text-[#6B7280]">
                  Thanks for reaching out! We&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 btn-secondary text-sm px-6 py-2.5"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full bg-[#111827] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full bg-[#111827] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more..."
                    className="w-full bg-[#111827] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4B5563] focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center text-base py-3.5">
                  <span>Send Message</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
