import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  scale?: number;
  isOpen?: boolean;
}

// Cabinet inner dims: x=30–110, y=20–140 (80×120)
// 2 fans of r=14, closer together for better visual balance
const FANS = [
  { cy: 50,  duration: 2.0, clockwise: true  },   // top fan — intake
  { cy: 100, duration: 2.5, clockwise: false },   // bottom fan — exhaust (reverse)
] as const;

const FAN_R  = 16;               // fan radius (increased for visibility)
const FAN_B  = 11;               // primary-blade half-length
const FAN_DB = 10;               // diagonal-blade half-length

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ scale = 1, isOpen = false }) => {
  return (
    <motion.div
      className="relative flex items-center justify-center overflow-visible"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: 140 * scale, height: 160 * scale }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-full blur-[40px] opacity-40" />

      <svg
        viewBox="0 0 140 160"
        className="w-full h-full text-black dark:text-white relative z-10 overflow-visible"
      >
        {/* ── Main Cabinet Chassis ── */}
        <motion.rect
          x="30" y="20" width="80" height="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Glass Side Panel Indicator */}
        <rect
          x="35" y="25" width="70" height="110"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />

        {/* ── Two Fans ── */}
        {FANS.map(({ cy, duration, clockwise }, i) => (
          <g key={i} transform={`translate(70, ${cy})`}>
            {/* Fan mounting ring */}
            <circle
              cx="0" cy="0" r={FAN_R}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />

            {/* Spinning blades - 4 blade design */}
            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: clockwise ? 360 : -360 }}
              transition={{ repeat: Infinity, duration, ease: 'linear' }}
            >
              {/* Four main blade spokes radiating from center */}
              <g>
                {/* Top blade */}
                <line x1="0" y1="0" x2="0" y2={-FAN_B} strokeWidth="2.2" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.8" />
                {/* Right blade */}
                <line x1="0" y1="0" x2={FAN_B} y2="0" strokeWidth="2.2" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.8" />
                {/* Bottom blade */}
                <line x1="0" y1="0" x2="0" y2={FAN_B} strokeWidth="2.2" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.8" />
                {/* Left blade */}
                <line x1="0" y1="0" x2={-FAN_B} y2="0" strokeWidth="2.2" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.8" />
              </g>
            </motion.g>

            {/* Fan hub */}
            <circle cx="0" cy="0" r="3.5" fill="currentColor" />
          </g>
        ))}

        {/* ── Front Panel Accent ── */}
        <line
          x1="110" y1="30" x2="110" y2="130"
          stroke="currentColor"
          strokeWidth="4"
          strokeOpacity="0.05"
        />

        {/* ── Power LED (below bottom fan, above cabinet base) ── */}
        <motion.circle
          cx="70" cy="137"
          r="1.5"
          className="fill-black dark:fill-white"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedLogo;
