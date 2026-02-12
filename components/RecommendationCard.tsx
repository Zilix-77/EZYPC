import React from 'react';
import { Product } from '../types';
import LazyImage from './LazyImage';
// FIX: Import Variants type from framer-motion to resolve type error.
import { motion, Variants } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
}

// FIX: Explicitly type cardVariants with Variants to fix type incompatibility.
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { type, title, rationale, estimatedPriceINR, components, imageUrl, tag, isBestMatch } = product;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(estimatedPriceINR);

  const keySpecs = components.filter(c => ['Processor', 'Graphics Card', 'RAM', 'Storage'].includes(c.name)).slice(0, 4);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-surface dark:bg-dark-surface rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10 hover:border-on-surface/20 dark:hover:border-dark-on-surface/20 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden group hover:scale-[1.03] hover:shadow-2xl shadow-black/5"
    >
      <div>
        <div className="aspect-video w-full">
           <LazyImage 
            src={imageUrl} 
            alt={title}
           />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary font-medium pt-1">{type}</span>
            <div className="flex items-center flex-wrap justify-end gap-2">
              {tag && (
                <div className="bg-accent/20 text-accent text-xs font-bold inline-block py-1 px-2 rounded-full">
                  {tag}
                </div>
              )}
               {isBestMatch && (
                <div className="bg-primary/20 text-primary dark:bg-dark-primary/20 dark:text-dark-primary text-xs font-bold inline-block py-1 px-2 rounded-full">
                  Best Match
                </div>
              )}
            </div>
          </div>
          <h3 className="text-xl font-bold text-on-surface dark:text-dark-on-surface mb-2 min-h-[56px]">{title}</h3>
          <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-4 min-h-[80px]">{rationale}</p>
        
          <div className="space-y-2 mb-6">
              {keySpecs.map((comp, index) => (
                  <div key={index} className="flex justify-between text-sm">
                      <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary">{comp.name}</p>
                      <p className="font-semibold text-on-surface dark:text-dark-on-surface text-right">{comp.spec}</p>
                  </div>
              ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <p className="text-2xl font-bold text-primary dark:text-dark-primary text-right mb-4">{formattedPrice}</p>
        <button
          onClick={onViewDetails}
          className="w-full block text-center bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors duration-200"
        >
          View Details
        </button>
      </div>

    </motion.div>
  );
};

export default ProductCard;