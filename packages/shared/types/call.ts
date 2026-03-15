export interface TranscriptLine {
  timestamp: number;
  speaker: "rep" | "prospect";
  text: string;
  sourceLanguage: "en" | "ja" | "de" | "pt-br";
  originalText?: string;
}

export interface CulturalInsight {
  id: string;
  timestamp: number;
  speaker: "rep" | "prospect";
  severity: "low" | "medium" | "high";
  category: string;
  trigger?: string;
  observation: string;
  culturalFramework: string;
  suggestedResponse: string;
  repAction: "PAUSE" | "WAIT" | "ENGAGE" | "CONTINUE" | "PIVOT" | "DOCUMENT" | "VALUE" | "LISTEN" | "APPRECIATE" | "EXPLORE" | "CLARIFY" | "DECIDE" | "PRECISE" | "COMPLY" | "ROUTE" | "ORGANIZE" | "PRESENT";
  useCase: "sales" | "interviews" | "meetings";
}

export interface CallSession {
  id: string;
  scenario: "sales" | "interviews" | "meetings";
  repLanguage: "en" | "fr" | "de" | "pt-br" | "ja";
  prospectLanguage: "en" | "ja" | "de" | "pt-br";
  startedAt: Date;
  transcript: TranscriptLine[];
  insights: CulturalInsight[];
  status: "recording" | "analyzing" | "completed";
}

export interface Report {
  callId: string;
  duration: number;
  languagePair: string;
  frictionScore: number;
  highRiskMoments: CulturalInsight[];
  highTrustMoments: CulturalInsight[];
  coachingPoints: string[];
  alignmentOverTime: Array<{ timestamp: number; score: number }>;
}
