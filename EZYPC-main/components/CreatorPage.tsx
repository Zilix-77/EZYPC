import React from 'react';
import TiltedCard from './TiltedCard';
import { motion } from 'framer-motion';
import GlassSurface from './GlassSurface';

const CreatorPage: React.FC = () => {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center mb-16"
      >
        <span className="text-[10px] font-black tracking-[0.5em] text-black/40 dark:text-white/40 uppercase mb-4 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>The Mind Behind</span>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-on-surface uppercase mb-8" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
            Meet the Creator.
        </h1>
      </motion.div>

      <div className="relative group">
        <div className="absolute -inset-20 bg-primary/10 dark:bg-dark-primary/5 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
        
        <TiltedCard
          imageSrc="https://picsum.photos/600/600?random=creator"
          altText="Creator Profile"
          captionText="@ezypc_admin"
          containerHeight="500px"
          containerWidth="400px"
          imageHeight="400px"
          imageWidth="400px"
          rotateAmplitude={12}
          scaleOnHover={1.05}
          showTooltip={true}
          displayOverlayContent={true}
          overlayContent={
            <div className="p-6 w-full h-full flex flex-col justify-end">
               <GlassSurface 
                 width="100%" 
                 height="auto" 
                 borderRadius={15} 
                 backgroundOpacity={0.4} 
                 className="p-6 border border-white/20"
               >
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-white uppercase mb-1" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Adarsh</h3>
                    <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase mb-4">Lead Developer & Designer</p>
                    <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                    >
                        Follow on Instagram
                    </a>
                  </div>
               </GlassSurface>
            </div>
          }
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 max-w-2xl text-center"
      >
        <p className="text-lg text-on-surface-secondary leading-relaxed">
            Building the future of PC selection through AI and premium design. Focused on creating seamless, aesthetic experiences for the tech community.
        </p>
      </motion.div>
    </div>
  );
};

export default CreatorPage;
