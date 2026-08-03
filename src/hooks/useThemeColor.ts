import { useState, useEffect } from 'react';

const COLORS = [
  { name: 'Бирюзовый', value: '#7DD8C8' },
  { name: 'Синий', value: '#4A90D9' },
  { name: 'Зелёный', value: '#5CB85C' },
  { name: 'Фиолетовый', value: '#9B59B6' },
  { name: 'Розовый', value: '#E84C6C' },
  { name: 'Оранжевый', value: '#F39C12' },
  { name: 'Красный', value: '#E74C3C' },
  { name: 'Жёлтый', value: '#F1C40F' },
  { name: 'Белый', value: '#dbe2e2' },
];

const STORAGE_KEY = 'breathing-accent-color';

export function useThemeColor() {
  const [accentColor, setAccentColor] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const found = COLORS.find(c => c.value === stored);
        if (found) return found.value;
      }
    } catch {}
    return COLORS[0].value;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, accentColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
  }, [accentColor]);

  return { colors: COLORS, accentColor, setAccentColor };
}