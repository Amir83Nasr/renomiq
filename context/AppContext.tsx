'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { useLocale, Locale } from '@/lib/i18n/i18n';

type Theme = 'light' | 'dark' | 'system';
type Language = Locale;

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  direction: 'ltr' | 'rtl';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppWrapper({ children }: { children: ReactNode }) {
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update direction based on language
    setDirection(locale === 'fa' ? 'rtl' : 'ltr');

    // Update font class on body based on language
    const body = document.body;
    if (locale === 'fa') {
      body.classList.remove('font-english');
      body.classList.add('font-persian');
    } else {
      body.classList.remove('font-persian');
      body.classList.add('font-english');
    }
  }, [locale]);

  const setTheme = (theme: Theme) => {
    setNextTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const contextValue = {
    theme: currentTheme as Theme,
    setTheme,
    language: locale,
    setLanguage: setLocale,
    direction,
  };

  if (!mounted) {
    // Return empty div to prevent hydration mismatch
    return <div />;
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppWrapper');
  }
  return context;
}
