// Cultural Glossary Viewer — key terms for each language pair
// Based on documented sociolinguistic and cross-cultural communication research

interface GlossaryTerm {
  term: string;
  reading?: string; // pronunciation/romanization
  meaning: string;
  example: string;
}

const GLOSSARIES: Record<string, { flag: string; label: string; terms: GlossaryTerm[] }> = {
  sales: {
    flag: "🇯🇵",
    label: "Japanese Business Culture",
    terms: [
      { term: "Nemawashi", reading: "根回し", meaning: "Quiet consensus-building before a visible decision. Never skip this step.", example: "Silence after your proposal likely means nemawashi is in progress." },
      { term: "Wa", reading: "和", meaning: "Group harmony. Disruptive directness threatens wa.", example: "Avoid public disagreement — it breaks wa and embarrasses everyone." },
      { term: "Tatemae", reading: "建前", meaning: "The public stance — what they say to preserve harmony. May differ from true feelings.", example: "'That's interesting' is often tatemae for 'we have concerns'." },
      { term: "Honne", reading: "本音", meaning: "True feelings and desires, rarely expressed directly in business.", example: "Honne emerges in informal settings, not formal meetings." },
      { term: "Keigo", reading: "敬語", meaning: "Honorific speech register. Required in enterprise B2B contexts.", example: "Always use -san suffix. Never switch to first names unprompted." },
      { term: "Ma", reading: "間", meaning: "Meaningful pause or silence. Not awkward — actively communicative.", example: "A 15–45 second silence = respectful consideration of your proposal." },
      { term: "Ringi", reading: "稟議", meaning: "Bottom-up approval process requiring sign-off from multiple stakeholders.", example: "'We need to consult our team' triggers the ringi process — allow weeks." },
    ],
  },
  interviews: {
    flag: "🇧🇷",
    label: "Brazilian Communication Culture",
    terms: [
      { term: "Jeitinho", meaning: "Creative flexibility; finding a way around obstacles with charm and resourcefulness.", example: "A candidate who mentions adapting processes creatively is displaying jeitinho." },
      { term: "Saudade", meaning: "Longing and warm nostalgia. Brazilians value human connection and relationship history.", example: "Mentioning past colleagues warmly signals high relational orientation." },
      { term: "Simpatia", meaning: "Warmth, friendliness, and social grace. A cultural expectation in professional settings.", example: "Starting with small talk is not wasting time — it's simpatia in action." },
      { term: "High-Context", meaning: "Stories and context carry the meaning, not just facts. Long answers are not rambling.", example: "A 5-minute STAR answer with a personal story = thorough Brazilian response." },
      { term: "Indirect No", meaning: "Brazilians rarely say no directly. Look for enthusiasm levels, not explicit confirmation.", example: "'That's an interesting option' may mean they prefer something else." },
      { term: "Relational Clock", meaning: "Relationships take priority over schedules. Personal connection = professional credibility.", example: "Asking about family or personal interests is normal and positive." },
    ],
  },
  meetings: {
    flag: "🇩🇪",
    label: "German Engineering Culture",
    terms: [
      { term: "Sachlichkeit", meaning: "Objectivity and fact-based reasoning. Personal feelings are separate from professional discussion.", example: "'According to what data?' is Sachlichkeit, not hostility." },
      { term: "Gründlichkeit", meaning: "Thoroughness and completeness. Germans expect specs to be complete before work begins.", example: "Incomplete PRDs will be challenged directly and repeatedly." },
      { term: "Direkte Kritik", meaning: "Direct criticism of ideas is professional respect, not personal attack.", example: "'That timeline is wrong' = 'I respect you enough to be honest'." },
      { term: "Pünktlichkeit", meaning: "Punctuality and time precision. Vague timelines signal lack of professionalism.", example: "'End of week' is ambiguous. Specify: 'Friday 17:00 CET'." },
      { term: "Präzision", meaning: "Precision in language. Approximations and vague claims will be challenged.", example: "'I think this is fast' → 'What is the specific benchmark?'" },
      { term: "Low-Context", meaning: "Meaning is in the words themselves. Say what you mean directly and completely.", example: "Hedging language ('perhaps', 'maybe') is often interpreted as uncertainty." },
      { term: "Technische Autorität", meaning: "Technical authority is earned through demonstrated expertise, not title or seniority.", example: "A junior engineer can overrule a senior PM on technical grounds." },
    ],
  },
};

export default function GlossaryViewer({ scenario }: { scenario: string }) {
  const data = GLOSSARIES[scenario];
  if (!data) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{data.flag}</span>
        <div>
          <div className="text-xs font-bold text-white">{data.label}</div>
          <div className="text-xs text-slate-500">Cultural glossary · {data.terms.length} terms</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {data.terms.map((term) => (
          <div
            key={term.term}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-bold text-sm text-amber-400">{term.term}</div>
              {term.reading && (
                <div className="text-xs text-slate-500 font-mono flex-shrink-0">{term.reading}</div>
              )}
            </div>
            <div className="text-xs text-slate-300 mb-1.5 leading-relaxed">{term.meaning}</div>
            <div className="text-xs text-slate-500 italic border-l-2 border-slate-600 pl-2">
              {term.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
