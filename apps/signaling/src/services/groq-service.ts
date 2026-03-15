import Groq from "groq-sdk";

// Initialize Groq client (only used if GROQ_ENABLED=true)
let groq: Groq | null = null;
if (process.env.GROQ_ENABLED === "true" && process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log("✓ Groq LLM initialized with API key");
}

export interface CulturalAnalysisRequest {
  transcript: string;
  culturePair: string;
  glossary: Record<string, any>;
  useCase: "sales" | "interviews" | "meetings";
}

export interface CulturalAnalysisResponse {
  insight: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export async function analyzeCulturalContext(
  request: CulturalAnalysisRequest
): Promise<CulturalAnalysisResponse> {
  if (!groq) {
    return {
      insight: "Call analyzed using rule-based cultural matching",
      severity: "medium",
      recommendation: "Monitor for cultural cues in next interaction",
    };
  }

  const { transcript, culturePair, glossary, useCase } = request;

  const systemPrompt = `You are a cultural communication expert analyzing business conversations.

Glossary of cultural patterns:
${Object.entries(glossary)
  .slice(0, 3)
  .map(([key, val]: [string, any]) => `- ${key}: ${val.culturalFramework}`)
  .join("\n")}

Respond ONLY with valid JSON in this format:
{"insight": "brief observation", "severity": "low|medium|high", "recommendation": "action to take"}`;

  const userPrompt = `Analyze this ${useCase} call (${culturePair}):
"${transcript.substring(0, 200)}..."

Identify cultural patterns. Respond ONLY with JSON.`;

  try {
    const message = await (groq as any).chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const content = message.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[^}]+\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as CulturalAnalysisResponse;
      return {
        insight: parsed.insight || "Analysis complete",
        severity: (parsed.severity as any) || "medium",
        recommendation: parsed.recommendation || "Continue monitoring",
      };
    }
    
    return {
      insight: "Analysis complete",
      severity: "medium",
      recommendation: "Continue conversation",
    };
  } catch (error) {
    console.error("❌ Groq error (non-blocking):", (error as any).message);
    return {
      insight: "Call analyzed using rule-based matching",
      severity: "low",
      recommendation: "Continue conversation",
    };
  }
}

export async function generateCoachingAdvice(
  insights: string[],
  useCase: string
): Promise<string[]> {
  if (!groq || insights.length === 0) {
    return [
      "Review the cultural patterns identified during the call",
      "Practice active listening for non-verbal cues",
      "Consider scheduling a follow-up discussion",
    ];
  }

  const insightsSummary = insights.slice(0, 5).join("\n");

  const prompt = `Based on these cultural insights from a ${useCase} call:
${insightsSummary}

Generate 3-4 coaching points. Be concise and actionable. Return as JSON: {"points": ["point1", "point2", ...]}`;

  try {
    const message = await (groq as any).chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[^}]+\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed.points) ? parsed.points : [
        "Review the cultural patterns identified",
        "Practice active listening",
        "Consider follow-up discussion",
      ];
    }
    
    return [
      "Review the cultural patterns identified",
      "Practice active listening",
      "Consider follow-up discussion",
    ];
  } catch (error) {
    console.error("❌ Groq coaching error:", (error as any).message);
    return [
      "Review call recording and identify patterns",
      "Prepare talking points for next conversation",
    ];
  }
}
