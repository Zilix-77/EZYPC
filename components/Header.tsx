import React from 'react';
import { Page } from '../types';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const navItems = [
    { page: Page.STORE, label: 'Store' },
    { page: Page.USED_PARTS, label: 'Used Parts' },
  ];

  return (
    <header className="w-full py-4 px-2 flex justify-between items-center border-b border-on-surface/10 dark:border-dark-surface">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Page.STORE)}>
        <AnimatedLogo />
        <h1 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">EZYPC</h1>
      </div>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-6">
          {navItems.map(item => (
            <button 
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`text-md font-medium transition-colors ${currentPage === item.page ? 'text-primary' : 'text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;