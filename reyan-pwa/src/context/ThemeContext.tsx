import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSetting } from '../types';

interface ThemeContextType {
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSetting>(() => {
    return (localStorage.getItem('reyan_theme') as ThemeSetting) || 'SYSTEM';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('reyan_theme', theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let dark = false;
      if (theme === 'DARK') {
        dark = true;
      } else if (theme === 'LIGHT') {
        dark = false;
      } else {
        dark = mediaQuery.matches;
      }
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
