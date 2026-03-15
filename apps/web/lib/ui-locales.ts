export const SUPPORTED_UI_LOCALES = ["en", "ja", "de", "pt-br", "fr"] as const;

export type UiLocale = (typeof SUPPORTED_UI_LOCALES)[number];

export const UI_LOCALE_OPTIONS: Array<{ value: UiLocale; label: string }> = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "de", label: "Deutsch" },
  { value: "pt-br", label: "Português (Brasil)" },
  { value: "fr", label: "Français" },
];

const uiLocaleSet = new Set<string>(SUPPORTED_UI_LOCALES);

export function normalizeUiLocale(locale?: string | null): UiLocale {
  if (!locale) {
    return "en";
  }

  const normalized = locale.toLowerCase();
  if (normalized === "pt" || normalized === "pt_br") {
    return "pt-br";
  }

  return uiLocaleSet.has(normalized) ? (normalized as UiLocale) : "en";
}