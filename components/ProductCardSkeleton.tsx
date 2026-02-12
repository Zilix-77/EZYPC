import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10 overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-base dark:bg-dark-base"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-1/4"></div>
          <div className="h-5 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded-full w-1/3"></div>
        </div>
        <div className="h-6 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-full mb-2"></div>
        <div className="h-6 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-3/4 mb-6"></div>
        
        <div className="space-y-3 mb-8">
          <div className="h-4 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-full"></div>
          <div className="h-4 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-full"></div>
          <div className="h-4 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-full"></div>
        </div>
        
        <div className="flex justify-end items-center mb-4">
            <div className="h-8 bg-on-surface/5 dark:bg-dark-on-surface/5 rounded w-1/3"></div>
        </div>
        <div className="h-12 bg-primary/20 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;