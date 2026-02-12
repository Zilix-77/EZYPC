import React from 'react';
// FIX: Import Variants type from framer-motion to resolve type error.
import { motion, Variants } from 'framer-motion';
import AnimatedLogo from './AnimatedLogo';

// FIX: Explicitly type with Variants to prevent type inference issues.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.4,
      delayChildren: 1.2,
    },
  },
};

// FIX: Explicitly type with Variants to prevent type inference issues.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 12,
    },
  },
};


const IntroAnimation: React.FC = () => {
    return (
        <motion.div
            className="fixed inset-0 bg-base dark:bg-dark-base z-50 flex items-center justify-center"
            initial="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-4"
            >
                <AnimatedLogo />
                <motion.h1 
                    variants={itemVariants} 
                    className="text-4xl font-bold text-on-surface dark:text-dark-on-surface"
                >
                    EZYPC
                </motion.h1>
            </motion.div>
        </motion.div>
    );
};

export default IntroAnimation;