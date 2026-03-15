"use client";

import { useState } from "react";
import Link from "next/link";
import { useCallHistory } from "@/hooks/useCallHistory";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useUiI18n } from "@/components/UiI18nProvider";

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "demo">("chat");
  const { calls } = useCallHistory();
  const { locale, t } = useUiI18n();

  const scenarios = [
    {
      id: "sales",
      name: t("home_sales_call"),
      description: t("home_sales_description"),
      icon: "💼",
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "interviews",
      name: t("home_interview"),
      description: t("home_interview_description"),
      icon: "🎓",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "meetings",
      name: t("home_meeting"),
      description: t("home_meeting_description"),
      icon: "🤝",
      color: "from-blue-500 to-cyan-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-amber-500/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌍</div>
            <div>
              <h1 className="text-2xl font-bold">CultureCall</h1>
              <p className="text-sm text-slate-400">
                Real-Time Cultural Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {calls.length > 0 && (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors"
              >
                📊 {t("home_metrics")} ({calls.length})
              </Link>
            )}
            <LocaleSwitcher />
            <div className="text-right text-sm text-slate-400">
              Hackathon Demo v0.1
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            {t("home_cultural_live")}
          </h2>
          <p className="text-xl text-slate-300 mb-2">
            {t("home_realtime_insights")}
          </p>
          <p className="text-slate-400">
            {t("home_chat_or_demo")}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl overflow-hidden border border-slate-700 bg-slate-800/60">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-8 py-3 font-semibold text-sm transition-colors ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              💬 {t("home_live_chat")}
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`px-8 py-3 font-semibold text-sm transition-colors ${
                activeTab === "demo"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              🎬 {t("home_solo_demo")}
            </button>
          </div>
        </div>

        {/* ── LIVE CHAT TAB ─────────────────────────────────────────────────── */}
        {activeTab === "chat" && (
          <div>
            {/* How it works */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {[
                { step: "1", icon: "🏠", title: t("home_create_room_title"), desc: t("home_create_room_desc") },
                { step: "2", icon: "🔗", title: t("home_share_code_title"), desc: t("home_share_code_desc") },
                { step: "3", icon: "🌍", title: t("home_chat_insights_title"), desc: t("home_chat_insights_desc") },
              ].map((item) => (
                <div key={item.step} className="glass-effect rounded-xl p-6 flex flex-col items-center text-center border border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-sm mb-3">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-white mb-1">{item.title}</div>
                  <div className="text-sm text-slate-400">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Scenario Cards for Chat */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {scenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/chat?scenario=${scenario.id}&uiLocale=${locale}`}
                  className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="relative glass-effect p-7 h-full flex flex-col border border-slate-700/50 group-hover:border-amber-500/50 transition-colors rounded-xl">
                    <div className="text-4xl mb-3">{scenario.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{scenario.name}</h3>
                    <p className="text-slate-300 text-sm flex-grow mb-4">{scenario.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {t("home_start_chat_room")} →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Join Existing Room */}
            <div className="flex justify-center mb-8">
              <Link
                href={`/chat?uiLocale=${locale}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 rounded-xl text-slate-300 hover:text-white font-semibold text-sm transition-all"
              >
                🔑 {t("home_join_existing_room")}
              </Link>
            </div>

            {/* Test Scripts tip */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex gap-4 items-start">
              <div className="text-2xl flex-shrink-0">📋</div>
              <div>
                <div className="font-semibold text-white mb-1">{t("home_test_scripts_title")}</div>
                <div className="text-sm text-slate-400">
                  {t("home_test_scripts_desc")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DEMO TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "demo" && (
          <div>
            <p className="text-center text-slate-400 mb-8 text-sm">
              {t("home_demo_description")}
            </p>

            {/* Scenarios Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => setSelected(scenario.id)}
                  className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                    selected === scenario.id
                      ? "ring-2 ring-amber-500 scale-105"
                      : "hover:scale-[1.02]"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                  <div className="relative glass-effect p-8 h-full flex flex-col">
                    <div className="mb-6">
                      <div className="text-5xl mb-3">{scenario.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{scenario.name}</h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-6 flex-grow">{scenario.description}</p>
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      {t("home_ready_to_demo")}
                    </div>
                  </div>
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${selected === scenario.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"} border border-amber-500/50`} />
                </div>
              ))}
            </div>

            {/* Start Button */}
            <div className="flex justify-center mb-16">
              {selected ? (
                <Link
                  href={`/call?scenario=${selected}&uiLocale=${locale}`}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300"
                >
                  <span>{t("home_start_demo")}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              ) : (
                <div className="px-8 py-4 bg-slate-700 rounded-lg text-slate-400 font-semibold">
                  {t("home_select_scenario_begin")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call History Section (both tabs) */}
        {calls.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              📜 {t("home_recent_calls")}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calls.slice(0, 6).map((call) => (
                <Link
                  key={call.callId}
                  href={`/report?scenario=${call.scenario}&lines=9&uiLocale=${locale}`}
                  className="glass-effect p-4 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-700 hover:border-amber-500/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-amber-400">
                        {call.scenario === "sales" ? "💼 Sales" : call.scenario === "interviews" ? "🎓 Interview" : "🤝 Meeting"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(call.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-amber-400">
                        {call.frictionScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">{t("home_friction")}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div>{t("home_duration")}: {Math.round(call.duration / 60)}m</div>
                    <div>{t("home_insights")}: {call.insightCount}</div>
                    <div className="flex gap-1 mt-2">
                      {call.highRiskCount > 0 && <span className="px-2 py-1 bg-red-500/20 rounded text-red-300">🔴 {call.highRiskCount}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link href="/dashboard" className="text-sm text-amber-400 hover:text-amber-300">
                {t("home_view_all_calls")} →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16 py-8 text-center text-slate-500 text-sm">
        <p>
          Powered by Lingo.dev, Groq, and Socket.io for real-time cultural intelligence
        </p>
      </footer>
    </div>
  );
}
