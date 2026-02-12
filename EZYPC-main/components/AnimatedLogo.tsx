import React from 'react';
import { motion, Variants } from 'framer-motion';

const AnimatedLogo: React.FC = () => {
  const caseVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  const fanVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8,
        duration: 0.5,
      },
    },
  };

  return (
    <div className="w-10 h-10 text-primary dark:text-dark-primary">
      <motion.svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
        className="w-full h-full"
      >
        {/* Case outline */}
        <motion.path
          d="M6 2 H 34 A 2 2 0 0 1 36 4 V 36 A 2 2 0 0 1 34 38 H 6 A 2 2 0 0 1 4 36 V 4 A 2 2 0 0 1 6 2 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          variants={caseVariants}
        />
        
        {/* Glass panel line */}
        <motion.path
          d="M18 4 V 36"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          variants={caseVariants}
        />

        {/* Fans */}
        <motion.g variants={fanVariants}>
          {/* Top Fan */}
          <g transform="translate(26, 12)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ delay: 1.2, duration: 2.5, repeat: Infinity, ease: 'linear' }}
            >
              <path d="M 0 -5 L 1.5 -1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M 5 0 L 1.5 1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M 0 5 L -1.5 1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M -5 0 L -1.5 -1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
            </motion.g>
            <circle cx="0" cy="0" r="1.5" fill="black" />
          </g>

          {/* Bottom Fan */}
          <g transform="translate(26, 28)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ delay: 1.3, duration: 2.5, repeat: Infinity, ease: 'linear' }}
            >
              <path d="M 0 -5 L 1.5 -1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M 5 0 L 1.5 1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M 0 5 L -1.5 1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
              <path d="M -5 0 L -1.5 -1.5 L 0 0 Z" fill="currentColor" opacity="0.8" />
            </motion.g>
            <circle cx="0" cy="0" r="1.5" fill="black" />
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default AnimatedLogo;