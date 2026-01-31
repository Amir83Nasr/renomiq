'use client';

import { I18nProvider as I18nProviderBase, Locale } from '@/lib/i18n/i18n';
import { ReactNode, useState, useEffect, useCallback } from 'react';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load language preference from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Locale | null;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fa')) {
      setLocaleState(savedLanguage);
    }
    setIsInitialized(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('language', newLocale);
  }, []);

  return (
    <I18nProviderBase locale={locale} setLocale={setLocale}>
      {children}
    </I18nProviderBase>
  );
}
