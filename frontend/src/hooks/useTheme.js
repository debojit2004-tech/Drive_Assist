import { useState, useEffect } from 'react';

const THEMES = ['dark', 'light', 'neon'];
const THEME_META = {
  dark:  { label: '🌙 Dark Mode',  icon: '🌙' },
  light: { label: '☀️ Light Mode', icon: '☀️' },
  neon:  { label: '🚗 Neon Car',   icon: '🚗' },
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('driver-ai-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('driver-ai-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  return { theme, setTheme, cycleTheme, themes: THEMES, themeMeta: THEME_META };
}
