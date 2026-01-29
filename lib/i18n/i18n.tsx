'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import en from './locales/en';
import fa from './locales/fa';

export type Locale = 'en' | 'fa';

const locales = {
  en,
  fa,
} as const;

export type Translations = typeof en;

// Helper to get nested values from translation object
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function I18nProvider({ children, locale, setLocale }: I18nProviderProps) {
  const t = useCallback(
    (key: string): string => {
      const value = getNestedValue(locales[locale] as Record<string, unknown>, key);
      return value ?? key;
    },
    [locale]
  );

  return <I18nContext.Provider value={{ locale, t, setLocale }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context.t;
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider');
  }
  return { locale: context.locale, setLocale: context.setLocale };
}
