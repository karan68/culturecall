// Linguistic DNA Report — post-call analysis
// Applies directness, formality, face-saving dimensions per Brown & Levinson / Hall / Hofstede

import { LinguisticDNA } from "@/utils/linguisticAnalysis";

const SCENARIO_TARGETS_LOCAL: Record<string, { formality: number; directness: number; faceSaving: number; label: string }> = {
  sales: { formality: 70, directness: 30, faceSaving: 75, label: "JA enterprise (nemawashi culture)" },
  interviews: { formality: 55, directness: 50, faceSaving: 65, label: "BR relational communication" },
  meetings: { formality: 65, directness: 75, faceSaving: 50, label: "DE direct-fact culture" },
};

function DNABar({ label, value, target, max = 100 }: { label: string; value: number; target: number; max?: number }) {
  const diff = value - target;
  const barColor = Math.abs(diff) <= 15 ? "bg-green-500" : Math.abs(diff) <= 30 ? "bg-amber-500" : "bg-red-500";
  const status = Math.abs(diff) <= 15 ? "✓ On target" : diff > 0 ? "↑ Too high" : "↓ Too low";
  const statusColor = Math.abs(diff) <= 15 ? "text-green-400" : "text-amber-400";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-300 font-semibold">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${statusColor}`}>{status}</span>
          <span className="text-sm font-bold text-white tabular-nums">{value}</span>
          <span className="text-xs text-slate-600">/ target: {target}</span>
        </div>
      </div>
      <div className="relative h-2 bg-slate-700 rounded-full overflow-visible">
        {/* Actual bar */}
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50 rounded-full"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function LinguisticDNAReport({ dna, scenario }: { dna: LinguisticDNA; scenario: string }) {
  const targets = SCENARIO_TARGETS_LOCAL[scenario] || SCENARIO_TARGETS_LOCAL.sales;

  const formattedRatio = `${dna.talkRatio}% rep / ${100 - dna.talkRatio}% prospect`;
  const ratioStatus = dna.talkRatio >= 40 && dna.talkRatio <= 60 ? "✓ Balanced" : dna.talkRatio > 60 ? "↑ Over-talking" : "↓ Too quiet";
  const ratioColor = dna.talkRatio >= 40 && dna.talkRatio <= 60 ? "text-green-400" : "text-amber-400";

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Linguistic DNA Analysis</div>
            <div className="text-xs text-slate-400 mt-0.5">Optimized for: {targets.label}</div>
          </div>
          <div className="text-xs text-slate-500 font-mono">{dna.totalMessages} messages</div>
        </div>
      </div>

      <div className="p-5">
        {/* Dimensional Analysis */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Communication Dimensions</div>
          <DNABar label="Formality Level" value={dna.formality} target={targets.formality} />
          <DNABar label="Directness" value={dna.directness} target={targets.directness} />
          <DNABar label="Face-Saving Language" value={dna.faceSaving} target={targets.faceSaving} />
        </div>

        {/* Talk Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Talk Ratio", value: formattedRatio, sub: ratioStatus, color: ratioColor },
            { label: "Avg Msg Length", value: `${dna.avgMessageLength} words`, sub: dna.avgMessageLength > 40 ? "Long" : dna.avgMessageLength < 8 ? "Very short" : "Good", color: "text-slate-300" },
            { label: "Formality Style", value: dna.formalityLabel, sub: dna.directnessLabel, color: "text-amber-300" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/60 rounded-lg p-2.5 text-center">
              <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
              <div className={`text-xs font-bold ${stat.color} leading-tight`}>{stat.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Gaps & Strengths */}
        <div className="grid grid-cols-2 gap-3">
          {dna.strengths.length > 0 && (
            <div>
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1.5">✓ Strengths</div>
              <ul className="space-y-1">
                {dna.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                    <span className="text-green-400 flex-shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dna.gaps.length > 0 && (
            <div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5">⚠ Gaps</div>
              <ul className="space-y-1">
                {dna.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                    <span className="text-amber-400 flex-shrink-0">•</span>{g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dna.gaps.length === 0 && dna.strengths.length === 0 && (
            <div className="col-span-2 text-xs text-slate-500 text-center py-2">Chat more to generate analysis</div>
          )}
        </div>
      </div>

      {/* Footer citation */}
      <div className="px-5 py-2 bg-slate-900/40 border-t border-slate-700/50">
        <p className="text-xs text-slate-600">
          Based on: Hall (1976) High/Low Context · Brown &amp; Levinson (1987) Politeness Theory · Hofstede Cultural Dimensions
        </p>
      </div>
    </div>
  );
}
