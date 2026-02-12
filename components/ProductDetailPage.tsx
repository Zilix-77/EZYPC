import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { Product, UsedPart, Page } from '../types';
import LazyImage from './LazyImage';
import PriceHistoryChart from './PriceHistoryChart';
import { getSimilarProducts } from '../services/geminiService';
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
      setHasMoreSimilar(false); // Stop trying if there's an error
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
    <div className="w-full max-w-5xl mx-auto">
       <AnimatePresence>
            {isScrolled && (
                <motion.button
                    onClick={onBack}
                    className="fixed top-6 left-6 z-30 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border border-on-surface/20 dark:border-dark-on-surface/20 py-3 px-6 rounded-full shadow-lg flex items-center gap-2 text-on-surface dark:text-dark-on-surface font-semibold"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Store
                </motion.button>
            )}
        </AnimatePresence>
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-on-surface dark:hover:text-dark-on-surface transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Store
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="rounded-xl overflow-hidden aspect-video">
            <LazyImage src={imageUrl} alt={title} className="w-full h-full" />
          </div>
          {reviews && reviews.length > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <p className="text-4xl font-bold text-on-surface dark:text-dark-on-surface">{averageRating.toFixed(1)}</p>
              <div>
                <StarRating rating={averageRating} className="h-6 w-6" />
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mt-1">{reviews.length} reviews</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-md text-on-surface-secondary dark:text-dark-on-surface-secondary font-medium mb-2">{type}</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-on-surface dark:text-dark-on-surface mb-3">{title}</h1>
          <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mb-6 text-lg">{rationale}</p>
          
          <div className="mt-auto pt-6">
              <div className="flex-grow bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-xl p-4">
                  <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-3">Starting from</p>
                  <p className="text-3xl font-bold text-primary dark:text-dark-primary text-left mb-4">{formattedPrice}</p>
                  <div className="space-y-3">
                      {sortedPurchaseOptions.map((option, index) => (
                          <a
                              key={option.vendor}
                              href={option.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-full flex justify-between items-center text-center font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-base
                                  ${index === 0 ? 'bg-success hover:bg-success-hover text-black' : 'bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white'}`
                              }
                          >
                              <span>Buy on {option.vendor}</span>
                              <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(option.price)}</span>
                          </a>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      {availableUsedPart && (
        <div className="my-8 p-4 bg-accent/10 border-l-4 border-accent rounded-r-lg flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0 text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="flex-grow text-on-surface dark:text-dark-on-surface text-center sm:text-left">
                <h4 className="font-bold">Also available as Pre-Owned!</h4>
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary">
                    A similar component, the <span className="font-semibold">{availableUsedPart.component}</span>, is in our certified pre-owned section for just <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(availableUsedPart.price)}</span>.
                </p>
            </div>
            <button 
                onClick={() => onNavigate(Page.USED_PARTS)}
                className="bg-accent text-black font-semibold py-2 px-5 rounded-lg hover:bg-opacity-80 transition-colors duration-200 flex-shrink-0">
                Check It Out
            </button>
        </div>
      )}

      <div className="my-12 border-t border-on-surface/10 dark:border-dark-on-surface/10"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-4">Full Specifications</h2>
          <div className="bg-surface dark:bg-dark-surface rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10">
            {components.map((comp, index) => (
              <div key={index} className={`p-4 flex justify-between text-md ${index !== components.length - 1 ? 'border-b border-on-surface/10 dark:border-dark-on-surface/10' : ''}`}>
                <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{comp.name}</p>
                <p className="font-semibold text-on-surface dark:text-dark-on-surface text-right">{comp.spec}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-surface dark:bg-dark-surface rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10 p-6">
            <PriceHistoryChart basePrice={estimatedPriceINR} />
        </div>
      </div>

      <div className="my-12 border-t border-on-surface/10 dark:border-dark-on-surface/10"></div>
      
      <ReviewsSection reviews={reviews} />

      <div className="my-12 border-t border-on-surface/10 dark:border-dark-on-surface/10"></div>

      <div>
        <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface mb-6">Similar Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingSimilar && similarProducts.length === 0 ? (
                <>
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                </>
            ) : (
                similarProducts.map((p, index) => (
                    <ProductCard key={`${p.title}-${index}`} product={p} onViewDetails={() => onViewDetails(p)} />
                ))
            )}
        </div>
        <div ref={loaderRef} className="flex justify-center items-center p-8 h-20">
            {hasMoreSimilar && !isLoadingSimilar && <LoadingSpinner />}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;