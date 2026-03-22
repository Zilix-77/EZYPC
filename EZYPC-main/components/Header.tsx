import React, { useState, useRef, useEffect } from 'react';
import { Page, User } from '../types';
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
    user: User | null;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, searchQuery, onSearch, user, onSignOut }) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [logoClicks, setLogoClicks] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        setLogoClicks(prev => {
            const next = prev + 1;
            if (next === 3) {
                // Trigger Easter Egg
                const event = new CustomEvent('trigger-easter-egg');
                window.dispatchEvent(event);
                return 0;
            }
            return next;
        });
        onNavigate(Page.STORE);
    };

    const navItems = [
      { page: Page.STORE, label: 'STORE' },
      { page: Page.USED_PARTS, label: 'USED PARTS' },
    ];

    return (
      <header className="w-full py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={handleLogoClick}>
          <div className="flex items-center justify-center">
              <AnimatedLogo scale={0.45} />
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
        
        {user ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-on-surface/10">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black tracking-widest text-on-surface/40 uppercase">Member</span>
                    <span className="text-[10px] font-black tracking-tighter text-on-surface uppercase">{user.email.split('@')[0]}</span>
                </div>
                <button 
                    onClick={onSignOut}
                    className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
            </div>
        ) : (
            <button 
                onClick={() => onNavigate(Page.SIGN_IN)}
                className="ml-4 px-6 py-2.5 border border-black dark:border-white text-[10px] font-black tracking-widest uppercase hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
            >
                Connect
            </button>
        )}

        <button 
            onClick={() => onNavigate(Page.CREATOR)} 
            className="text-[8px] font-black opacity-10 hover:opacity-100 transition-opacity ml-2"
        >
            ©
        </button>
      </div>
    </header>
  );
};

export default Header;