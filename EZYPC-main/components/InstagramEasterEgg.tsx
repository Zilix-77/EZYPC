import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltedCard from './TiltedCard';

const InstagramEasterEgg: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleTrigger = () => setIsVisible(true);
        window.addEventListener('trigger-easter-egg', handleTrigger);
        return () => window.removeEventListener('trigger-easter-egg', handleTrigger);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8" onClick={() => setIsVisible(false)}>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                className="relative max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-12 text-center">
                    <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase mb-4 block">Found an Easter Egg</span>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Creator ID</h2>
                </div>

                <TiltedCard
                    imageSrc="https://picsum.photos/400/600?random=inst"
                    altText="Instagram Profile"
                    captionText="Follow on Instagram"
                    containerHeight="500px"
                    containerWidth="100%"
                    imageHeight="450px"
                    imageWidth="320px"
                    rotateAmplitude={20}
                    scaleOnHover={1.05}
                    showTooltip={true}
                    displayOverlayContent={true}
                    overlayContent={
                        <div className="p-8 h-full flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent rounded-[15px] pointer-events-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black border border-white/20" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase text-xs tracking-widest">Adarsh</h3>
                                    <p className="text-white/40 text-[8px] font-bold tracking-widest uppercase">@adar.sshhh__</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.open('https://instagram.com/adar.sshhh__', '_blank')}
                                className="pointer-events-auto px-6 py-3 bg-white text-black text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform"
                            >
                                Visit Profile
                            </button>
                        </div>
                    }
                />

                <button 
                    onClick={() => setIsVisible(false)}
                    className="mt-12 w-full py-4 border border-white/10 text-white/40 text-[10px] font-black tracking-widest uppercase hover:text-white hover:border-white transition-all"
                >
                    Dismiss
                </button>
            </motion.div>
        </div>
    );
};

export default InstagramEasterEgg;
