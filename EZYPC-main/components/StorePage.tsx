import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Product, FilterType } from '../types';
import ProductCard from './RecommendationCard';
import FilterBar from './FilterBar';
import LoadingSpinner from './LoadingSpinner';
import ProductCardSkeleton from './ProductCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import DecryptedText from './DecryptedText';
import OrbitElements from './OrbitElements';

interface StorePageProps {
    products: Product[];
    onStartWizard: () => void;
    onViewDetails: (product: Product) => void;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const ITEMS_PER_LOAD = 6;
const SUBSEQUENT_LOAD = 6;

const StorePage: React.FC<StorePageProps> = ({ products, onStartWizard, onViewDetails, isLoading, searchQuery, onSearchChange }) => {
    const safeProducts = products ?? [];
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
    const observer = useRef<IntersectionObserver | null>(null);

    const availableFilters = useMemo((): FilterType[] => {
        if (safeProducts.length === 0) {
            return ['All'];
        }
        const types = new Set(safeProducts.map(p => p.type));
        const sortedTypes = Array.from(types).sort();
        return ['All', ...sortedTypes];
    }, [safeProducts]);

    const filteredProducts = useMemo(() => {
        let results = safeProducts;
        if (activeFilter !== 'All') {
            results = results.filter(product => product.type === activeFilter);
        }
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            results = results.filter(product => {
                const searchableText = `${product.title} ${product.type} ${(product.components ?? []).map(c => c.spec).join(' ')}`.toLowerCase();
                return searchableText.includes(lowercasedQuery);
            });
        }
        return results;
    }, [safeProducts, activeFilter, searchQuery]);

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
        observer.current = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setVisibleCount(prev => Math.min(prev + SUBSEQUENT_LOAD, filteredProducts.length));
                }
            },
            { rootMargin: '200px 0px', threshold: 0 }
        );
        if (node) observer.current.observe(node);
    }, [hasMore, filteredProducts.length]);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full pb-20">
            {/* Premium Hero Section */}
            {!searchQuery && (
                <div className="relative w-full py-24 mb-16 overflow-hidden">
                    <div className="max-w-4xl">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-4 block"
                            style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                        >
                            Intelligent Selection
                        </motion.span>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl sm:text-8xl font-black tracking-tighter text-on-surface uppercase leading-[0.9] mb-8"
                            style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                        >
                            <DecryptedText 
                                text="Find your next powerhouse."
                                animateOn="view"
                                revealDirection="center"
                                speed={40}
                                maxIterations={20}
                                characters="0123456789!@#$%^&*()_+"
                                className="text-on-surface"
                                encryptedClassName="text-black/20 dark:text-white/20"
                            />
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-xl text-lg text-on-surface-secondary dark:text-dark-on-surface-secondary mb-12"
                        >
                            A curated collection of high-performance computing machines. Use our AI wizard to find the perfect match for your workflow.
                        </motion.p>
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={onStartWizard}
                            className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black text-xs font-black tracking-widest uppercase hover:scale-105 transition-transform"
                            style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                        >
                            Get Recommendation
                        </motion.button>
                    </div>

                    {/* Orbiting Elements Showcase - Always visible now on desktop */}
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-full h-[600px] max-w-2xl hidden lg:flex items-center justify-center pointer-events-none opacity-100 z-0">
                         <OrbitElements 
                            images={[
                                'https://picsum.photos/80/80?random=1',
                                'https://picsum.photos/80/80?random=2',
                                'https://picsum.photos/80/80?random=3',
                                'https://picsum.photos/80/80?random=4',
                                'https://picsum.photos/80/80?random=5',
                                'https://picsum.photos/80/80?random=6',
                            ]} 
                         />
                    </div>
                </div>
            )}
            
            {/* Filter and Product Grid */}
            <div className="mb-12">
                 {searchQuery && (
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-on-surface/10 dark:border-dark-on-surface/10">
                        <p className="text-xs font-bold tracking-widest text-on-surface-secondary dark:text-dark-on-surface-secondary uppercase">
                            Results for: <span className="text-on-surface dark:text-dark-on-surface font-black">"{searchQuery}"</span>
                        </p>
                        <button onClick={() => onSearchChange('')} className="text-xs font-black tracking-widest border-b border-black dark:border-white uppercase">Clear Search</button>
                    </div>
                 )}
                 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                    <div className="flex-grow">
                        <span className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase mb-2 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Categories</span>
                        <FilterBar filters={availableFilters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
                {visibleProducts.length > 0 ? (
                    visibleProducts.map((product, index) => (
                        <ProductCard key={product.id ?? product.title} product={product} onViewDetails={() => onViewDetails(product)} staggerIndex={index} />
                    ))
                ) : (
                    <div className="col-span-full py-24 flex flex-col items-center">
                        <span className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase">No Matches Found</span>
                    </div>
                )}
            </div>
            
            {hasMore && (
                <div ref={loaderRef} className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default StorePage;