"use client";

import { useUiI18n } from "@/components/UiI18nProvider";

export default function LocaleSwitcher() {
  const { locale, setLocale, availableLocales, loading, t, source } = useUiI18n();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t("locale_label")}
      </label>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="bg-transparent text-sm text-white focus:outline-none"
      >
        {availableLocales.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-slate-500">
        {loading ? t("locale_loading") : source === "lingo" ? "Lingo.dev" : ""}
      </span>
    </div>
  );
}