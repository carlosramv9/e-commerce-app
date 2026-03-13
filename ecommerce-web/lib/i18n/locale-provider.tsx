'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

export type Locale = 'es' | 'en';

const SUPPORTED_LOCALES: Locale[] = ['es', 'en'];
const DEFAULT_LOCALE: Locale = 'es';
const LOCALE_STORAGE_KEY = 'app-locale';

const messagesMap: Record<Locale, object> = {
  es: esMessages,
  en: enMessages,
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // 1. Prefer saved preference
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
    return saved as Locale;
  }

  // 2. Fall back to browser language
  const browserLangs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const lang of browserLangs) {
    const code = lang.split('-')[0] as Locale;
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }

  return DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesMap[locale]}
        timeZone="UTC"
        now={new Date()}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}
