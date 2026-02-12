import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Product, FilterType } from '../types';
import ProductCard from './RecommendationCard';
import FilterBar from './FilterBar';
import LoadingSpinner from './LoadingSpinner';
import ProductCardSkeleton from './ProductCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface StorePageProps {
    products: Product[];
    onStartWizard: () => void;
    onViewDetails: (product: Product) => void;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const ITEMS_PER_LOAD = 6;
const SUBSEQUENT_LOAD = 3;

const StorePage: React.FC<StorePageProps> = ({ products, onStartWizard, onViewDetails, isLoading, searchQuery, onSearchChange }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
    const observer = useRef<IntersectionObserver | null>(null);

    // FIX: Explicitly set the return type of useMemo to `FilterType[]` to prevent
    // TypeScript from inferring a wider `string[]` type, which causes a mismatch.
    const availableFilters = useMemo((): FilterType[] => {
        if (!products || products.length === 0) {
            return ['All'];
        }
        const types = new Set(products.map(p => p.type));
        const sortedTypes = Array.from(types).sort();
        return ['All', ...sortedTypes];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let results = products;

        // Apply category filter
        if (activeFilter !== 'All') {
            results = results.filter(product => product.type === activeFilter);
        }

        // Apply search query filter
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            results = results.filter(product => {
                const searchableText = `${product.title} ${product.type} ${product.components.map(c => c.spec).join(' ')}`.toLowerCase();
                return searchableText.includes(lowercasedQuery);
            });
        }
        
        return results;
    }, [products, activeFilter, searchQuery]);

    useEffect(() => {
        if (!availableFilters.includes(activeFilter)) {
            setActiveFilter('All');
        }
    }, [availableFilters, activeFilter]);
    
    useEffect(() => {
        setVisibleCount(ITEMS_PER_LOAD);
    }, [activeFilter, searchQuery]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const hasMore = visibleCount < filteredProducts.length;

    const loaderRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setTimeout(() => {
                    setVisibleCount(prev => Math.min(prev + SUBSEQUENT_LOAD, filteredProducts.length));
                }, 400); 
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore, filteredProducts.length]);

    if (isLoading) {
        return (
            <div className="w-full">
                {/* Skeleton for Hero */}
                <div className="text-center p-8 md:p-12 bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl mb-12 animate-pulse">
                    <div className="h-10 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-6 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-1/2 mx-auto mb-8"></div>
                    <div className="h-12 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded-lg w-48 mx-auto"></div>
                </div>

                {/* Skeleton for Filter and Title */}
                <div className="mb-8">
                     <div className="h-8 bg-surface dark:bg-dark-surface rounded-xl w-1/4 mb-4"></div>
                     <div className="h-16 bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 p-2 rounded-xl"></div>
                </div>

                {/* Skeleton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Hero Section */}
             <AnimatePresence>
                {!searchQuery && (
                    <motion.div
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center p-8 md:p-12 bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl mb-12 overflow-hidden"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold text-on-surface dark:text-dark-on-surface">Find the Right PC for You</h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-on-surface-secondary dark:text-dark-on-surface-secondary">
                            Browse our curated selection or answer a few questions to get a personalized recommendation.
                        </p>
                        <button
                            onClick={onStartWizard}
                            className="mt-8 bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors duration-200"
                        >
                            Get a Recommendation
                        </button>
                    </motion.div>
                 )}
            </AnimatePresence>
            
            {/* Filter and Product Grid */}
            <div className="mb-8">
                 <AnimatePresence>
                    {searchQuery && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between mb-4 bg-surface dark:bg-dark-surface p-3 rounded-lg border border-on-surface/10 dark:border-dark-on-surface/10"
                        >
                            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">
                                Showing results for: <span className="font-semibold text-on-surface dark:text-dark-on-surface">"{searchQuery}"</span>
                            </p>
                            <button onClick={() => onSearchChange('')} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline">Clear</button>
                        </motion.div>
                    )}
                 </AnimatePresence>
                 <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-4">Curated Selections</h2>
                 <FilterBar filters={availableFilters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>

            <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {visibleProducts.length > 0 ? (
                        visibleProducts.map((product, index) => (
                           <ProductCard key={`${product.title}-${index}`} product={product} onViewDetails={() => onViewDetails(product)} />
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-16 text-on-surface-secondary dark:text-dark-on-surface-secondary"
                        >
                            No products found. Try adjusting your search or filters.
                        </motion.div>
                    )}
                 </AnimatePresence>
            </motion.div>
            
            {hasMore && (
                <div ref={loaderRef} className="flex justify-center items-center p-8">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default StorePage;