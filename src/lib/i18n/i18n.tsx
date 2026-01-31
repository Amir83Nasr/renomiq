/**
 * i18n Context and Hooks
 * Internationalization with Persian number support
 */

'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import en from './locales/en';
import fa from './locales/fa';
import { toPersianNumber } from '@/lib/utils/persian-numbers';

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

// Regex to match numbers in text
const numberRegex = /\d+/g;

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  formatNumber: (num: number | string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function I18nProvider({ children, locale, setLocale }: I18nProviderProps) {
  const formatNumber = useCallback(
    (num: number | string): string => {
      if (locale === 'fa') {
        return toPersianNumber(num);
      }
      return String(num);
    },
    [locale]
  );

  const t = useCallback(
    (key: string): string => {
      const value = getNestedValue(locales[locale] as Record<string, unknown>, key);
      if (!value) return key;

      // Convert numbers to Persian if locale is fa
      if (locale === 'fa') {
        return value.replace(numberRegex, (match) => toPersianNumber(match));
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, formatNumber, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
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

export function useFormatNumber() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useFormatNumber must be used within an I18nProvider');
  }
  return context.formatNumber;
}
