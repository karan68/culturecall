"use client";

import { useUiI18n } from "@/components/UiI18nProvider";

interface Insight {
  id: string;
  timestamp: number;
  speaker: string;
  observation: string;
  culturalFramework: string;
  suggestedResponse: string;
  severity: "low" | "medium" | "high";
  repAction: string;
  useCase: string;
  translatedObservation?: string;
  translatedFramework?: string;
  translatedResponse?: string;
  translationLocale?: string;
}

const severityColors = {
  low: "border-l-blue-500 bg-blue-500/10",
  medium: "border-l-yellow-500 bg-yellow-500/10",
  high: "border-l-red-500 bg-red-500/10",
};

const severityBadgeColors = {
  low: "bg-blue-500/20 text-blue-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  high: "bg-red-500/20 text-red-300",
};

const actionColors: Record<string, string> = {
  PAUSE: "bg-red-500/20 text-red-300",
  WAIT: "bg-blue-500/20 text-blue-300",
  ENGAGE: "bg-green-500/20 text-green-300",
  CONTINUE: "bg-green-500/20 text-green-300",
  PIVOT: "bg-purple-500/20 text-purple-300",
  DOCUMENT: "bg-amber-500/20 text-amber-300",
  VALUE: "bg-cyan-500/20 text-cyan-300",
  LISTEN: "bg-blue-500/20 text-blue-300",
  APPRECIATE: "bg-green-500/20 text-green-300",
  EXPLORE: "bg-purple-500/20 text-purple-300",
  CLARIFY: "bg-amber-500/20 text-amber-300",
  DECIDE: "bg-green-500/20 text-green-300",
  PRECISE: "bg-amber-500/20 text-amber-300",
  COMPLY: "bg-blue-500/20 text-blue-300",
  ROUTE: "bg-purple-500/20 text-purple-300",
  ORGANIZE: "bg-amber-500/20 text-amber-300",
  PRESENT: "bg-cyan-500/20 text-cyan-300",
};

export default function InsightCard({ insight }: { insight: Insight }) {
  const { t } = useUiI18n();

  const severityLabel =
    insight.severity === "high"
      ? t("overlay_severity_high")
      : insight.severity === "medium"
      ? t("overlay_severity_medium")
      : t("overlay_severity_low");

  const actionKey = `overlay_${insight.repAction.toLowerCase()}`;
  const localizedAction = t(actionKey) === actionKey ? insight.repAction : t(actionKey);

  return (
    <div className={`border-l-4 rounded-lg p-4 text-xs space-y-3 ${severityColors[insight.severity]} transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 transform hover:translate-x-1 animate-in fade-in slide-in-from-bottom-2`}>
      {/* Header with Severity Badge & Timestamp */}
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded font-bold text-xs uppercase tracking-wide ${severityBadgeColors[insight.severity]}`}>
          {insight.severity === "high" && "🔴"}
          {insight.severity === "medium" && "🟡"}
          {insight.severity === "low" && "🔵"}
          {" "}{severityLabel}
        </span>
        <span className="text-slate-500 text-xs">@{insight.timestamp}s</span>
      </div>

      {/* Observation - Key Insight */}
      <div className="space-y-1">
        <p className="text-slate-300 font-semibold leading-snug">
          {insight.observation}
        </p>
        {insight.translatedObservation && (
          <p className="text-indigo-300/80 text-xs leading-snug">
            🌐 {insight.translatedObservation}
          </p>
        )}
      </div>

      {/* Cultural Framework */}
      <div className="bg-slate-900/40 border border-slate-700/50 rounded p-2">
        <p className="text-slate-500 text-xs mb-1.5">📚 {t("insight_cultural_context")}:</p>
        <p className="text-slate-300 text-xs leading-relaxed">
          {insight.culturalFramework}
        </p>
        {insight.translatedFramework && (
          <p className="text-indigo-300/70 text-xs leading-relaxed mt-1">
            🌐 {insight.translatedFramework}
          </p>
        )}
      </div>

      {/* Suggested Response */}
      <div className="bg-amber-950/20 border border-amber-700/30 rounded p-2">
        <p className="text-amber-300/80 text-xs mb-1.5 font-semibold">💡 {t("insight_suggested_response")}:</p>
        <p className="text-amber-100/90 text-xs leading-relaxed">
          {insight.suggestedResponse}
        </p>
        {insight.translatedResponse && (
          <p className="text-indigo-200/70 text-xs leading-relaxed mt-1">
            🌐 {insight.translatedResponse}
          </p>
        )}
      </div>

      {/* Action Badge */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">{t("insight_action")}:</span>
        <div className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide ${actionColors[insight.repAction] || "bg-slate-500/20 text-slate-300"}`}>
          {localizedAction}
        </div>
      </div>
    </div>
  );
}
