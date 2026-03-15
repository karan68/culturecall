"use client";

import { useSocket } from "@/hooks/useSocket";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import InsightCard from "@/components/InsightCard";
import TranscriptPanel from "@/components/TranscriptPanel";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useUiI18n } from "@/components/UiI18nProvider";

function CallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenario = searchParams.get("scenario") || "sales";
  const { locale, t } = useUiI18n();

  const { connected, transcript, insights, callActive, startCall, connectionError } = useSocket();
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  const scenarioData = {
    sales: {
      repLang: "en",
      prospectLang: "ja",
      title: t("call_sales_title"),
      subtitle: t("call_sales_subtitle"),
    },
    interviews: {
      repLang: "en",
      prospectLang: "pt-br",
      title: t("call_interviews_title"),
      subtitle: t("call_interviews_subtitle"),
    },
    meetings: {
      repLang: "en",
      prospectLang: "de",
      title: t("call_meetings_title"),
      subtitle: t("call_meetings_subtitle"),
    },
  };

  const config = scenarioData[scenario as keyof typeof scenarioData] || scenarioData.sales;

  useEffect(() => {
    if (connected && !started) {
      // Auto-start demo after connection
      setStarted(true);
      startCall(scenario, config.prospectLang);
    }
  }, [connected, started, scenario, config.prospectLang, startCall]);

  // Update progress
  useEffect(() => {
    if (callActive && transcript.length > 0) {
      const mockProgress = Math.min(100, (transcript.length / 10) * 100);
      setProgress(mockProgress);
    }
  }, [transcript.length, callActive]);

  const highRiskInsights = insights.filter((i) => i.severity === "high");
  const mediumRiskInsights = insights.filter((i) => i.severity === "medium");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-amber-500/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl hover:text-amber-400 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-xs text-slate-400">{config.subtitle}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  callActive
                    ? "bg-red-500 animate-pulse"
                    : connected
                    ? "bg-green-500"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-sm font-mono text-slate-300">
                {callActive
                  ? `🔴 ${t("overlay_live_badge")}`
                  : connected
                  ? t("call_connected")
                  : t("call_connecting")}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {callActive && (
          <div className="h-1 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      {/* Error Banner */}
      {connectionError && (
        <div className="bg-red-950/50 border-b border-red-700/50 px-6 py-3 flex items-center gap-2">
          <span className="text-red-400 text-sm">🔌 {connectionError}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-full">
        <div className="grid grid-cols-3 gap-4 p-6 h-[calc(100vh-120px)]">
          {/* Left: Video/Call Area */}
          <div className="col-span-1 glass-effect rounded-lg p-6 flex flex-col">
            <div className="text-sm text-slate-400 mb-4">{t("call_simulation")}</div>

            {/* Placeholder for video */}
            <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg mb-4 flex items-center justify-center border border-slate-600">
              <div className="text-center">
                <div className="text-4xl mb-2">📹</div>
                <p className="text-sm text-slate-400">{t("call_stream")}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {callActive ? t("call_recording") : t("call_ready")}
                </p>
              </div>
            </div>

            {/* Call Stats */}
            <div className="space-y-3">
              <div className="bg-slate-800/50 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">{t("call_lines_processed")}</p>
                <p className="text-xl font-bold text-amber-400">
                  {transcript.length}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">{t("call_insights_found")}</p>
                <p className="text-xl font-bold text-amber-400">
                  {insights.length}
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Transcript Panel */}
          <div className="col-span-1 glass-effect rounded-lg p-6 flex flex-col overflow-hidden">
            <div className="text-sm text-slate-400 mb-4 font-semibold">
              {t("transcript_header")}
            </div>
            <TranscriptPanel transcript={transcript} />
          </div>

          {/* Right: Insights Panel */}
          <div className="col-span-1 glass-effect rounded-lg p-6 flex flex-col overflow-hidden">
            <div className="text-sm text-slate-400 mb-4 font-semibold">
              {t("call_cultural_insights")} ({insights.length})
            </div>

            {/* Critical Alerts Section */}
            {highRiskInsights.length > 0 && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-xs font-bold text-red-400 mb-2">
                  ⚠️ {highRiskInsights.length} {t("call_critical_alerts")}
                </p>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {highRiskInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="text-xs text-red-300 bg-red-500/5 p-2 rounded"
                    >
                      {insight.observation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {insights.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  {t("call_waiting_for_insights")}
                </div>
              ) : (
                insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Action Bar (Bottom) */}
      {!callActive && transcript.length > 0 && (
        <div className="border-t border-amber-500/20 bg-slate-900/50 backdrop-blur-sm p-4 flex justify-end gap-4">
          <Link
            href={`/report?scenario=${scenario}&lines=${transcript.length}&uiLocale=${locale}`}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            {t("call_view_report")}
          </Link>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
          >
            {t("call_back_home")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallPageContent />
    </Suspense>
  );
}
