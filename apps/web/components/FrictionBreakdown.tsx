"use client";

export interface FrictionBreakdownProps {
  dimensions: {
    communication: number;
    trust: number;
    alignment: number;
    decisionClarity: number;
  };
}

export default function FrictionBreakdown({ dimensions }: FrictionBreakdownProps) {
  const total = (dimensions.communication + dimensions.trust + dimensions.alignment + dimensions.decisionClarity) / 4;
  const categories = [
    { label: "Communication Clarity", value: dimensions.communication, emoji: "💬" },
    { label: "Trust Building", value: dimensions.trust, emoji: "🤝" },
    { label: "Alignment & Expectation", value: dimensions.alignment, emoji: "🎯" },
    { label: "Decision-Making Clarity", value: dimensions.decisionClarity, emoji: "🎓" },
  ];

  const getColor = (value: number) => {
    if (value >= 8) return "text-green-400";
    if (value >= 6) return "text-amber-400";
    if (value >= 4) return "text-orange-400";
    return "text-red-400";
  };

  const getBgColor = (value: number) => {
    if (value >= 8) return "bg-green-950";
    if (value >= 6) return "bg-amber-950";
    if (value >= 4) return "bg-orange-950";
    return "bg-red-950";
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Friction Score Breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-amber-400">{total.toFixed(1)}/10</div>
          <div className="text-sm text-slate-300">{total > 7 ? "⚠️ High friction" : total > 4 ? "🟡 Moderate friction" : "✅ Smooth interaction"}</div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">{cat.emoji} {cat.label}</span>
              <span className={`text-lg font-bold ${getColor(cat.value)}`}>{cat.value}/10</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBgColor(cat.value)} transition-all duration-500`}
                style={{ width: `${(cat.value / 10) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 h-5">
              {cat.label === "Communication Clarity" && cat.value < 6 && "Try: More pauses, clearer language"}
              {cat.label === "Trust Building" && cat.value < 6 && "Try: Share more context, be transparent"}
              {cat.label === "Alignment & Expectation" && cat.value < 6 && "Try: Confirm understanding explicitly"}
              {cat.label === "Decision-Making Clarity" && cat.value < 6 && "Try: Ask about approval process"}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold mb-3 text-amber-400">Key Insights</h4>
        <ul className="space-y-2 text-xs text-slate-300">
          <li>• Lowest score: {Math.min(...Object.values(dimensions)).toFixed(1)}/10 - Focus here for next call</li>
          <li>• Highest score: {Math.max(...Object.values(dimensions)).toFixed(1)}/10 - Keep leveraging this strength</li>
          <li>• Improvement potential: +{(10 - total).toFixed(1)} points by balancing all dimensions</li>
        </ul>
      </div>
    </div>
  );
}
