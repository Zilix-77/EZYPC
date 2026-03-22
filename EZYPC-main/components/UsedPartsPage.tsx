import React from 'react';
import { usedPartsData } from '../data/usedPartsData';
import { UsedPart } from '../types';
import { motion, Variants } from 'framer-motion';
import LazyImage from './LazyImage';

const gradeMapping = {
    A: { label: 'Grade A', description: 'Mint', color: 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40' },
    B: { label: 'Grade B', description: 'Excellent', color: 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40' },
    C: { label: 'Grade C', description: 'Good', color: 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40' },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const UsedPartCard: React.FC<{ part: UsedPart }> = ({ part }) => {
    const gradeInfo = gradeMapping[part.grade];
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(part.price);

    return (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="group flex flex-col h-full border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A0A] hover:border-black dark:hover:border-white transition-all duration-500 overflow-hidden"
        >
            <div className="aspect-[4/3] w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                <LazyImage src={part.imageUrl} alt={part.component} className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-6">
                     <span className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{gradeInfo.label}</span>
                     <span className="text-[10px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{part.condition}</span>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-dark-on-surface mb-2 uppercase tracking-tighter leading-tight" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{part.component}</h3>
                <p className="text-xs text-black/40 dark:text-white/40 mb-8 uppercase tracking-widest font-bold" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{part.details}</p>
                <div className="mt-auto pt-8 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                    <span className="text-2xl font-black text-black dark:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>{formattedPrice}</span>
                    <button className="text-[10px] font-black tracking-widest uppercase text-black dark:text-white p-2 hover:scale-105 transition-transform" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                        Inquire
                    </button>
                </div>
            </div>
        </motion.div>
    );
}


const UsedPartsPage: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto pb-32">
        <div className="text-center mb-24">
            <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-4 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Pre-Owned Selection</span>
            <h1 className="text-6xl sm:text-8xl font-black text-on-surface dark:text-dark-on-surface uppercase tracking-tighter leading-none mb-8" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Certified <br />Performance</h1>
            <p className="max-w-xl mx-auto text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 font-bold leading-relaxed" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                Tested and certified components. High performance computing at a reduced carbon footprint.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {usedPartsData.map((part) => (
                <UsedPartCard key={part.id} part={part} />
            ))}
        </div>

        <div className="mt-48 text-center p-20 border border-black/10 dark:border-white/10 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black dark:bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
             <div className="relative z-10">
                <h2 className="text-4xl font-black text-on-surface dark:text-dark-on-surface uppercase tracking-tighter mb-4 group-hover:text-white dark:group-hover:text-black transition-colors" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Have Parts to Sell?</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 group-hover:text-white/60 dark:group-hover:text-black/60 transition-colors mb-12" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Join our trade-in program for a direct quote.</p>
                <button className="px-12 py-5 border border-black dark:border-white text-on-surface dark:text-dark-on-surface uppercase text-[10px] font-black tracking-widest group-hover:bg-white dark:group-hover:bg-black group-hover:text-black dark:group-hover:text-white group-hover:border-transparent transition-all duration-500" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                    Learn About Trade-Ins
                </button>
             </div>
        </div>
    </div>
  );
};

export default UsedPartsPage;