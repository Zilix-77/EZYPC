
import React from 'react';

const AnimatedLogo: React.FC = () => {
  return (
    <div className="w-8 h-8">
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rgb-glow {
          0% { stroke: #ff4d4d; }
          33% { stroke: #4dff4d; }
          66% { stroke: #4d4dff; }
          100% { stroke: #ff4d4d; }
        }
        .fan-blades {
          animation: rotate 2s linear infinite;
          transform-origin: center;
        }
        .rgb-ring {
          animation: rgb-glow 4s linear infinite;
        }
      `}</style>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Case outline */}
        <path d="M6 2 H 34 A 2 2 0 0 1 36 4 V 36 A 2 2 0 0 1 34 38 H 6 A 2 2 0 0 1 4 36 V 4 A 2 2 0 0 1 6 2 Z" stroke="#a8a8a8" strokeWidth="1.5" />
        {/* Glass panel */}
        <path d="M18 4 V 36" stroke="#a8a8a8" strokeWidth="1" strokeDasharray="2 2" />

        {/* Top Fan */}
        <g transform="translate(26, 12)">
            <circle cx="0" cy="0" r="6" fill="#1a1a1a" />
            <g className="fan-blades">
                <path d="M 0 -5 L 2.5 -2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M 5 0 L 2.5 2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M 0 5 L -2.5 2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M -5 0 L -2.5 -2.5 L 0 0 Z" fill="#8daaa1" />
            </g>
            <circle cx="0" cy="0" r="1.5" fill="#242424" />
            <circle className="rgb-ring" cx="0" cy="0" r="6" stroke="#c89b7b" strokeWidth="1" fill="none" />
        </g>

        {/* Bottom Fan */}
        <g transform="translate(26, 28)">
            <circle cx="0" cy="0" r="6" fill="#1a1a1a" />
             <g className="fan-blades" style={{ animationDelay: '-0.5s' }}>
                <path d="M 0 -5 L 2.5 -2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M 5 0 L 2.5 2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M 0 5 L -2.5 2.5 L 0 0 Z" fill="#8daaa1" />
                <path d="M -5 0 L -2.5 -2.5 L 0 0 Z" fill="#8daaa1" />
            </g>
            <circle cx="0" cy="0" r="1.5" fill="#242424" />
            <circle className="rgb-ring" cx="0" cy="0" r="6" stroke="#c89b7b" strokeWidth="1" fill="none" style={{ animationDelay: '-1s' }} />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedLogo;
