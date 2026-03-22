import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';

const IntroAnimation: React.FC = () => {
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Sequenced timing for premium feel
        const playSfx = () => {
             const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-low-sweep-reveal-1100.mp3');
             audio.volume = 0.5;
             audio.play().catch(e => console.log("Audio play blocked by browser."));
        };

        playSfx();
        const textTimer = setTimeout(() => setShowText(true), 1200);
        return () => clearTimeout(textTimer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 bg-white dark:bg-black z-[200] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: [0.8, 0, 0.2, 1] } }}
        >
            <div className="flex flex-col items-center relative overflow-visible">
                {/* Logo starts larger than header version and scales up subtly */}
                <AnimatedLogo scale={1.3} />

                <AnimatePresence>
                    {showText && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.05, filter: "blur(40px)", y: 20 }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col items-center mt-12 pointer-events-none"
                        >
                            {/* Larger, bold text with Host Grotesk */}
                            <h1 
                                className="text-8xl sm:text-[10rem] font-black tracking-tighter text-black dark:text-white uppercase leading-[0.8]"
                                style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                            >
                                EZYPC
                            </h1>
                            <p
                                className="text-black/40 dark:text-white/40 tracking-[0.5em] text-[10px] font-black uppercase mt-6"
                                style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                            >
                                PREMIUM COMPUTING
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default IntroAnimation;