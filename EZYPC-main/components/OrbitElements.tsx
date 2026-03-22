import React from 'react';
import { motion } from 'framer-motion';

interface OrbitElementsProps {
  images: string[];
}

const OrbitElements: React.FC<OrbitElementsProps> = ({ images }) => {
  // Exact path from user snippet: M 150 500 A 350 120 0 1 0 850 500 A 350 120 0 1 0 150 500
  const path = "M 150 500 A 350 120 0 1 0 850 500 A 350 120 0 1 0 150 500";

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center" style={{ transform: 'rotate(0deg)', transformOrigin: 'top center' }}>
        {images.map((src, index) => {
            const distance = (index / images.length) * 100;
            return (
                <motion.div
                    key={index}
                    className="absolute will-change-transform select-none"
                    style={{
                        width: '80px',
                        height: '80px',
                        offsetPath: `path("${path}")`,
                        offsetRotate: '0deg',
                        offsetAnchor: 'center center',
                    } as any}
                    animate={{
                        offsetDistance: [`${distance}%`, `${distance + 100}%`]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <div style={{ transform: 'rotate(0deg)' }}>
                        <img 
                            alt={`Featured component ${index + 1}`} 
                            src={src} 
                            className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
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
