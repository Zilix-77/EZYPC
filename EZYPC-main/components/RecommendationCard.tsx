import React from 'react';
import { Product } from '../types';
import LazyImage from './LazyImage';
// FIX: Import Variants type from framer-motion to resolve type error.
import { motion, Variants } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
  /** Optional index for staggered entrance (e.g. index * 0.05s). */
  staggerIndex?: number;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      delay: i * 0.06,
      ease: [0.22, 0.61, 0.36, 1],
    },
  }),
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, staggerIndex = 0 }) => {
  const { type, title, rationale, estimatedPriceINR, components, imageUrl, tag, isBestMatch } = product;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(estimatedPriceINR);

  const keySpecs = (components ?? []).filter(c => ['Processor', 'Graphics Card', 'RAM', 'Storage'].includes(c.name)).slice(0, 4);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      custom={staggerIndex}
      viewport={{ once: true, amount: 0.12 }}
      onClick={onViewDetails}
      className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 flex flex-col h-full cursor-pointer group transition-all duration-500 hover:border-black dark:hover:border-white hover:scale-95 origin-center"
    >
      <div className="relative aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
         <LazyImage 
          src={imageUrl} 
          alt={title}
         />
         {(tag || isBestMatch) && (
             <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {isBestMatch && (
                     <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black tracking-widest px-3 py-1 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                         BEST MATCH
                     </span>
                 )}
                 {tag && (
                     <span className="bg-white/90 dark:bg-black/90 text-black dark:text-white text-[10px] font-black tracking-widest px-3 py-1 border border-black/10 dark:border-white/10 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                         {tag}
                     </span>
                 )}
             </div>
         )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                {type}
            </span>
            <span className="text-lg font-black tracking-tighter text-black dark:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                {formattedPrice}
            </span>
        </div>

        <h3 className="text-2xl font-black tracking-tighter text-black dark:text-white mb-4 uppercase leading-none" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
            {title}
        </h3>
        
        <p className="text-xs text-black/60 dark:text-white/60 mb-8 line-clamp-2 leading-relaxed font-medium">
            {rationale}
        </p>

        <div className="mt-auto space-y-3 pt-6 border-t border-black/5 dark:border-white/5">
            {keySpecs.map((comp, index) => (
                <div key={index} className="flex justify-between items-center text-[10px]">
                    <span className="font-black tracking-widest text-black/30 dark:text-white/30 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{comp.name}</span>
                    <span className="font-bold text-black dark:text-white uppercase tracking-wider">{comp.spec}</span>
                </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;