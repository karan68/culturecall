import * as fs from "fs";
import * as path from "path";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import type { UiMessages, UiMessagesResponse } from "@/lib/ui-messages";
import { normalizeUiLocale, type UiLocale } from "@/lib/ui-locales";

const messageCache = new Map<UiLocale, Promise<UiMessagesResponse>>();

function resolveWorkspaceRoot(): string {
  const candidates = [process.cwd(), path.join(process.cwd(), "..", "..")];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "locales", "ui", "en.json"))) {
      return candidate;
    }
  }

  throw new Error("Unable to resolve workspace root for UI locale files.");
}

function readJsonFile(filePath: string): UiMessages {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as UiMessages;
}

function getUiLocalesDir(): string {
  return path.join(resolveWorkspaceRoot(), "locales", "ui");
}

function getSourceMessages(): UiMessages {
  return readJsonFile(path.join(getUiLocalesDir(), "en.json"));
}

function getStaticMessages(locale: UiLocale): UiMessages | null {
  const filePath = path.join(getUiLocalesDir(), `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readJsonFile(filePath);
}

function parseEnvFileValue(filePath: string, envKeys: string[]): string | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!envKeys.includes(key)) {
      continue;
    }

    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    return rawValue.replace(/^['\"]|['\"]$/g, "");
  }

  return undefined;
}

function getLingoApiKey(): string | undefined {
  const envKeys = ["LINGODOTDEV_API_KEY", "LINGO_API_KEY", "NEXT_PUBLIC_LINGO_API_KEY"];

  for (const key of envKeys) {
    if (process.env[key]) {
      return process.env[key];
    }
  }

  const workspaceRoot = resolveWorkspaceRoot();
  const envCandidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(workspaceRoot, ".env.local"),
    path.join(workspaceRoot, ".env"),
  ];

  for (const candidate of envCandidates) {
    const value = parseEnvFileValue(candidate, envKeys);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function sanitizeTranslatedMessages(input: Record<string, unknown>): UiMessages {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, typeof value === "string" ? value : String(value ?? "")])
  );
}

async function loadMessages(locale: UiLocale): Promise<UiMessagesResponse> {
  const sourceMessages = getSourceMessages();

  if (locale === "en") {
    return { locale, messages: sourceMessages, source: "source" };
  }

  const staticMessages = getStaticMessages(locale);
  if (staticMessages) {
    return { locale, messages: staticMessages, source: "static" };
  }

  const apiKey = getLingoApiKey();
  if (!apiKey) {
    console.warn(`[Lingo][UI] Missing API key. Falling back to English for ${locale}.`);
    return { locale, messages: sourceMessages, source: "fallback" };
  }

  try {
    const engine = new LingoDotDevEngine({ apiKey });
    const translated = await engine.localizeObject(sourceMessages, {
      sourceLocale: "en",
      targetLocale: locale,
      fast: true,
      filePath: "locales/ui/en.json",
    });

    return {
      locale,
      messages: sanitizeTranslatedMessages(translated),
      source: "lingo",
    };
  } catch (error) {
    console.warn(
      `[Lingo][UI] Translation failed for ${locale}. Falling back to English: ${error instanceof Error ? error.message : String(error)}`
    );
    return { locale, messages: sourceMessages, source: "fallback" };
  }
}

export async function getUiMessages(localeInput?: string | null): Promise<UiMessagesResponse> {
  const locale = normalizeUiLocale(localeInput);

  if (!messageCache.has(locale)) {
    messageCache.set(locale, loadMessages(locale));
  }

  return messageCache.get(locale)!;
}