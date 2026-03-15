"use client";

export interface CoachingCardProps {
  scenario: string;
  observations: Array<{
    pattern: string;
    risk: "high" | "medium" | "low";
    suggestion: string;
  }>;
}

export default function CoachingCard({ scenario, observations }: CoachingCardProps) {
  const scenarioContext = {
    sales: {
      title: "Sales Call Coaching",
      focus: "Closing techniques + relationship building",
      icon: "💼",
    },
    interviews: {
      title: "Interview Coaching",
      focus: "Candidate assessment + cultural fit",
      icon: "🎤",
    },
    meetings: {
      title: "Meeting Coaching",
      focus: "Decision-making + team alignment",
      icon: "📊",
    },
  };

  const context = scenarioContext[scenario as keyof typeof scenarioContext] || scenarioContext.sales;

  const riskIcon = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  };

  const riskColor = {
    high: "border-red-700 bg-red-950",
    medium: "border-amber-700 bg-amber-950",
    low: "border-green-700 bg-green-950",
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          {context.icon} {context.title}
        </h3>
        <p className="text-sm text-slate-300">{context.focus}</p>
      </div>

      <div className="space-y-4">
        {observations.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p>✅ No red flags detected. Great call!</p>
          </div>
        ) : (
          observations.map((obs, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${riskColor[obs.risk]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-1">{riskIcon[obs.risk]}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-100 mb-2">{obs.pattern}</h4>
                  <p className="text-sm text-slate-300 mb-3">{obs.suggestion}</p>
                  
                  {/* Action item */}
                  <div className="bg-slate-900 rounded p-3 text-xs text-slate-200">
                    <span className="font-semibold">💡 Next time: </span>
                    {obs.risk === "high" && "Address this immediately in follow-up communication"}
                    {obs.risk === "medium" && "Monitor in next conversation, be proactive"}
                    {obs.risk === "low" && "Continue leveraging this strength"}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="text-sm font-semibold mb-3 text-slate-100">Personalized Action Plan</h4>
        <ol className="space-y-2 text-sm text-slate-300">
          <li><span className="text-amber-400">1.</span> Review high-risk moments above</li>
          <li><span className="text-amber-400">2.</span> Practice suggested responses 2-3 times</li>
          <li><span className="text-amber-400">3.</span> Try the new approach in next call</li>
          <li><span className="text-amber-400">4.</span> Track friction score improvement</li>
        </ol>
      </div>
    </div>
  );
}
