"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  interpolateMessage,
  type UiMessages,
  type UiMessagesResponse,
} from "@/lib/ui-messages";
import { fetchLocalizedUiMessages, primeLocalizedUiMessages } from "@/lib/lingo-client";
import {
  normalizeUiLocale,
  UI_LOCALE_OPTIONS,
  type UiLocale,
} from "@/lib/ui-locales";

const UI_LOCALE_STORAGE_KEY = "culturecall.uiLocale";

interface UiI18nContextValue {
  locale: UiLocale;
  messages: UiMessages;
  loading: boolean;
  source: UiMessagesResponse["source"];
  availableLocales: typeof UI_LOCALE_OPTIONS;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const UiI18nContext = createContext<UiI18nContextValue | null>(null);

export function UiI18nProvider({
  children,
  initialPayload,
}: {
  children: React.ReactNode;
  initialPayload: UiMessagesResponse;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const savedLocaleApplied = useRef(false);

  const [locale, setLocaleState] = useState<UiLocale>(initialPayload.locale);
  const [messages, setMessages] = useState<UiMessages>(initialPayload.messages);
  const [source, setSource] = useState<UiMessagesResponse["source"]>(initialPayload.source);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    primeLocalizedUiMessages(initialPayload);
  }, [initialPayload]);

  useEffect(() => {
    const queryLocale = new URLSearchParams(window.location.search).get("uiLocale");
    if (queryLocale) {
      const normalized = normalizeUiLocale(queryLocale);
      if (normalized !== locale) {
        setLocaleState(normalized);
      }
      return;
    }

    if (savedLocaleApplied.current) {
      return;
    }

    savedLocaleApplied.current = true;
    const savedLocale = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (!savedLocale) {
      return;
    }

    const normalized = normalizeUiLocale(savedLocale);
    if (normalized !== locale) {
      setLocaleState(normalized);
    }
  }, [locale, pathname]);

  useEffect(() => {
    const controller = new AbortController();
    window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);

    if (locale === initialPayload.locale) {
      setMessages(initialPayload.messages);
      setSource(initialPayload.source);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    fetchLocalizedUiMessages(locale)
      .then((payload) => {
        if (controller.signal.aborted) {
          return;
        }

        setMessages(payload.messages);
        setSource(payload.source);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("[Lingo][UI] Failed to fetch UI translations:", error);
          setMessages(initialPayload.messages);
          setSource("fallback");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [initialPayload.locale, initialPayload.messages, initialPayload.source, locale]);

  const setLocale = (nextLocaleInput: string) => {
    const nextLocale = normalizeUiLocale(nextLocaleInput);
    setLocaleState(nextLocale);

    const params = new URLSearchParams(window.location.search);
    if (nextLocale === "en") {
      params.delete("uiLocale");
    } else {
      params.set("uiLocale", nextLocale);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const value = useMemo<UiI18nContextValue>(
    () => ({
      locale,
      messages,
      loading,
      source,
      availableLocales: UI_LOCALE_OPTIONS,
      setLocale,
      t: (key, params) => {
        const template = messages[key] || initialPayload.messages[key] || key;
        return interpolateMessage(template, params);
      },
    }),
    [initialPayload.messages, loading, locale, messages, source]
  );

  return <UiI18nContext.Provider value={value}>{children}</UiI18nContext.Provider>;
}

export function useUiI18n(): UiI18nContextValue {
  const context = useContext(UiI18nContext);
  if (!context) {
    throw new Error("useUiI18n must be used within UiI18nProvider");
  }

  return context;
}