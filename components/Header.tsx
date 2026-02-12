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
    { page: Page.STORE, label: 'Store' },
    { page: Page.USED_PARTS, label: 'Used Parts' },
  ];

  useEffect(() => {
    if (isSearchVisible) {
        searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);
  
  // If we are not on the store page, don't show the search bar
  const canShowSearch = currentPage === Page.STORE;

  const handleSearchToggle = () => {
    if (!canShowSearch) {
        onNavigate(Page.STORE);
        setTimeout(() => setIsSearchVisible(true), 50);
    } else {
        setIsSearchVisible(!isSearchVisible);
    }
  };


  return (
    <header className="w-full py-4 px-2 flex justify-between items-center border-b border-on-surface/10 dark:border-dark-surface relative">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Page.STORE)}>
        <AnimatedLogo />
        <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">EZYPC</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <AnimatePresence>
            {isSearchVisible && canShowSearch && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        onBlur={() => { if(!searchQuery) setIsSearchVisible(false) }}
                        className="w-40 sm:w-56 bg-surface dark:bg-dark-surface border border-on-surface/20 dark:border-dark-on-surface/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                    />
                </motion.div>
            )}
        </AnimatePresence>
        
        <nav className="flex items-center gap-2 sm:gap-6">
          {navItems.map(item => (
            <button 
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`text-md font-medium transition-colors ${currentPage === item.page ? 'text-primary dark:text-dark-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-primary dark:hover:text-dark-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleSearchToggle} className="p-2 rounded-full hover:bg-on-surface/5 dark:hover:bg-dark-on-surface/5 text-on-surface-secondary dark:text-dark-on-surface-secondary">
            <SearchIcon className="w-5 h-5" />
        </button>
        
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;