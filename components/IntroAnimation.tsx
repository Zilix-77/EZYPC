import React from 'react';
import { motion } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';

const IntroAnimation: React.FC = () => {
    return (
        <motion.div
            className="fixed inset-0 bg-base dark:bg-dark-base z-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col items-center gap-4"
            >
                <AnimatedLogo />
                <h1 className="text-4xl font-bold text-on-surface dark:text-dark-on-surface">EZYPC</h1>
            </motion.div>
        </motion.div>
    );
};

export default IntroAnimation;