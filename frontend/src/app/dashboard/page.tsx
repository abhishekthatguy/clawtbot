"use client";

import { useState } from "react";
import Link from "next/link";

interface Stats {
  totalContent: number;
  approved: number;
  published: number;
  avgScore: number;
}

export default function Dashboard() {
  const [stats] = useState<Stats>({
    totalContent: 0,
    approved: 0,
    published: 0,
    avgScore: 0,
  });

  const STAT_CARDS = [
    { label: "Total Content", value: stats.totalContent, icon: "📝", color: "#3b82f6" },
    { label: "Approved", value: stats.approved, icon: "✅", color: "#22c55e" },
    { label: "Published", value: stats.published, icon: "🚀", color: "#dc2626" },
    { label: "Avg Score", value: `${stats.avgScore}/10`, icon: "⭐", color: "#eab308" },
  ];

  const AGENTS = [
    { name: "Content Creator", status: "ready", icon: "📝", desc: "Generates captions, hooks, CTAs" },
    { name: "Hashtag Generator", status: "ready", icon: "#️⃣", desc: "Niche & broad hashtag research" },
    { name: "Review Agent", status: "ready", icon: "🔍", desc: "Grammar, compliance, optimization" },
    { name: "Scheduler Bot", status: "ready", icon: "📅", desc: "Daily cron at 9 AM" },
    { name: "Publisher Bot", status: "ready", icon: "🚀", desc: "Publishes to all platforms" },
    { name: "Engagement Bot", status: "ready", icon: "💬", desc: "AI comment replies" },
    { name: "Analytics Agent", status: "ready", icon: "📊", desc: "Weekly performance reports" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to <span className="gradient-text">ClawtBot</span>
        </h1>
        <p style={{ color: "var(--clawt-text-dim)" }}>
          Your AI-powered social media command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: `${stat.color}22`, color: stat.color }}>
                Live
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/workflows" className="btn-primary text-center text-sm">
              🔄 New Workflow
            </Link>
            <Link href="/content" className="btn-secondary text-center text-sm">
              📝 View Content
            </Link>
            <Link href="/analytics" className="btn-secondary text-center text-sm">
              📊 Analytics
            </Link>
            <button className="btn-secondary text-sm">
              🧠 LLM Health
            </button>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4">🔄 Pipeline Flow</h2>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {["Content", "→", "Hashtags", "→", "Review", "→", "Approve", "→", "Publish", "→", "Engage"].map(
              (step, i) =>
                step === "→" ? (
                  <span key={i} style={{ color: "var(--clawt-red)" }}>→</span>
                ) : (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg font-medium"
                    style={{
                      background: "var(--clawt-surface-2)",
                      border: "1px solid var(--clawt-border)",
                    }}
                  >
                    {step}
                  </span>
                )
            )}
          </div>
        </div>
      </div>

      {/* Agents Status */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">🤖 Agent Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 stagger-children">
          {AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="p-4 rounded-xl transition-all duration-300 hover:border-red-500/30"
              style={{
                background: "var(--clawt-surface)",
                border: "1px solid var(--clawt-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{agent.icon}</span>
                <span className="text-sm font-semibold">{agent.name}</span>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--clawt-text-dim)" }}>
                {agent.desc}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-400 font-medium capitalize">
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
