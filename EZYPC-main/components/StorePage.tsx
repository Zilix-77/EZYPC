import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Product, FilterType, Page, ProductType } from '../types';
import ProductCard from './RecommendationCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import FilterBar from './FilterBar';
import LoadingSpinner from './LoadingSpinner';
import { motion } from 'framer-motion';
import DecryptedText from './DecryptedText';
import OrbitElements from './OrbitElements';
import MetaBalls from './MetaBalls';

interface StorePageProps {
    products: Product[];
    onStartWizard: () => void;
    onViewDetails: (product: Product) => void;
    isLoading?: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const ProductTypeValues: ProductType[] = ['Custom Build', 'Prebuilt PC', 'Laptop'];
const FilterTypeValues: FilterType[] = ['All', ...ProductTypeValues];

const StorePage: React.FC<StorePageProps> = ({ products, onStartWizard, onViewDetails, isLoading, searchQuery, onSearchChange }) => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [visibleCount, setVisibleCount] = useState(36);
    const loaderRef = useRef<HTMLDivElement>(null);

    const availableFilters = FilterTypeValues;

    const filteredProducts = useMemo(() => {
        let result = products;
        if (activeFilter !== 'All') {
            result = result.filter(p => p.type === activeFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.rationale.toLowerCase().includes(query) ||
                (p.components || []).some(c => c.spec.toLowerCase().includes(query))
            );
        }
        return result;
    }, [products, activeFilter, searchQuery]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    return (
        <div className="w-full pb-20">
            {/* Premium Hero Section */}
            {!searchQuery && (
                <div className="relative w-full py-24 mb-16 overflow-visible">
                    <div className="max-w-4xl relative z-10">
                        {/* MetaBalls as background for the Main Text Area - Interaction FIXED */}
                        <div 
                            className="absolute -left-20 -top-20 w-[120%] h-[150%] z-0 overflow-visible"
                            style={{ 
                                maskImage: 'radial-gradient(circle at center, black 25%, transparent 65%)',
                                WebkitMaskImage: 'radial-gradient(circle at center, black 25%, transparent 65%)',
                                pointerEvents: 'none' // The wrapper is invisible to mouse
                            }}
                        >
                            <div className="w-full h-full scale-125 blur-[120px] opacity-40 dark:opacity-60" style={{ pointerEvents: 'auto' }}>
                                <MetaBalls 
                                    color="#ffffff"
                                    cursorBallColor="#ffffff" 
                                    speed={0.4}
                                    ballCount={18}
                                    animationSize={45}
                                    clumpFactor={0.7}
                                    cursorBallSize={7}
                                    enableTransparency={true}
                                />
                            </div>
                        </div>

                        <div className="relative z-10 pointer-events-auto">
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
                                    className="text-on-surface text-balance"
                                    encryptedClassName="text-black/20 dark:text-white/20"
                                />
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="max-w-xl text-lg text-on-surface-secondary mb-12"
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
                    </div>

                    {/* Orbiting Elements Showcase - FURTHER TOP/LEFT */}
                    <div className="absolute right-[28%] top-[5%] w-full h-[400px] max-w-lg hidden lg:flex items-center justify-center pointer-events-none opacity-100 z-0">
                         <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <OrbitElements 
                                images={[
                                    'https://www.svgrepo.com/show/532354/monitor.svg',
                                    'https://www.svgrepo.com/show/532349/keyboard.svg',
                                    'https://www.svgrepo.com/show/475459/keyboard-key-s.svg',
                                    'https://www.svgrepo.com/show/521695/gpu.svg',
                                    'https://www.svgrepo.com/show/521576/cpu.svg',
                                    'https://www.svgrepo.com/show/501257/mouse-alt.svg',
                                ]} 
                            />
                         </div>
                    </div>
                </div>
            )}
            
            {/* Standard section for instant card trigger */}
            <section className="relative mt-24 py-12">
                {/* Visual Anchor background */}
                <div className="absolute -inset-x-8 -inset-y-8 bg-black/[0.02] dark:bg-white/[0.01] border-y border-black/5 dark:border-white/5 pointer-events-none z-0" />
                
                <div className="relative z-10">
                    <div className="mb-12">
                         {searchQuery && (
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-on-surface/10">
                                <p className="text-xs font-bold tracking-widest text-on-surface-secondary uppercase">
                                    Results for: <span className="text-on-surface font-black">"{searchQuery}"</span>
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
                </div>
            </section>
            
            {hasMore && (
                <div ref={loaderRef} className="flex justify-center items-center py-20">
                    <LoadingSpinner />
                </div>
            )}
        </div>
    );
};

export default StorePage;