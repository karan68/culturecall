import { LingoDotDevEngine } from "lingo.dev/sdk";

let lingoEngine: LingoDotDevEngine | null = null;

function getEngine(): LingoDotDevEngine | null {
  if (lingoEngine) return lingoEngine;

  const apiKey =
    process.env.LINGODOTDEV_API_KEY ||
    process.env.LINGO_API_KEY;

  if (!apiKey) {
    console.warn("⚠️  No Lingo.dev API key — translation features disabled");
    return null;
  }

  lingoEngine = new LingoDotDevEngine({ apiKey });
  console.log("✓ Lingo.dev translation engine initialized");
  return lingoEngine;
}

/**
 * Detect the language of incoming text.
 * Returns a locale code like "en", "ja", "de", "pt" etc.
 */
export async function detectLanguage(text: string): Promise<string | null> {
  const engine = getEngine();
  if (!engine || text.trim().length < 3) return null;

  try {
    const locale = await engine.recognizeLocale(text);
    return locale;
  } catch (err) {
    console.warn("Lingo locale detection failed:", (err as Error).message);
    return null;
  }
}

/**
 * Translate a single message text from one locale to another.
 * Returns null if translation is unavailable.
 */
export async function translateMessage(
  text: string,
  sourceLocale: string,
  targetLocale: string
): Promise<string | null> {
  if (sourceLocale === targetLocale) return null;

  const engine = getEngine();
  if (!engine) return null;

  try {
    return await engine.localizeText(text, {
      sourceLocale,
      targetLocale,
      fast: true,
    });
  } catch (err) {
    console.warn("Lingo text translation failed:", (err as Error).message);
    return null;
  }
}

/**
 * Translate insight coaching fields to a target locale.
 * Returns the translated fields, or null if unavailable.
 */
export async function translateInsight(
  insight: {
    observation: string;
    culturalFramework: string;
    suggestedResponse: string;
  },
  targetLocale: string
): Promise<{
  observation: string;
  culturalFramework: string;
  suggestedResponse: string;
} | null> {
  if (targetLocale === "en") return null; // Source content is English

  const engine = getEngine();
  if (!engine) return null;

  try {
    const translated = await engine.localizeObject(
      {
        observation: insight.observation,
        culturalFramework: insight.culturalFramework,
        suggestedResponse: insight.suggestedResponse,
      },
      {
        sourceLocale: "en",
        targetLocale,
        fast: true,
      }
    );

    return {
      observation: String(translated.observation || insight.observation),
      culturalFramework: String(translated.culturalFramework || insight.culturalFramework),
      suggestedResponse: String(translated.suggestedResponse || insight.suggestedResponse),
    };
  } catch (err) {
    console.warn("Lingo insight translation failed:", (err as Error).message);
    return null;
  }
}

/**
 * Translate a full chat transcript for bilingual report generation.
 * Returns array with original + translated text for each message.
 */
export async function translateTranscript(
  messages: Array<{ name: string; text: string }>,
  sourceLocale: string,
  targetLocale: string
): Promise<Array<{ name: string; text: string }> | null> {
  if (sourceLocale === targetLocale || messages.length === 0) return null;

  const engine = getEngine();
  if (!engine) return null;

  try {
    return await engine.localizeChat(messages, {
      sourceLocale,
      targetLocale,
      fast: true,
    });
  } catch (err) {
    console.warn("Lingo transcript translation failed:", (err as Error).message);
    return null;
  }
}
