'use client';

import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export function DirectionHandler() {
  const { direction, language } = useAppContext();

  useEffect(() => {
    // Update HTML dir and lang attributes
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  return null;
}
