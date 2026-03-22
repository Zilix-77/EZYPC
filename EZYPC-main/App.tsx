import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Page, Product, User } from './types';
import Header from './components/Header';
import { getProductsPage } from './services/aiService';
import IntroAnimation from './components/IntroAnimation';
import RecommendationWizard from './components/RecommendationWizard';
import LoadingSpinner from './components/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import SpotlightBackground from './components/SpotlightBackground';
import ClickSpark from './components/ClickSpark';

const INITIAL_PAGE_SIZE = 36;
const NEXT_BATCH_SIZE = 100;

// Performance: Lazy load page components
const StorePage = lazy(() => import('./components/StorePage'));
const UsedPartsPage = lazy(() => import('./components/UsedPartsPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const CreatorPage = lazy(() => import('./components/CreatorPage'));
const SellProductPage = lazy(() => import('./components/SellProductView'));
const SignInPage = lazy(() => import('./components/SignInPage'));

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const hasFetchedRef = useRef(false);
  const hasFetchedBackgroundRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = useCallback(async (pageOffset: number, limit: number, append: boolean) => {
    if (append) setError(null);
    else { setIsLoading(true); setError(null); }
    try {
      const result = await getProductsPage(pageOffset, limit);
      if (!result) return;
      const fetched = result.recommendations ?? [];
      setHasMore(result.hasMore ?? false);
      setOffset(pageOffset + fetched.length);
      if (append) {
        setProducts((prev) => {
          const byKey = (p: Product) => p.id ?? p.title;
          const existingKeys = new Set(prev.map(byKey));
          const unique = fetched.filter((p) => !existingKeys.has(byKey(p)));
          return [...prev, ...unique];
        });
      } else setProducts(fetched);
    } catch (e) {
      if (!append) setError('An error occurred while fetching products.');
    } finally {
      if (!append) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isIntroComplete || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProducts(0, INITIAL_PAGE_SIZE, false);
  }, [isIntroComplete, fetchProducts]);

  useEffect(() => {
    if (!isIntroComplete || !hasMore || isLoading || products.length < INITIAL_PAGE_SIZE) return;
    if (hasFetchedBackgroundRef.current) return;
    hasFetchedBackgroundRef.current = true;
    fetchProducts(INITIAL_PAGE_SIZE, NEXT_BATCH_SIZE, true);
  }, [isIntroComplete, isLoading, products.length, hasMore, fetchProducts]);

  const handleNavigate = (newPage: Page) => {
    if (newPage === Page.STORE) setSelectedProduct(null);
    if (page === Page.STORE && newPage !== Page.STORE) setSearchQuery('');
    setPage(newPage);
    window.scrollTo(0,0);
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

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    setPage(user.role === 'ADMIN' ? Page.ADMIN_DASHBOARD : Page.STORE);
    window.scrollTo(0, 0);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setPage(Page.STORE);
  };

  // Tracking search for logged in users
  useEffect(() => {
    if (currentUser && searchQuery.length > 3) {
        const timer = setTimeout(() => {
            setCurrentUser(prev => prev ? ({
                ...prev,
                lastSearches: [...new Set([searchQuery, ...prev.lastSearches])].slice(0, 5)
            }) : null);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [searchQuery, currentUser]);

  const renderContent = () => {
    const showSkeleton = isLoading && products.length === 0;
    switch (page) {
      case Page.STORE:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case Page.USED_PARTS:
        return <UsedPartsPage onNavigate={handleNavigate} isLoggedIn={!!currentUser} isAdmin={currentUser?.role === 'ADMIN'} />;
      case Page.DETAIL:
        return selectedProduct ? <ProductDetailPage product={selectedProduct} products={products} onBack={handleBackToStore} onViewDetails={handleViewDetails} onNavigate={handleNavigate} /> : <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case Page.CREATOR:
        return <CreatorPage />;
      case Page.SELL:
        return <SellProductPage onBack={handleBackToStore} />;
      case Page.SIGN_IN:
      case Page.SIGN_UP:
        return <SignInPage onBack={handleBackToStore} onSignIn={handleSignIn} mode={page === Page.SIGN_UP ? 'signup' : 'signin'} onToggleMode={(m) => setPage(m === 'signup' ? Page.SIGN_UP : Page.SIGN_IN)} />;
      case Page.ADMIN_DASHBOARD:
        return <div className="p-20 text-center uppercase font-black text-4xl">Admin Dashboard (Coming Soon)</div>;
      default:
        return <StorePage products={products} onStartWizard={() => setIsWizardOpen(true)} onViewDetails={handleViewDetails} isLoading={showSkeleton} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  const { theme } = useTheme();

  return (
    <ClickSpark sparkColor={theme === 'dark' ? '#fff' : '#000'} sparkCount={6} sparkRadius={10} duration={400}>
      <SpotlightBackground />
      <AnimatePresence>{!isIntroComplete && <IntroAnimation />}</AnimatePresence>
      <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 transition-opacity duration-1000 ${isIntroComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-7xl mx-auto flex flex-col z-10">
          <Header onNavigate={handleNavigate} currentPage={page} onSearch={setSearchQuery} searchQuery={searchQuery} user={currentUser} onSignOut={handleSignOut} />
          <main className="flex-grow flex items-start justify-center mt-6">
            <Suspense fallback={<div className="flex-grow flex items-center justify-center h-[50vh]"><LoadingSpinner /></div>}>
              {renderContent()}
            </Suspense>
          </main>
        </div>
        <RecommendationWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} onComplete={(rp) => { setProducts(rp); setIsWizardOpen(false); setPage(Page.STORE); }} />
      </div>
    </ClickSpark>
  );
};

export default App;