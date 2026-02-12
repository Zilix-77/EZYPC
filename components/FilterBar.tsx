import React from 'react';
import { FilterType } from '../types';

interface FilterBarProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    filters: FilterType[];
}

const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange, filters }) => {
    return (
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 p-2 rounded-xl">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors duration-200 ${
                        activeFilter === filter 
                        ? 'bg-primary text-black' 
                        : 'text-on-surface/70 dark:text-dark-on-surface/70 hover:text-on-surface dark:hover:text-dark-on-surface hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;