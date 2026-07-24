// src/hooks/useTheme.ts (упрощаем до двух режимов)
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/**
 * Hook for managing theme preferences.
 * Works both inside and outside Telegram.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme-preference') as Theme | null;
    // Check system preference if no stored value
    if (!stored) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return stored || 'dark';
  });

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      if (theme === 'light') {
        root.style.setProperty('--color-bg', '#f5f7fa');
        root.style.setProperty('--color-surface', '#ffffff');
        root.style.setProperty('--color-surface-raised', '#f0f2f5');
        root.style.setProperty('--color-border', 'rgba(0, 0, 0, 0.08)');
        root.style.setProperty('--color-text-primary', '#1a2530');
        root.style.setProperty('--color-text-secondary', '#5a6a7a');
        root.style.setProperty('color-scheme', 'light');
      } else {
        root.style.setProperty('--color-bg', '#0f1720');
        root.style.setProperty('--color-surface', '#1a2530');
        root.style.setProperty('--color-surface-raised', '#212d3a');
        root.style.setProperty('--color-border', 'rgba(237, 242, 244, 0.08)');
        root.style.setProperty('--color-text-primary', '#edf2f4');
        root.style.setProperty('--color-text-secondary', '#a8b3bd');
        root.style.setProperty('color-scheme', 'dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  return { theme, setTheme };
}