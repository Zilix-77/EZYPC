
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface ChromaGridItem {
    image: string;
    title: string;
    borderColor: string;
}

interface ChromaGridProps {
    items: ChromaGridItem[];
    radius?: number;
    damping?: number;
    fadeOut?: number;
}

const ChromaGrid: React.FC<ChromaGridProps> = ({ 
    items, 
    radius = 200, 
    damping = 0.1,
    fadeOut = 0.5 
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(Infinity);
    const mouseY = useMotionValue(Infinity);

    const springConfig = { damping: 100, stiffness: 100, mass: 0.1 };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (gridRef.current) {
                const rect = gridRef.current.getBoundingClientRect();
                mouseX.set(e.clientX - rect.left);
                mouseY.set(e.clientY - rect.top);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div 
            ref={gridRef}
            className="absolute inset-0 z-0"
        >
            {items.map((item, i) => {
                const angle = (i / items.length) * 2 * Math.PI;
                const x = Math.cos(angle) * radius + radius;
                const y = Math.sin(angle) * radius + radius;

                return <GridItem 
                    key={i} 
                    x={x} 
                    y={y} 
                    mouseX={mouseX} 
                    mouseY={mouseY}
                    item={item}
                    damping={damping}
                    fadeOut={fadeOut}
                    springConfig={springConfig}
                />
            })}
        </div>
    );
};

interface GridItemProps {
    x: number;
    y: number;
    mouseX: any;
    mouseY: any;
    item: ChromaGridItem;
    damping: number;
    fadeOut: number;
    springConfig: object;
}

const GridItem: React.FC<GridItemProps> = ({ x, y, mouseX, mouseY, item, damping, fadeOut, springConfig }) => {
    const [isHovered, setIsHovered] = useState(false);
    const dx = useMotionValue(0);
    const dy = useMotionValue(0);
    const distance = useMotionValue(0);

    const springX = useSpring(dx, springConfig);
    const springY = useSpring(dy, springConfig);
    
    useEffect(() => {
        const unsubscribeX = mouseX.onChange((newMouseX: number) => {
            const newDx = newMouseX === Infinity ? 0 : (newMouseX - x) * damping;
            dx.set(newDx);
        });
        const unsubscribeY = mouseY.onChange((newMouseY: number) => {
            const newDy = newMouseY === Infinity ? 0 : (newMouseY - y) * damping;
            dy.set(newDy);
        });

        const unsubscribeDistance = mouseX.onChange((newMouseX: number) => {
            if (newMouseX === Infinity) {
                distance.set(Infinity);
                return;
            }
            const newMouseY = mouseY.get();
            const newDist = Math.sqrt(Math.pow(newMouseX - x, 2) + Math.pow(newMouseY - y, 2));
            distance.set(newDist);
        });
        
        return () => {
            unsubscribeX();
            unsubscribeY();
            unsubscribeDistance();
        };

    }, [mouseX, mouseY, x, y, dx, dy, distance, damping]);

    return (
        <motion.div
            style={{ 
                left: x, 
                top: y,
                translateX: springX,
                translateY: springY,
                opacity: distance.get() > 300 ? fadeOut : 1,
            }}
            className="absolute w-24 h-24 rounded-full bg-surface/50 backdrop-blur-md p-1 flex items-center justify-center transition-opacity"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300"
                style={{
                   borderColor: item.borderColor,
                   borderWidth: isHovered ? '2px' : '1px'
                }}
            >
                <img src={item.image} alt={item.title} className="w-full h-full object-cover scale-110" />
            </div>
            {isHovered && <span className="absolute -bottom-6 text-sm text-on-surface-secondary">{item.title}</span>}
        </motion.div>
    );
};

export default ChromaGrid;
