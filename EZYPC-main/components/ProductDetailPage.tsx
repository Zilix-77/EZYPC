import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Page, PriceHistoryData } from '../types';
import LazyImage from './LazyImage';
import { AnimatePresence, motion } from 'framer-motion';
import GlassSurface from './GlassSurface';
import { usedPartsData } from '../data/usedPartsData';
import CircularGallery from './CircularGallery';

interface ProductDetailPageProps {
  product: Product;
  products: Product[];
  onBack: () => void;
  onViewDetails: (product: Product) => void;
  onNavigate: (page: Page) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, products, onBack, onViewDetails, onNavigate }) => {
  const { type, title, rationale, estimatedPriceINR, components, purchaseOptions, imageUrl } = product;
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredData, setHoveredData] = useState<PriceHistoryData | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sortedPurchaseOptions = useMemo(() => {
    return [...(purchaseOptions || [])].sort((a, b) => a.price - b.price);
  }, [purchaseOptions]);

  const lowestPrice = sortedPurchaseOptions[0]?.price || estimatedPriceINR;

  const usedMatch = useMemo(() => {
    return usedPartsData.find(up => 
        title.toLowerCase().includes(up.component.toLowerCase()) || 
        up.component.toLowerCase().split(' ').some(word => word.length > 3 && title.toLowerCase().includes(word))
    );
  }, [title]);

  const galleryItems = useMemo(() => {
    return products
        .filter(p => p.id !== product.id && p.type === product.type)
        .slice(0, 8)
        .map(p => ({
            image: p.imageUrl,
            text: p.title
        }));
  }, [products, product]);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(estimatedPriceINR);

  // Fake price history data
  const priceData: PriceHistoryData[] = [
    { month: 'Oct', price: lowestPrice * 1.15 },
    { month: 'Nov', price: lowestPrice * 1.12 },
    { month: 'Dec', price: lowestPrice * 1.20 },
    { month: 'Jan', price: lowestPrice * 1.05 },
    { month: 'Feb', price: lowestPrice * 1.08 },
    { month: 'Mar', price: lowestPrice },
  ];

  const maxPrice = Math.max(...priceData.map(d => d.price));
  const minPrice = Math.min(...priceData.map(d => d.price));

  return (
    <div className="w-full max-w-7xl mx-auto pb-64">
       <AnimatePresence>
            {isScrolled && (
                 <motion.button
                    onClick={onBack}
                    className="fixed top-24 left-8 z-50 text-[10px] font-black tracking-widest uppercase transition-transform"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                >
                    <GlassSurface 
                        width={120} 
                        height={50} 
                        borderRadius={0} 
                        backgroundOpacity={0.9} 
                        brightness={100}
                        className="border border-white/40 bg-white text-black shadow-2xl"
                    >
                        Return
                    </GlassSurface>
                 </motion.button>
            )}
        </AnimatePresence>

      <div className="mb-12">
        <button onClick={onBack} className="group outline-none">
            <GlassSurface 
                width="auto" 
                height="auto" 
                borderRadius={0} 
                backgroundOpacity={0.05} 
                className="px-8 py-4 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all"
            >
                <div className="flex items-center gap-6">
                    <div className="w-8 h-[1px] bg-black/40 dark:bg-white/40 group-hover:w-12 group-hover:bg-black dark:group-hover:bg-white transition-all" />
                    <span className="text-[10px] font-black tracking-[0.3em] text-black dark:text-white uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Back to Store</span>
                </div>
            </GlassSurface>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-32">
        <div className="lg:col-span-7">
          <div className="overflow-hidden bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5">
            <LazyImage src={imageUrl} alt={title} className="w-full h-full object-cover aspect-[4/3]" />
          </div>

          {usedMatch && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-8 bg-green-500/10 border border-green-500/20 flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 flex items-center justify-center rounded-sm">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <div>
                          <p className="text-[10px] font-black tracking-widest text-green-600 dark:text-green-400 uppercase mb-1">Cheaper Option Available</p>
                          <h4 className="text-lg font-black tracking-tighter uppercase text-on-surface">Available on Used Parts</h4>
                      </div>
                  </div>
                  <button 
                    onClick={() => onNavigate(Page.USED_PARTS)}
                    className="px-8 py-4 bg-green-500 text-white text-[10px] font-black tracking-widest uppercase hover:bg-green-600 transition-colors"
                  >
                    View for ₹{new Intl.NumberFormat('en-IN').format(usedMatch.price)}
                  </button>
              </motion.div>
          )}
          
          <div className="mt-24 space-y-24">
              <section>
                <div className="flex justify-between items-end mb-8">
                    <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Price History</span>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">-12% from Oct</span>
                </div>
                <div className="relative w-full h-48 border-b border-black/5 dark:border-white/5 group/chart">
                    <AnimatePresence>
                        {hoveredData && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-0 right-0 p-4 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md z-10"
                            >
                                <p className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1">{hoveredData.month}</p>
                                <p className="text-sm font-black text-on-surface dark:text-dark-on-surface">₹{new Intl.NumberFormat('en-IN').format(hoveredData.price)}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" className="text-black dark:text-white" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-black dark:text-white" />
                            </linearGradient>
                        </defs>
                        <motion.path 
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={`M ${priceData.map((d, i) => `${(i / (priceData.length - 1)) * 100} ${100 - ((d.price - minPrice * 0.9) / (maxPrice - minPrice * 0.9)) * 80}`).join(' L ')}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                            className="text-black dark:text-white"
                        />
                        <motion.path 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            d={`M ${priceData.map((d, i) => `${(i / (priceData.length - 1)) * 100} ${100 - ((d.price - minPrice * 0.9) / (maxPrice - minPrice * 0.9)) * 80}`).join(' L ')} L 100 100 L 0 100 Z`}
                            fill="url(#chartGradient)"
                            className="text-black dark:text-white"
                        />
                        {priceData.map((d, i) => (
                            <React.Fragment key={i}>
                                <motion.circle 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: hoveredData?.month === d.month ? 3 : 1 }}
                                    transition={{ duration: 0.2 }}
                                    cx={(i / (priceData.length - 1)) * 100}
                                    cy={100 - ((d.price - minPrice * 0.9) / (maxPrice - minPrice * 0.9)) * 80}
                                    r="1.2"
                                    fill="currentColor"
                                    className="text-black dark:text-white pointer-events-none"
                                />
                                {/* Hover detection area */}
                                <rect 
                                    x={`${(i / (priceData.length - 1)) * 100 - 5}`}
                                    y="0"
                                    width="10"
                                    height="100"
                                    fill="transparent"
                                    className="cursor-crosshair"
                                    onMouseEnter={() => setHoveredData(d)}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
                            </React.Fragment>
                        ))}
                    </svg>
                    <div className="flex justify-between mt-4">
                        {priceData.map((d, i) => (
                            <span key={i} className="text-[8px] font-black text-black/20 dark:text-white/20 uppercase tracking-widest">{d.month}</span>
                        ))}
                    </div>
                </div>
              </section>

              <section>
                <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-8 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Specifications</span>
                <div className="grid grid-cols-1 gap-0 border-t border-black/10 dark:border-white/10">
                    {components.map((comp, index) => (
                      <div key={index} className="py-6 flex justify-between items-center border-b border-black/10 dark:border-white/10">
                        <span className="text-[10px] font-black tracking-widest text-black/30 dark:text-white/30 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{comp.name}</span>
                        <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider text-right">{comp.spec}</span>
                      </div>
                    ))}
                </div>
              </section>

              <section>
                <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-8 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Expert Analysis</span>
                <p className="text-xl font-medium leading-relaxed text-black/80 dark:text-white/80">
                  {rationale}
                </p>
              </section>
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="sticky top-32 space-y-12">
              <div>
                <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-4 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{type}</span>
                <h1 className="text-5xl font-black tracking-tighter text-black dark:text-white uppercase leading-[0.9] mb-6" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{title}</h1>
                <div className="text-3xl font-black tracking-tight text-black dark:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                    {formattedPrice}
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Retail Stock</span>
                {sortedPurchaseOptions.length > 0 ? (
                  <div className="space-y-4">
                    {sortedPurchaseOptions.map((option, index) => (
                      <a 
                        key={index}
                        href={option.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-6 border transition-all group ${index === 0 ? 'border-green-500/30 bg-green-500/[0.03] dark:bg-green-500/[0.05]' : 'border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-black dark:hover:border-white'}`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black tracking-widest text-black/30 dark:text-white/30 uppercase block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Retailer</span>
                             {index === 0 && <span className="text-[8px] font-black bg-green-500 text-white px-1.5 py-0.5 uppercase tracking-widest">Best Price</span>}
                          </div>
                          <span className="text-sm font-bold text-black dark:text-white uppercase">{option.vendor}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-sm font-black text-black dark:text-white block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(option.price)}
                           </span>
                           <span className={`text-[10px] font-black uppercase tracking-widest mt-1 block ${index === 0 ? 'text-green-500' : 'text-primary dark:text-dark-primary'}`}>Buy Now</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-center">
                    <p className="text-xs font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Out of Stock</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* 3D OGL Circular Gallery Recommendations */}
      {galleryItems.length > 0 && (
          <section className="mt-48 pt-24 border-t border-black/10 dark:border-white/10 overflow-hidden">
              <span className="text-[10px] font-black tracking-[0.5em] text-black/40 dark:text-white/40 uppercase mb-8 block text-center" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Visual Match Suggestions</span>
              <div className="w-full h-[500px] relative">
                  <CircularGallery 
                    items={galleryItems} 
                    bend={3} 
                    textColor="#888888" 
                    borderRadius={0.05} 
                    font="bold 24px 'Host Grotesk'" 
                  />
              </div>
          </section>
      )}
    </div>
  );
};

export default ProductDetailPage;