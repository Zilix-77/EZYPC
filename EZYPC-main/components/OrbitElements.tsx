import React from 'react';
import { motion } from 'framer-motion';

interface OrbitElementsProps {
  images: string[];
}

const OrbitElements: React.FC<OrbitElementsProps> = ({ images }) => {
  // Ultra tight orbit radius: A 180 40
  const path = "M 150 500 A 180 40 0 1 0 850 500 A 180 40 0 1 0 150 500";

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
        {images.map((src, index) => {
            const distance = (index / images.length) * 100;
            return (
                <motion.div
                    key={index}
                    className="absolute will-change-transform select-none"
                    style={{
                        width: '60px',
                        height: '60px',
                        offsetPath: `path("${path}")`,
                        offsetRotate: '0deg',
                        offsetAnchor: 'center center',
                    } as any}
                    animate={{
                        offsetDistance: [`${distance}%`, `${distance + 100}%`]
                    }}
                    transition={{
                        duration: 35,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div style={{ transform: 'rotate(0deg)' }}>
                        <img 
                            alt={`Featured component ${index + 1}`} 
                            src={src} 
                            className="w-full h-full object-contain transition-all duration-500 opacity-20 group-hover:opacity-100 dark:invert grayscale"
                            draggable="false"
                        />
                    </div>
                </motion.div>
            );
        })}
    </div>
  );
};

export default OrbitElements;
