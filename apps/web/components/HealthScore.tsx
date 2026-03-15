// Live Conversation Health Score
// Updates in real-time as messages arrive

import { HealthScore } from "@/utils/linguisticAnalysis";

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function trendIcon(trend: HealthScore["trend"]) {
  if (trend === "improving") return <span className="text-green-400 text-xs">↑</span>;
  if (trend === "declining") return <span className="text-red-400 text-xs">↓</span>;
  return <span className="text-slate-500 text-xs">→</span>;
}

const RISK_COLORS: Record<string, string> = {
  low: "text-green-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const RISK_BADGES: Record<string, string> = {
  low: "bg-green-500/10 border-green-500/30 text-green-400",
  medium: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  high: "bg-red-500/10 border-red-500/30 text-red-400",
};

export default function HealthScorePanel({ score }: { score: HealthScore }) {
  const scoreColor =
    score.overall >= 70 ? "text-green-400" : score.overall >= 45 ? "text-amber-400" : "text-red-400";

  const barColor = (v: number) =>
    v >= 70 ? "bg-green-500" : v >= 45 ? "bg-amber-500" : "bg-red-500";

  const dims = [
    { label: "Trust Building", value: score.trust },
    { label: "Comm. Fit", value: score.communicationFit },
    { label: "Engagement", value: score.engagement },
  ];

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversation Health</div>
        <div className="flex items-center gap-1.5">
          {trendIcon(score.trend)}
          <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>{score.overall}</span>
          <span className="text-slate-600 text-xs">/100</span>
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-2 mb-2">
        {dims.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{d.label}</span>
              <span className={barColor(d.value).replace("bg-", "text-")}>{d.value}</span>
            </div>
            <Bar value={d.value} color={barColor(d.value)} />
          </div>
        ))}
      </div>

      {/* Risk badge */}
      <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${RISK_BADGES[score.riskLevel]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${RISK_COLORS[score.riskLevel].replace("text-", "bg-")}`} />
        {score.riskLevel.toUpperCase()} RISK
      </div>
    </div>
  );
}
