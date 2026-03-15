import type { UiLocale } from "@/lib/ui-locales";

export type UiMessages = Record<string, string>;

export interface UiMessagesResponse {
  locale: UiLocale;
  messages: UiMessages;
  source: "source" | "static" | "lingo" | "fallback";
}

export function interpolateMessage(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    const value = params[key];
    return value === undefined ? "" : String(value);
  });
}