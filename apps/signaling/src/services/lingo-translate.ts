import { LingoDotDevEngine } from "lingo.dev/sdk";

let engine: LingoDotDevEngine | null = null;

/** Scenario → language pair mapping */
const SCENARIO_LANGS: Record<string, { rep: string; prospect: string }> = {
  sales: { rep: "en", prospect: "ja" },
  interviews: { rep: "en", prospect: "pt-BR" },
  meetings: { rep: "en", prospect: "de" },
};

export function getScenarioLangs(scenario: string) {
  return SCENARIO_LANGS[scenario] || { rep: "en", prospect: "en" };
}

export function initLingoTranslation(): boolean {
  const apiKey = process.env.LINGODOTDEV_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  LINGODOTDEV_API_KEY not set — live translation disabled");
    return false;
  }

  engine = new LingoDotDevEngine({ apiKey });
  console.log("✓ Lingo.dev translation engine ready");
  return true;
}

export function isTranslationAvailable(): boolean {
  return engine !== null;
}

/**
 * Translate a chat message for the other participant.
 * Rep writes in English → prospect sees it in their language (and vice-versa).
 */
export async function translateMessage(
  text: string,
  senderRole: "rep" | "prospect",
  scenario: string,
): Promise<{ translatedText: string; detectedLocale: string | null } | null> {
  if (!engine) return null;

  const langs = getScenarioLangs(scenario);

  // Detect what language the sender actually used
  let detectedLocale: string | null = null;
  try {
    detectedLocale = await engine.recognizeLocale(text);
  } catch {
    // Detection failed — fall back to expected language
    detectedLocale = senderRole === "rep" ? langs.rep : langs.prospect;
  }

  // Translate into the OTHER participant's language
  const targetLocale = senderRole === "rep" ? langs.prospect : langs.rep;
  const sourceLocale = detectedLocale || (senderRole === "rep" ? langs.rep : langs.prospect);

  // Skip translation if source and target are the same
  if (sourceLocale === targetLocale) return null;

  try {
    const translatedText = await engine.localizeText(text, {
      sourceLocale,
      targetLocale,
    });
    return { translatedText, detectedLocale };
  } catch (err) {
    console.error("Translation error:", err);
    return null;
  }
}

/**
 * Translate cultural coaching insight into the participant's preferred language.
 * This makes insights accessible to non-English speakers.
 */
export async function translateInsight(
  insight: { observation: string; culturalFramework: string; suggestedResponse: string },
  targetLocale: string,
): Promise<{ observation: string; culturalFramework: string; suggestedResponse: string } | null> {
  if (!engine || targetLocale === "en") return null;

  try {
    const translated = await engine.localizeObject(
      {
        observation: insight.observation,
        culturalFramework: insight.culturalFramework,
        suggestedResponse: insight.suggestedResponse,
      },
      { sourceLocale: "en", targetLocale },
    );
    return translated as typeof insight;
  } catch (err) {
    console.error("Insight translation error:", err);
    return null;
  }
}

/**
 * Translate the full chat transcript into a bilingual version for reports.
 * Each message gets paired with its translation.
 */
export async function translateTranscriptForReport(
  messages: Array<{ name: string; text: string; role: "rep" | "prospect" }>,
  scenario: string,
): Promise<Array<{ name: string; text: string; role: "rep" | "prospect"; translatedText?: string }>> {
  if (!engine || messages.length === 0) return messages;

  const langs = getScenarioLangs(scenario);

  // Translate rep messages → prospect language, prospect messages → rep language
  const result = await Promise.all(
    messages.map(async (msg) => {
      const targetLocale = msg.role === "rep" ? langs.prospect : langs.rep;
      const sourceLocale = msg.role === "rep" ? langs.rep : langs.prospect;

      if (sourceLocale === targetLocale) return msg;

      try {
        const translatedText = await engine!.localizeText(msg.text, {
          sourceLocale,
          targetLocale,
        });
        return { ...msg, translatedText };
      } catch {
        return msg;
      }
    }),
  );

  return result;
}
