import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Page, Product } from './types';
import Header from './components/Header';
import { getProductsPage } from './services/aiService';
import IntroAnimation from './components/IntroAnimation';
import RecommendationWizard from './components/RecommendationWizard';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';

const INITIAL_PAGE_SIZE = 12;
const NEXT_BATCH_SIZE = 50;

// Performance: Lazy load page components
const StorePage = lazy(() => import('./components/StorePage'));
const UsedPartsPage = lazy(() => import('./components/UsedPartsPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));

const App: React.FC = () => {
  useTheme();
  const [page, setPage] = useState<Page>(Page.STORE);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isIntroComplete, setIntroComplete] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const hasFetchedRef = useRef(false);
  const hasFetchedBackgroundRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isIntroComplete) {
      import('./components/UsedPartsPage');
      import('./components/ProductDetailPage');
    }
  }, [isIntroComplete]);

  const fetchProducts = useCallback(async (pageOffset: number, limit: number, append: boolean) => {
    if (append) {
      setError(null);
    } else {
      setIsLoading(true);
      setError(null);
    }
    try {
      const result = await getProductsPage(pageOffset, limit);
      if (!result) {
        if (!append) setError('Could not load products. Please try again later.');
        return;
      }
      const fetched = result.recommendations ?? [];
      setHasMore(result.hasMore ?? false);
      setOffset(pageOffset + fetched.length);

      if (append) {
        setProducts((prev) => {
          const byKey = (p: Product) => p.id ?? p.title;
          const existingKeys = new Set(prev.map(byKey));
          const unique = fetched.filter((p) => !existingKeys.has(byKey(p)));
          const next = [...prev, ...unique];
          console.log('[App] Total loaded products:', next.length);
          return next;
        });
      } else {
        setProducts(fetched);
        console.log('[App] Initial load. Total loaded products:', fetched.length);
      }
    } catch (e) {
      console.error(e);
      if (!append) {
        setError('An error occurred while fetching products. Please try again.');
      }
    } finally {
      if (!append) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isIntroComplete) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProducts(0, INITIAL_PAGE_SIZE, false);
  }, [isIntroComplete, fetchProducts]);

  useEffect(() => {
    if (!isIntroComplete || !hasMore || isLoading || products.length < INITIAL_PAGE_SIZE) return;
    if (hasFetchedBackgroundRef.current) return;
    hasFetchedBackgroundRef.current = true;
    fetchProducts(INITIAL_PAGE_SIZE, NEXT_BATCH_SIZE, true);
  }, [isIntroComplete, isLoading, products.length, hasMore, fetchProducts]);

  const loadMoreProducts = useCallback(() => {
    if (!hasMore || isLoading) return;
    fetchProducts(offset, NEXT_BATCH_SIZE, true);
  }, [hasMore, isLoading, offset, fetchProducts]);

  const fetchInitialProducts = useCallback(() => {
    hasFetchedRef.current = false;
    hasFetchedBackgroundRef.current = false;
    setOffset(0);
    setHasMore(true);
    fetchProducts(0, INITIAL_PAGE_SIZE, false);
  }, [fetchProducts]);

  const handleNavigate = (newPage: Page) => {
    if (newPage === Page.STORE) {
        setSelectedProduct(null);
    }
    // Clear search when navigating away from the store
    if (page === Page.STORE && newPage !== Page.STORE) {
        setSearchQuery('');
    }
    setPage(newPage);
    window.scrollTo(0,0);
  };

  const handleWizardComplete = (recommendedProducts: Product[]) => {
    const recommendedIds = new Set(recommendedProducts.map(p => p.title));
    const taggedProducts: Product[] = recommendedProducts.map(p => ({ ...p, tag: 'Recommended for You' }));
    
    const otherProducts = (products ?? []).filter(p => !recommendedIds.has(p.title));

    setProducts([...taggedProducts, ...otherProducts]);
    setIsWizardOpen(false);
    setPage(Page.STORE);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setPage(Page.DETAIL);
    window.scrollTo(0, 0);
  };

  const handleBackToStore = () => {
    setSelectedProduct(null);
    setPage(Page.STORE);
  };

  const renderContent = () => {
    if (error && products.length === 0) {
       return (
           <div className="flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl font-semibold text-red-400">Something went wrong</h2>
            <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2 max-w-md">{error}</p>
            <button
              onClick={fetchInitialProducts}
              className="mt-8 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        );
    }

    const showSkeleton = isLoading && products.length === 0;

    switch (page) {
      case Page.STORE:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case Page.USED_PARTS:
        return <UsedPartsPage />;
      case Page.DETAIL:
        return selectedProduct ? <ProductDetailPage product={selectedProduct} onBack={handleBackToStore} onViewDetails={handleViewDetails} onNavigate={handleNavigate} /> : <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      default:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isIntroComplete && <IntroAnimation />}
      </AnimatePresence>
      <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 transition-opacity duration-500 ${isIntroComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-7xl mx-auto flex flex-col z-10">
          <Header onNavigate={handleNavigate} currentPage={page} onSearch={setSearchQuery} searchQuery={searchQuery} />
          <main className="flex-grow flex items-start justify-center mt-6">
            <Suspense fallback={<div className="flex-grow flex items-center justify-center h-[50vh]"><LoadingSpinner /></div>}>
              {renderContent()}
            </Suspense>
          </main>
        </div>
        <RecommendationWizard 
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      </div>
    </>
  );
};

export default App;