// Linguistic analysis utilities — all computed client-side from message arrays
// Grounded in: Hofstede's dimensions, Hall's context theory, Brown & Levinson politeness theory

export interface ChatMessage {
  id: string;
  senderId: string;
  role: "rep" | "prospect";
  text: string;
  timestamp: number;
}

export interface ChatInsight {
  id: string;
  severity: "low" | "medium" | "high";
  source?: string;
}

// ── Formality Scoring ──────────────────────────────────────────────────────
// Returns 0 (slang) → 100 (highly formal)

const FORMAL_MARKERS = [
  /\b(would|could|may i|shall|regarding|pursuant|appreciate|kindly|accordingly|herewith)\b/i,
  /\b(i am writing|please find|i hope this|on behalf|sincerely|respectfully|dear)\b/i,
  /\b(furthermore|however|therefore|nevertheless|notwithstanding|whilst)\b/i,
];

const INFORMAL_MARKERS = [
  /\b(hey|yeah|yep|nope|gonna|wanna|gotta|kinda|sorta|dunno|tbh|fyi|asap|btw)\b/i,
  /\b(awesome|cool|great|super|totally|literally|basically|honestly|like)\b/i,
  /!{2,}|lol|haha|omg|\bwow\b/i,
];

export function scoreFormalityLevel(text: string): number {
  if (!text) return 50;
  let score = 50;
  for (const r of FORMAL_MARKERS) if (r.test(text)) score += 15;
  for (const r of INFORMAL_MARKERS) if (r.test(text)) score -= 12;
  // Word length proxy (longer avg word = more formal)
  const words = text.split(/\s+/).filter(Boolean);
  const avgLen = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);
  if (avgLen > 5.5) score += 8;
  if (avgLen < 4) score -= 8;
  // Sentence completeness
  if (/[.!?]$/.test(text.trim())) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function getFormalityLabel(score: number): { label: string; color: string } {
  if (score >= 75) return { label: "Highly Formal", color: "text-green-400" };
  if (score >= 55) return { label: "Formal", color: "text-emerald-400" };
  if (score >= 40) return { label: "Neutral", color: "text-amber-400" };
  if (score >= 25) return { label: "Informal", color: "text-orange-400" };
  return { label: "Too Casual", color: "text-red-400" };
}

// ── Directness Scoring ─────────────────────────────────────────────────────
// Returns 0 (very indirect) → 100 (very direct)

const DIRECT_MARKERS = [
  /\b(you (must|need to|have to|should)|i (want|need|require|demand|expect))\b/i,
  /\b(do this|tell me|give me|explain|answer|decide|confirm|sign)\b/i,
  /\b(yes|no|correct|incorrect|wrong|right|exactly|precisely)\b/i,
];

const INDIRECT_MARKERS = [
  /\b(perhaps|maybe|might|possibly|could|i wonder|i think|it seems|potentially)\b/i,
  /\b(if you (don't mind|have a moment)|when (you have time|convenient)|no rush)\b/i,
  /\b(we would need to|we should consider|it would be helpful)\b/i,
];

export function scoreDirectness(text: string): number {
  if (!text) return 50;
  let score = 50;
  for (const r of DIRECT_MARKERS) if (r.test(text)) score += 18;
  for (const r of INDIRECT_MARKERS) if (r.test(text)) score -= 15;
  // Short messages tend to be more direct
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 10) score += 8;
  if (wordCount > 30) score -= 8;
  return Math.max(0, Math.min(100, score));
}

// ── Face-Saving Score ──────────────────────────────────────────────────────
// Higher = more face-preserving language

const FACE_SAVING_MARKERS = [
  /\b(i understand|i appreciate|great (point|question|perspective)|thank you for( sharing)?)\b/i,
  /\b(from your perspective|how does that (sound|work) for you|what do you think)\b/i,
  /\b(absolutely|of course|certainly|please|kindly|happy to)\b/i,
  /\b(together|we could|let's|our (team|goal|approach))\b/i,
];

const FACE_THREATENING_MARKERS = [
  /\b(you're wrong|that's incorrect|no that's|obviously|you (must|have to|need to))\b/i,
  /\b(deadline|asap|right now|immediately|by (friday|today|tomorrow|end of day))\b/i,
  /\b(i disagree|that doesn't make sense|not correct|mistake)\b/i,
];

export function scoreFaceSaving(text: string): number {
  if (!text) return 50;
  let score = 50;
  for (const r of FACE_SAVING_MARKERS) if (r.test(text)) score += 15;
  for (const r of FACE_THREATENING_MARKERS) if (r.test(text)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

// ── Conversation Health Score ──────────────────────────────────────────────

export interface HealthScore {
  overall: number;
  trust: number;
  communicationFit: number;
  engagement: number;
  riskLevel: "low" | "medium" | "high";
  trend: "improving" | "stable" | "declining";
}

export function computeHealthScore(
  messages: ChatMessage[],
  insights: ChatInsight[]
): HealthScore {
  if (messages.length === 0) {
    return { overall: 75, trust: 75, communicationFit: 75, engagement: 75, riskLevel: "low", trend: "stable" };
  }

  const highInsights = insights.filter((i) => i.severity === "high").length;
  const medInsights = insights.filter((i) => i.severity === "medium").length;
  const ftaCount = insights.filter((i) => i.source === "politeness").length;

  // Trust: starts 80, decreases per FTA/high severity insight
  const trust = Math.max(10, Math.min(100, 80 - ftaCount * 12 - highInsights * 8 + messages.length * 1.5));

  // Communication fit: ratio of messages without face threats
  const badMessages = insights.length;
  const commFit = Math.max(20, Math.min(100, 90 - (badMessages / Math.max(messages.length, 1)) * 60));

  // Engagement: message volume proxy
  const engagement = Math.min(100, 40 + messages.length * 5);

  const overall = Math.round((trust * 0.4 + commFit * 0.4 + engagement * 0.2));

  // Trend: compare first half vs second half
  let trend: "improving" | "stable" | "declining" = "stable";
  if (messages.length >= 6) {
    const midpoint = Math.floor(messages.length / 2);
    const firstHalfInsights = insights.filter((ins) => {
      const msgIdx = messages.findIndex((m) => m.id === (ins as any).messageId);
      return msgIdx >= 0 && msgIdx < midpoint;
    }).length;
    const secondHalfInsights = insights.length - firstHalfInsights;
    if (secondHalfInsights < firstHalfInsights) trend = "improving";
    else if (secondHalfInsights > firstHalfInsights + 1) trend = "declining";
  }

  const riskLevel: "low" | "medium" | "high" = overall >= 70 ? "low" : overall >= 45 ? "medium" : "high";

  return { overall, trust, communicationFit: Math.round(commFit), engagement: Math.round(engagement), riskLevel, trend };
}

// ── Linguistic DNA ─────────────────────────────────────────────────────────

export interface LinguisticDNA {
  directness: number;
  formality: number;
  faceSaving: number;
  talkRatio: number; // % of messages by rep
  avgMessageLength: number;
  totalMessages: number;
  formalityLabel: string;
  directnessLabel: string;
  gaps: string[];
  strengths: string[];
  scenario: string;
}

const SCENARIO_TARGETS: Record<string, { formality: number; directness: number; faceSaving: number }> = {
  sales: { formality: 70, directness: 30, faceSaving: 75 },      // JA: formal, indirect, face-preserving
  interviews: { formality: 55, directness: 50, faceSaving: 65 }, // PT-BR: moderate, story-driven
  meetings: { formality: 65, directness: 75, faceSaving: 50 },   // DE: formal, very direct, fact-based
};

export function computeLinguisticDNA(
  messages: ChatMessage[],
  insights: ChatInsight[]
): LinguisticDNA {
  const repMessages = messages.filter((m) => m.role === "rep");
  const allText = messages.map((m) => m.text).join(" ");
  const repText = repMessages.map((m) => m.text).join(" ");

  const directness = repMessages.length ? Math.round(repMessages.reduce((s, m) => s + scoreDirectness(m.text), 0) / repMessages.length) : 50;
  const formality = repMessages.length ? Math.round(repMessages.reduce((s, m) => s + scoreFormalityLevel(m.text), 0) / repMessages.length) : 50;
  const faceSaving = repMessages.length ? Math.round(repMessages.reduce((s, m) => s + scoreFaceSaving(m.text), 0) / repMessages.length) : 50;
  const talkRatio = messages.length ? Math.round((repMessages.length / messages.length) * 100) : 50;
  const avgMessageLength = messages.length
    ? Math.round(messages.reduce((s, m) => s + m.text.split(/\s+/).length, 0) / messages.length)
    : 0;

  const formalityLabel = getFormalityLabel(formality).label;
  const directnessLabel = directness >= 65 ? "Very Direct" : directness >= 45 ? "Balanced" : "Indirect";

  const gaps: string[] = [];
  const strengths: string[] = [];

  const ftaCount = insights.filter((i) => i.source === "politeness").length;
  if (ftaCount > 0) gaps.push(`${ftaCount} face-threatening act${ftaCount > 1 ? "s" : ""} detected (Brown & Levinson)`);
  if (formality < 50) gaps.push("Formality too low for this cultural context");
  if (talkRatio > 65) gaps.push("You're talking more than listening (65%+ rep messages)");
  if (directness > 70 && formality < 60) gaps.push("High directness + low formality is risky in this culture");

  if (faceSaving >= 65) strengths.push("Good face-preserving language throughout");
  if (formality >= 55) strengths.push("Appropriate formality level for this context");
  if (talkRatio >= 40 && talkRatio <= 60) strengths.push("Balanced conversation ratio");
  if (ftaCount === 0) strengths.push("No face-threatening acts detected");
  if (avgMessageLength >= 10 && avgMessageLength <= 30) strengths.push("Concise, well-paced messages");

  return {
    directness, formality, faceSaving, talkRatio,
    avgMessageLength, totalMessages: messages.length,
    formalityLabel, directnessLabel,
    gaps, strengths, scenario: "",
  };
}
