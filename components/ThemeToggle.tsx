import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base dark:focus:ring-offset-dark-base transition-all"
      aria-label="Toggle theme"
    >
      {/* Background glow effect for dark mode */}
      <div className={`absolute -inset-1 rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-primary/20 blur-lg' : 'bg-transparent'}`}></div>

      {/* SVG Icon */}
      <svg className="w-6 h-6 z-10 text-on-surface-secondary dark:text-dark-on-surface-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* The static outer ring of the power button */}
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" className="opacity-20" />
        
        {/* The static power line */}
        <path d="M12 7v5" />
        
        {/* Animated glowing ring for dark mode */}
        <AnimatePresence>
          {theme === 'dark' && (
            <motion.path
              d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
              stroke="#c89b7b"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </svg>
    </button>
  );
};

export default ThemeToggle;
