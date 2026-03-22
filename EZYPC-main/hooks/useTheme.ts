import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

// Initialize theme synchronously to prevent flash of wrong theme
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  if (storedTheme) return storedTheme;
  
  // Default to 'dark' for better visibility and modern aesthetic
  return 'dark';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Ensure the theme is applied immediately when component mounts
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);



  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
};
