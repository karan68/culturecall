"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import FrictionBreakdown from "@/components/FrictionBreakdown";
import CoachingCard from "@/components/CoachingCard";
import { useCallHistory } from "@/hooks/useCallHistory";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useUiI18n } from "@/components/UiI18nProvider";

function ReportPageContent() {
  const searchParams = useSearchParams();
  const scenario = searchParams.get("scenario") || "sales";
  const lineCount = parseInt(searchParams.get("lines") || "9");
  const { saveCall } = useCallHistory();
  const { locale, t } = useUiI18n();

  // Mock report data
  const report = {
    duration: Math.round((lineCount / 9) * 47), // Approximate duration
    languagePair:
      scenario === "sales"
        ? "EN ↔ JA"
        : scenario === "interviews"
        ? "EN ↔ PT-BR"
        : "EN ↔ DE",
    frictionScore: Math.round(Math.random() * 100) / 10,
    highRiskCount: Math.floor(Math.random() * 3) + 1,
    highTrustCount: Math.floor(Math.random() * 2) + 1,
  };

  // Friction breakdown dimensions
  const frictionDimensions = {
    communication: Math.round(Math.random() * 10 * 10) / 10,
    trust: Math.round(Math.random() * 10 * 10) / 10,
    alignment: Math.round(Math.random() * 10 * 10) / 10,
    decisionClarity: Math.round(Math.random() * 10 * 10) / 10,
  };

  // Coaching observations
  const coachingObservations = [
    {
      pattern: t("report_coaching_pattern_rejection"),
      risk: "high" as const,
      suggestion: t("report_coaching_suggestion_rejection"),
    },
    {
      pattern: t("report_coaching_pattern_silence"),
      risk: "medium" as const,
      suggestion: t("report_coaching_suggestion_silence"),
    },
  ];

  const mockInsights = [
    {
      time: "14:22",
      type: "high",
      insight: t("report_soft_rejection_title"),
      context: t("report_soft_rejection_context"),
      recommendation: t("report_soft_rejection_recommendation"),
    },
    {
      time: "28:44",
      type: "medium",
      insight: t("report_silence_processing_title"),
      context: t("report_silence_processing_context"),
      recommendation: t("report_silence_processing_recommendation"),
    },
  ];

  // Save call to history on load
  useEffect(() => {
    saveCall({
      callId: `call-${Date.now()}`,
      timestamp: Date.now(),
      scenario: scenario as "sales" | "interviews" | "meetings",
      duration: report.duration * 60,
      insightCount: report.highRiskCount + report.highTrustCount,
      frictionScore: report.frictionScore,
      highRiskCount: report.highRiskCount,
      coachingPoints: [
        "Allow processing silence",
        "Expand decision circle",
        "Prioritize written follow-up",
      ],
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-amber-500/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("report_title")}</h1>
            <p className="text-sm text-slate-400">{t("report_post_call_analysis")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
            >
              ← {t("call_back_home")}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Report Header */}
        <div className="glass-effect rounded-lg p-8 mb-8">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-2">{t("report_duration")}</p>
              <p className="text-3xl font-bold text-amber-400">
                {report.duration} <span className="text-lg">{t("report_minutes")}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">{t("report_language_pair")}</p>
              <p className="text-2xl font-bold">{report.languagePair}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">{t("report_friction_score")}</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-orange-400">
                  {report.frictionScore}
                </p>
                <p className="text-sm text-slate-400">/10</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">{t("report_status")}</p>
              <p className="text-lg font-bold text-green-400">✓ {t("report_analyzed")}</p>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* High-Risk Moments */}
          <div className="glass-effect rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-red-400">
              ⚠️ {t("report_high_risk_moments")}
            </h2>
            <div className="space-y-4">
              {[...Array(report.highRiskCount)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-red-500/10 border border-red-500/30 rounded p-4"
                >
                  <p className="text-sm font-mono text-red-400 mb-2">
                    {mockInsights[idx]?.time || `${10 + idx * 5}:${20 + idx * 2}`}
                  </p>
                  <p className="text-sm font-semibold text-white mb-2">
                    {mockInsights[idx]?.insight || t("report_pattern_detected")}
                  </p>
                  <p className="text-xs text-slate-300 mb-3">
                    {mockInsights[idx]?.context ||
                      t("report_potential_friction")}
                  </p>
                  <p className="text-xs bg-red-500/20 p-2 rounded text-red-200">
                    💡{" "}
                    {mockInsights[idx]?.recommendation ||
                      t("report_adjust_approach")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* High-Trust Moments */}
          <div className="glass-effect rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-green-400">
              ✓ {t("report_high_trust_moments")}
            </h2>
            <div className="space-y-4">
              {[...Array(report.highTrustCount)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-green-500/10 border border-green-500/30 rounded p-4"
                >
                  <p className="text-sm font-mono text-green-400 mb-2">
                    09:15
                  </p>
                  <p className="text-sm font-semibold text-white mb-2">
                    {t("report_formal_address_trust")}
                  </p>
                  <p className="text-xs text-slate-300">
                    {t("report_formal_address_desc")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Friction Score Breakdown */}
        <div className="mb-8">
          <FrictionBreakdown dimensions={frictionDimensions} />
        </div>

        {/* AI Coaching Card */}
        <div className="mb-8">
          <CoachingCard scenario={scenario} observations={coachingObservations} />
        </div>

        {/* Original Coaching Section */}
        <div className="glass-effect rounded-lg p-8">
          <h2 className="text-xl font-bold mb-6 text-amber-400">
            🎯 {t("report_coaching")}
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-amber-400 font-bold">1.</span>
              <div>
                <p className="font-semibold text-white mb-1">
                  {t("report_coaching_silence_title")}
                </p>
                <p className="text-sm text-slate-300">
                  {t("report_coaching_silence_desc")}
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-400 font-bold">2.</span>
              <div>
                <p className="font-semibold text-white mb-1">
                  {t("report_coaching_decision_circle_title")}
                </p>
                <p className="text-sm text-slate-300">
                  {t("report_coaching_decision_circle_desc")}
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-amber-400 font-bold">3.</span>
              <div>
                <p className="font-semibold text-white mb-1">
                  {t("report_coaching_followup_title")}
                </p>
                <p className="text-sm text-slate-300">
                  {t("report_coaching_followup_desc")}
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-center gap-4">
          <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all">
            {t("report_download_pdf")}
          </button>
          <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
            {t("report_share_team")}
          </button>
          <Link
            href={`/?uiLocale=${locale}`}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
          >
            {t("report_try_another")}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportPageContent />
    </Suspense>
  );
}
