'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Handle migration: if saved theme is 'system' or invalid, default to 'dark'
      const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
      console.log("Initial theme: ", initialTheme);
      setTheme(initialTheme);

      // Update document data-theme attribute and dark class for Tailwind
      document.documentElement.setAttribute('data-theme', initialTheme);

      // Add/remove dark class for Tailwind CSS
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);

    // Update document data-theme attribute and dark class for Tailwind
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);

      // Add/remove dark class for Tailwind CSS
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
