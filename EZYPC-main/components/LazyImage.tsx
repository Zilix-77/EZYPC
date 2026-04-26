import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isPlaceholder = !src || src.includes('unsplash.com') || src.includes('picsum.photos');

  return (
    <div className={`relative w-full h-full overflow-hidden ${className ?? ''}`}>
      {(!imageLoaded || isPlaceholder) && (
        <div className="absolute inset-0 animate-pulse bg-black/5 dark:bg-white/5 rounded-t-xl" />
      )}

      {!isPlaceholder && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full min-h-[12rem] object-cover rounded-t-xl transition-opacity duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;