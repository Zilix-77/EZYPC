import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../types';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

interface HeaderProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
    searchQuery: string;
    onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, searchQuery, onSearch }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { page: Page.STORE, label: 'STORE' },
    { page: Page.USED_PARTS, label: 'USED PARTS' },
  ];

  return (
    <header className="w-full py-8 flex justify-between items-center relative z-50">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate(Page.STORE)}>
        <div className="h-10 w-auto aspect-[140/160] flex items-center justify-center">
            <AnimatedLogo scale={0.4} />
        </div>
        <div className="overflow-hidden">
            <h1 className="text-2xl font-black tracking-tighter text-on-surface dark:text-dark-on-surface uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                EZYPC
            </h1>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-12">
        <nav className="flex items-center gap-8">
          {navItems.map(item => (
            <button 
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`text-xs font-bold tracking-[0.2em] transition-all duration-300 uppercase ${currentPage === item.page ? 'text-on-surface dark:text-dark-on-surface' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface'}`}
              style={{ fontFamily: '"Host Grotesk", sans-serif' }}
            >
              {item.label}
              {currentPage === item.page && (
                  <motion.div layoutId="nav-underline" className="h-0.5 bg-on-surface dark:bg-dark-on-surface mt-1" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
            <AnimatePresence>
                {(isSearchVisible || searchQuery) && (
                    <motion.input
                        ref={searchInputRef}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 200, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        type="text"
                        placeholder="SEARCH..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="bg-transparent border-b border-on-surface/20 dark:border-dark-on-surface/20 py-1 text-xs tracking-widest focus:outline-none focus:border-on-surface dark:focus:border-dark-on-surface uppercase"
                        style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                    />
                )}
            </AnimatePresence>
            <button 
                onClick={() => setIsSearchVisible(!isSearchVisible)} 
                className="p-2 text-on-surface dark:text-dark-on-surface hover:scale-110 transition-transform"
            >
                <SearchIcon className="w-5 h-5 stroke-[1.5]" />
            </button>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;