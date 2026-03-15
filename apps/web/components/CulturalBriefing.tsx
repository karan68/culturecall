// Pre-Call Cultural Briefing — static knowledge per scenario
// Shows before the first message in a chat room

interface BriefingData {
  flag: string;
  culturePair: string;
  framework: string;
  context: "high" | "low" | "mixed";
  facts: string[];
  avoid: string[];
  doThis: string[];
  watchFor: string;
}

const BRIEFINGS: Record<string, BriefingData> = {
  sales: {
    flag: "🇺🇸 → 🇯🇵",
    culturePair: "American × Japanese",
    framework: "Hall's High-Context Culture",
    context: "high",
    facts: [
      "Japanese business uses nemawashi — quiet consensus-building before visible decisions",
      "Silence is respectful consideration, not disengagement",
      "Direct rejection is almost never expressed verbally",
      "Written documentation is required alongside any verbal discussion",
    ],
    avoid: [
      "Pushing for immediate commitment or a yes/no answer",
      "Insisting on first-name informality",
      "Filling silences — let them breathe (15–90 seconds is normal)",
      "Using deadline pressure or urgency language",
    ],
    doThis: [
      "Send a detailed written proposal after verbal discussion",
      "Ask about their team's perspective, not their personal opinion",
      "Allow multiple follow-up meetings before closing",
      "Use formal address (Tanaka-san) throughout",
    ],
    watchFor: "Phrases like 'very interesting', 'we need to consult', 'that presents challenges' — these are polite rejections.",
  },
  interviews: {
    flag: "🇺🇸 → 🇧🇷",
    culturePair: "American × Brazilian",
    framework: "Hall's High-Context + Relational Culture",
    context: "mixed",
    facts: [
      "Brazilians prioritize relationship and warmth before business content",
      "Communication is narrative and story-driven — STAR format feels unnatural",
      "Personal disclosure is expected and valued, not oversharing",
      "Enthusiasm and emotion signal authenticity, not unprofessionalism",
    ],
    avoid: [
      "Jumping straight to structured interview questions without rapport",
      "Cutting off stories to 'get to the point'",
      "Misreading warmth as lack of professionalism",
      "Silence as a pressure tactic",
    ],
    doThis: [
      "Start with genuine small talk — it's not wasted time",
      "Welcome personal anecdotes and narrative answers",
      "Show emotional reciprocity — engage with their stories",
      "Frame questions as collaborative exploration, not interrogation",
    ],
    watchFor: "Candidate asking 'how are you?' before answering = relationship-first orientation. Positive signal.",
  },
  meetings: {
    flag: "🇺🇸 → 🇩🇪",
    culturePair: "American × German",
    framework: "Hofstede: Low Uncertainty Avoidance + Low-Context",
    context: "low",
    facts: [
      "German communication is direct, fact-based, and specification-driven",
      "Criticism of ideas is not personal — it is expected and respected",
      "Meetings require complete written specs before decisions can be made",
      "Punctuality and structure signal respect; casual openers can feel disrespectful",
    ],
    avoid: [
      "Vague timelines or unspecified requirements",
      "Treating directness as hostility — it is precision",
      "Asking for emotional buy-in ('how do you feel about this?')",
      "Over-enthusiastic openers that lack substance",
    ],
    doThis: [
      "Come with data, specs, and written documentation",
      "Welcome direct pushback — ask follow-up questions",
      "Be precise about timelines. 'End of week' ≠ 'Friday at 5pm'",
      "Acknowledge critique constructively ('good catch, let me fix that')",
    ],
    watchFor: "'According to what data?' = healthy skepticism, not hostility. Respond with evidence, not reassurance.",
  },
};

const CONTEXT_BADGE: Record<string, { label: string; color: string; desc: string }> = {
  high: { label: "High-Context", color: "bg-purple-500/20 text-purple-300 border-purple-500/40", desc: "Meaning is in context, relationship, silence — not just words" },
  low: { label: "Low-Context", color: "bg-blue-500/20 text-blue-300 border-blue-500/40", desc: "Meaning is explicit, direct, verbal — words say exactly what they mean" },
  mixed: { label: "Mixed-Context", color: "bg-amber-500/20 text-amber-300 border-amber-500/40", desc: "Blend of direct content with relationship-first approach" },
};

export default function CulturalBriefing({ scenario, onDismiss }: { scenario: string; onDismiss: () => void }) {
  const data = BRIEFINGS[scenario];
  if (!data) return null;
  const ctx = CONTEXT_BADGE[data.context];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <div className="text-2xl">{data.flag}</div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${ctx.color}`}>
              {ctx.label}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">Pre-Call Cultural Briefing</h2>
          <p className="text-xs text-slate-400 mt-0.5">{data.culturePair} · {data.framework}</p>
          <p className="text-xs text-slate-500 mt-1 italic">"{ctx.desc}"</p>
        </div>

        {/* Content — scrollable */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
          {/* Cultural Facts */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Cultural Facts</div>
            <ul className="space-y-1.5">
              {data.facts.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 flex-shrink-0">•</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Avoid */}
          <div>
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">⚠️ Avoid</div>
            <ul className="space-y-1.5">
              {data.avoid.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-red-400 flex-shrink-0">✗</span>{a}
                </li>
              ))}
            </ul>
          </div>

          {/* Do This */}
          <div>
            <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">✅ Do This</div>
            <ul className="space-y-1.5">
              {data.doThis.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-green-400 flex-shrink-0">✓</span>{d}
                </li>
              ))}
            </ul>
          </div>

          {/* Watch For */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="text-xs font-bold text-amber-400 mb-1">👁 Watch For</div>
            <p className="text-sm text-slate-300">{data.watchFor}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/60">
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            Got it — Start Chat →
          </button>
        </div>
      </div>
    </div>
  );
}
