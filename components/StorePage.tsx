import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Product, FilterType } from '../types';
import ProductCard from './RecommendationCard';
import FilterBar from './FilterBar';
import LoadingSpinner from './LoadingSpinner';
import ProductCardSkeleton from './ProductCardSkeleton';
import { motion } from 'framer-motion';

interface StorePageProps {
    products: Product[];
    onStartWizard: () => void;
    onViewDetails: (product: Product) => void;
    isLoading: boolean;
}

const ITEMS_PER_LOAD = 6;
const SUBSEQUENT_LOAD = 3;

const StorePage: React.FC<StorePageProps> = ({ products, onStartWizard, onViewDetails, isLoading }) => {
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
        if (activeFilter === 'All') return products;
        return products.filter(product => product.type === activeFilter);
    }, [products, activeFilter]);

    useEffect(() => {
        if (!availableFilters.includes(activeFilter)) {
            setActiveFilter('All');
        }
    }, [availableFilters, activeFilter]);
    
    useEffect(() => {
        setVisibleCount(ITEMS_PER_LOAD);
    }, [activeFilter]);

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
            <div className="text-center p-8 md:p-12 bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-on-surface dark:text-dark-on-surface">Find the Right PC for You</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-on-surface-secondary dark:text-dark-on-surface-secondary">
                    Browse our curated selection or answer a few questions to get a personalized recommendation.
                </p>
                <button
                    onClick={onStartWizard}
                    className="mt-8 bg-primary text-black font-semibold py-3 px-8 rounded-lg hover:bg-primary-hover transition-colors duration-200"
                >
                    Get a Recommendation
                </button>
            </div>
            
            {/* Filter and Product Grid */}
            <div className="mb-8">
                 <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-4">Curated Selections</h2>
                 <FilterBar filters={availableFilters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>

            <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {visibleProducts.map((product, index) => (
                    <ProductCard key={`${product.title}-${index}`} product={product} onViewDetails={() => onViewDetails(product)} />
                ))}
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