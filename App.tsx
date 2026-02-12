import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Page, Product } from './types';
import Header from './components/Header';
import { getPopularProducts } from './services/geminiService';
import IntroAnimation from './components/IntroAnimation';
import RecommendationWizard from './components/RecommendationWizard';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';

// Performance: Lazy load page components
const StorePage = lazy(() => import('./components/StorePage'));
const UsedPartsPage = lazy(() => import('./components/UsedPartsPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));

const App: React.FC = () => {
  useTheme(); // Initialize and manage theme
  const [page, setPage] = useState<Page>(Page.STORE);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isIntroComplete, setIntroComplete] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIntroComplete(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Performance: Preload components for faster navigation after intro
  useEffect(() => {
    if (isIntroComplete) {
      import('./components/UsedPartsPage');
      import('./components/ProductDetailPage');
    }
  }, [isIntroComplete]);


  const fetchInitialProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPopularProducts();
      if (result && result.recommendations) {
        setProducts(result.recommendations);
      } else {
        setError('Could not load products. Please try again later.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching products. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(isIntroComplete) {
      fetchInitialProducts();
    }
  }, [fetchInitialProducts, isIntroComplete]);

  const handleNavigate = (newPage: Page) => {
    if (newPage === Page.STORE) {
        setSelectedProduct(null);
    }
    setPage(newPage);
    window.scrollTo(0,0);
  };

  const handleWizardComplete = (recommendedProducts: Product[]) => {
    const recommendedIds = new Set(recommendedProducts.map(p => p.title));
    const taggedProducts: Product[] = recommendedProducts.map(p => ({ ...p, tag: 'Recommended for You' }));
    
    const otherProducts = products.filter(p => !recommendedIds.has(p.title));

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
              className="mt-8 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        );
    }

    const showSkeleton = isLoading && products.length === 0;

    switch (page) {
      case Page.STORE:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} />;
      case Page.USED_PARTS:
        return <UsedPartsPage />;
      case Page.DETAIL:
        return selectedProduct ? <ProductDetailPage product={selectedProduct} onBack={handleBackToStore} onViewDetails={handleViewDetails} onNavigate={handleNavigate} /> : <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} />;
      default:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isIntroComplete && <IntroAnimation />}
      </AnimatePresence>
      <div className={`min-h-screen bg-base dark:bg-dark-base flex flex-col items-center p-4 sm:p-6 transition-opacity duration-200 ${isIntroComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-7xl mx-auto flex flex-col z-10">
          <Header onNavigate={handleNavigate} currentPage={page} />
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