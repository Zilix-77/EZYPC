import React from 'react';
import { FilterType } from '../types';
import { motion } from 'framer-motion';

interface FilterBarProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    filters: FilterType[];
}

const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange, filters }) => {
    return (
        <div className="flex items-center flex-wrap gap-8 py-4 px-0 border-b border-on-surface/10 dark:border-dark-on-surface/10">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 relative py-2 ${
                        activeFilter === filter 
                        ? 'text-on-surface' 
                        : 'text-on-surface-secondary hover:text-on-surface'
                    }`}
                    style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                >
                    {filter}
                    {activeFilter === filter && (
                        <motion.div 
                            layoutId="filter-underline" 
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-on-surface dark:bg-dark-on-surface" 
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;