import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { Product, UsedPart, Page } from '../types';
import LazyImage from './LazyImage';
import PriceHistoryChart from './PriceHistoryChart';
import { getSimilarProducts } from '../services/aiService';
import ProductCard from './RecommendationCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ReviewsSection from './ReviewsSection';
import LoadingSpinner from './LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import StarRating from './StarRating';
import { usedPartsData } from '../data/usedPartsData';


interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onViewDetails: (product: Product) => void;
  onNavigate: (page: Page) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onViewDetails, onNavigate }) => {
  const { type, title, rationale, estimatedPriceINR, components, purchaseOptions, reviews, imageUrl } = product;
  
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState<boolean>(true);
  const [hasMoreSimilar, setHasMoreSimilar] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [availableUsedPart, setAvailableUsedPart] = useState<UsedPart | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const findMatch = () => {
        for (const comp of components) {
            const coreSpec = comp.spec.toLowerCase().replace(/amd|nvidia|intel|geforce|rtx|gtx/g, '').trim();
            const match = usedPartsData.find(used => 
                coreSpec.includes(used.component.toLowerCase().replace(/amd|nvidia|intel|geforce|rtx|gtx/g, '').trim())
            );
            if (match) return match;
        }
        return null;
    };
    setAvailableUsedPart(findMatch());
  }, [components]);

  const averageRating = useMemo(() => {
      if (!reviews || reviews.length === 0) return 0;
      const total = reviews.reduce((acc, review) => acc + review.rating, 0);
      return parseFloat((total / reviews.length).toFixed(1));
  }, [reviews]);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSimilar = useCallback(async (isInitial = false) => {
    if (isInitial) {
        setIsLoadingSimilar(true);
        setSimilarProducts([]);
    }

    try {
      const excludeTitles = [product.title, ...similarProducts.map(p => p.title)];
      const result = await getSimilarProducts(product, excludeTitles);
      if (result && result.recommendations && result.recommendations.length > 0) {
        setSimilarProducts(prev => [...prev, ...result.recommendations]);
      } else {
        setHasMoreSimilar(false);
      }
    } catch (error) {
      console.error("Failed to fetch similar products:", error);
      setHasMoreSimilar(false);
    } finally {
      if(isInitial) setIsLoadingSimilar(false);
    }
  }, [product, similarProducts]);

  useEffect(() => {
    setHasMoreSimilar(true);
    fetchSimilar(true);
  }, [product.title]);

  const loaderRef = useCallback(node => {
    if (isLoadingSimilar) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreSimilar) {
            fetchSimilar();
        }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingSimilar, hasMoreSimilar, fetchSimilar]);


  const sortedPurchaseOptions = useMemo(() => {
    return [...(purchaseOptions || [])].sort((a, b) => a.price - b.price);
  }, [purchaseOptions]);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(estimatedPriceINR);

  return (
    <div className="w-full max-w-7xl mx-auto pb-32">
       <AnimatePresence>
            {isScrolled && (
                <motion.button
                    onClick={onBack}
                    className="fixed top-24 left-8 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 py-4 px-8 text-[10px] font-black tracking-widest uppercase text-black dark:text-white hover:scale-105 transition-transform"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                >
                    Return
                </motion.button>
            )}
        </AnimatePresence>

      <div className="mb-12">
        <button onClick={onBack} className="flex items-center gap-4 group">
            <div className="w-8 h-[1px] bg-black/20 dark:bg-white/20 group-hover:w-12 group-hover:bg-black dark:group-hover:bg-white transition-all" />
            <span className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white uppercase transition-colors" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Back to Store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-7">
          <div className="overflow-hidden bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 grayscale hover:grayscale-0 transition-all duration-1000">
            <LazyImage src={imageUrl} alt={title} className="w-full h-full object-cover aspect-[4/3]" />
          </div>
          
          <div className="mt-24 space-y-24">
              <section>
                <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-8 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Specifications</span>
                <div className="grid grid-cols-1 gap-0 border-t border-black/10 dark:border-white/10">
                    {components.map((comp, index) => (
                      <div key={index} className="py-6 flex justify-between items-center border-b border-black/10 dark:border-white/10 group">
                        <span className="text-[10px] font-black tracking-widest text-black/30 dark:text-white/30 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{comp.name}</span>
                        <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider text-right">{comp.spec}</span>
                      </div>
                    ))}
                </div>
              </section>

              <section>
                 <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-8 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Price Performance</span>
                 <div className="p-8 border border-black/10 dark:border-white/10">
                    <PriceHistoryChart basePrice={estimatedPriceINR} />
                 </div>
              </section>

              <ReviewsSection reviews={reviews} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col pt-0 lg:pt-12 sticky top-24 self-start">
          <span className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase mb-4" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{type}</span>
          <h1 className="text-5xl lg:text-7xl font-black text-on-surface dark:text-dark-on-surface mb-8 uppercase tracking-tighter leading-[0.9]" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{title}</h1>
          <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mb-12 text-lg leading-relaxed">{rationale}</p>
          
          <div className="mt-auto space-y-6">
               <div className="p-10 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A]">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase block mb-1" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Starting at</span>
                        <span className="text-4xl font-black text-black dark:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{formattedPrice}</span>
                    </div>
                    {averageRating > 0 && (
                        <div className="text-right">
                            <span className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase block mb-1" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Rating</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-black dark:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{averageRating.toFixed(1)}</span>
                                <StarRating rating={averageRating} className="h-4 w-4" />
                            </div>
                        </div>
                    )}
                  </div>

                   <div className="space-y-3">
                       {sortedPurchaseOptions.map((option, index) => (
                           <a
                               key={option.vendor}
                               href={option.link}
                               target="_blank"
                               rel="noopener noreferrer"
                               className={`w-full flex justify-between items-center px-8 py-5 text-[10px] font-black tracking-widest uppercase transition-all duration-300
                                   ${index === 0 
                                     ? 'bg-green-500 dark:bg-green-600 text-white dark:text-white hover:scale-[1.02] hover:bg-green-600 dark:hover:bg-green-700' 
                                     : 'border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white'}`}
                               style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                           >
                               <span>Buy on {option.vendor}</span>
                               <span className="opacity-60">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(option.price)}</span>
                           </a>
                       ))}
                   </div>
               </div>

               {availableUsedPart && (
                <div className="p-8 border border-accent/20 bg-accent/5 flex flex-col gap-6">
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-accent uppercase block mb-2" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Expert Tip</span>
                        <p className="text-xs text-on-surface-secondary dark:text-dark-on-surface-secondary uppercase tracking-wider leading-relaxed">
                            Save by choosing a pre-owned <span className="font-bold text-black dark:text-white">{availableUsedPart.component}</span> for <span className="font-bold text-black dark:text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(availableUsedPart.price)}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={() => onNavigate(Page.USED_PARTS)}
                        className="w-full py-4 border border-accent text-accent text-[10px] font-black tracking-widest uppercase hover:bg-accent hover:text-black transition-all"
                        style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                        Browse Pre-Owned
                    </button>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="mt-32 pt-32 border-t border-black/10 dark:border-white/10">
        <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-12 block text-center" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Similar Alternatives</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingSimilar && similarProducts.length === 0 ? (
                <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                </>
            ) : (
                similarProducts.map((p, index) => (
                    <ProductCard key={p.title} product={p} onViewDetails={() => onViewDetails(p)} staggerIndex={index} />
                ))
            )}
        </div>
        <div ref={loaderRef} className="flex justify-center items-center py-20 h-20">
            {hasMoreSimilar && !isLoadingSimilar && (
                <div className="w-8 h-8 border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;