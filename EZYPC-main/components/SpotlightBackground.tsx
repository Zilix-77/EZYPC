import React from 'react';
import { motion } from 'framer-motion';

const SpotlightBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-black overflow-hidden select-none pointer-events-none">
            {/* Subtle Grid */}
            <div 
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                style={{ 
                    backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Spotlight Effects */}
            <motion.div 
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]"
                animate={{ 
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"
                animate={{ 
                    x: [0, -40, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
};

export default SpotlightBackground;
