import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { LingoDotDevEngine } from "lingo.dev/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GlossaryEntry {
  trigger?: string | string[];
  observation: string;
  culturalFramework: string;
  tacticResponse: string;
  severity: "low" | "medium" | "high";
  repAction: string;
  useCase: string;
}

type Glossary = Record<string, GlossaryEntry>;

let glossaryCache: Record<string, Glossary> = {};
let lingoClient: LingoDotDevEngine | null = null;
let lingoInitialized = false;

async function initializeLingo(): Promise<void> {
  if (lingoInitialized) return;

  const apiKey = process.env.LINGODOTDEV_API_KEY;
  
  if (!apiKey) {
    console.warn(
      "⚠️  LINGODOTDEV_API_KEY not set, using local glossaries only"
    );
    lingoInitialized = true;
    return;
  }

  try {
    lingoClient = new LingoDotDevEngine({
      apiKey: apiKey,
    });

    // Validate API key by attempting a simple operation
    const user = await lingoClient?.whoami?.();
    if (user) {
      console.log(`✓ Lingo.dev SDK initialized successfully`);
      console.log(`  Account: ${JSON.stringify(user).substring(0, 50)}...`);
    } else {
      console.warn(
        "⚠️  Lingo.dev authentication failed, falling back to local glossaries"
      );
      lingoClient = null;
    }
  } catch (error) {
    console.warn(
      `⚠️  Lingo.dev initialization error: ${error instanceof Error ? error.message : String(error)}`
    );
    console.warn("   Falling back to local glossaries");
    lingoClient = null;
  }

  lingoInitialized = true;
}

export async function loadGlossaries(): Promise<void> {
  // Initialize Lingo SDK first (non-blocking)
  await initializeLingo();

  const culturalDir = path.join(
    __dirname,
    "../../../../",
    "locales",
    "cultural"
  );

  // Load all JSON glossary files
  const files = fs
    .readdirSync(culturalDir)
    .filter(
      (f) =>
        f.startsWith("en-") && f.endsWith(".json") && f !== "reference-data.json"
    );

  for (const file of files) {
    const key = file.replace("en-", "").replace(".json", "");
    const filePath = path.join(culturalDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    glossaryCache[key] = JSON.parse(content);
  }

  console.log(
    `✓ Loaded ${Object.keys(glossaryCache).length} glossary files [ ${Object.keys(glossaryCache).join(", ")} ]`
  );
}

export function getGlossary(
  useCase: string,
  targetLanguage?: string
): Glossary {
  // Map use cases to glossary files
  const glossaryKey = useCase.toLowerCase(); // e.g., "sales", "interviews", "meetings"

  if (!glossaryCache[glossaryKey]) {
    console.warn(`Glossary not found for ${glossaryKey}, returning empty`);
    return {};
  }

  return glossaryCache[glossaryKey];
}

export function getGlossaryAsReference(): Record<string, string> {
  const referenceDir = path.join(process.cwd(), "locales", "cultural");
  const referenceFile = path.join(referenceDir, "reference-data.json");

  if (fs.existsSync(referenceFile)) {
    const content = fs.readFileSync(referenceFile, "utf-8");
    const data = JSON.parse(content);
    return data.glossary_mappings || data;
  }

  return {};
}

export function getAllGlossaries(): Record<string, Glossary> {
  return glossaryCache;
}

export function searchGlossary(
  text: string,
  glossary: Glossary
): GlossaryEntry | null {
  const lowerText = text.toLowerCase();

  for (const [_key, entry] of Object.entries(glossary)) {
    if (!entry.trigger) continue;

    const triggers = Array.isArray(entry.trigger)
      ? entry.trigger
      : [entry.trigger];

    for (const trigger of triggers) {
      if (lowerText.includes(trigger.toLowerCase())) {
        return entry;
      }
    }
  }

  return null;
}
