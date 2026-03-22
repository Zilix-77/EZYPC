import React, { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
  [key: string]: any;
}

const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const hasAnimatedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    let iteration = 0;

    const startAnimation = () => {
      setIsRevealing(true);
      interval = setInterval(() => {
        setDisplayText((prevText) =>
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (iteration > maxIterations) return text[index];
              if (sequential) {
                if (index < iteration / (maxIterations / text.length)) return text[index];
              } else {
                if (Math.random() < iteration / maxIterations) return text[index];
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('')
        );

        iteration++;
        if (iteration > maxIterations) {
          clearInterval(interval);
          setIsRevealing(false);
        }
      }, speed);
    };

    if (animateOn === 'view') {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            startAnimation();
          }
        }, { threshold: 0.1 });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }

    if (animateOn === 'hover' && isHovering && !isRevealing) {
        startAnimation();
    }

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters, sequential, isHovering, animateOn]);

  return (
    <div 
        ref={containerRef}
        className={`inline-block whitespace-pre-wrap ${parentClassName}`} 
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...props}
    >
      <span className={isRevealing ? encryptedClassName : className}>
        {displayText}
      </span>
    </div>
  );
};

export default DecryptedText;
