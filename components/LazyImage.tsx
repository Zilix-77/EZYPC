import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full h-full bg-surface dark:bg-dark-surface overflow-hidden ${className}`}>
      {/* Shimmer Placeholder */}
      <div 
        className={`absolute inset-0 bg-base dark:bg-dark-base animate-pulse transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;