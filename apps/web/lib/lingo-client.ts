import type { UiMessagesResponse } from "@/lib/ui-messages";
import { normalizeUiLocale, type UiLocale } from "@/lib/ui-locales";

const localeCache = new Map<UiLocale, UiMessagesResponse>();

export async function fetchLocalizedUiMessages(
  localeInput: string
): Promise<UiMessagesResponse> {
  const locale = normalizeUiLocale(localeInput);

  if (localeCache.has(locale)) {
    return localeCache.get(locale)!;
  }

  const response = await fetch(`/api/i18n?locale=${encodeURIComponent(locale)}`);
  if (!response.ok) {
    throw new Error(`Failed to load UI translations for ${locale}`);
  }

  const payload = (await response.json()) as UiMessagesResponse;
  localeCache.set(locale, payload);
  return payload;
}

export function primeLocalizedUiMessages(payload: UiMessagesResponse): void {
  localeCache.set(payload.locale, payload);
}
