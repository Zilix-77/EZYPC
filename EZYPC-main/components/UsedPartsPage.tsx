import React from 'react';
import { usedPartsData } from '../data/usedPartsData';
import { UsedPart } from '../types';
// FIX: Import Variants type from framer-motion to resolve type error.
import { motion, Variants } from 'framer-motion';
import LazyImage from './LazyImage';

const gradeMapping = {
    A: { label: 'Grade A', description: 'Like new condition', color: 'bg-green-500/20 text-green-400' },
    B: { label: 'Grade B', description: 'Excellent condition, minor signs of use', color: 'bg-yellow-500/20 text-yellow-400' },
    C: { label: 'Grade C', description: 'Good condition, visible wear', color: 'bg-orange-500/20 text-orange-400' },
};

// FIX: Explicitly type cardVariants with Variants to fix type incompatibility.
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
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
          className="bg-surface dark:bg-dark-surface rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10 flex flex-col h-full overflow-hidden group transition-all duration-300 hover:border-on-surface/20 dark:hover:border-dark-on-surface/20 hover:scale-[1.03] hover:shadow-2xl shadow-black/5"
        >
            <div className="aspect-video w-full">
                <LazyImage src={part.imageUrl} alt={part.component} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                     <span className={`text-xs font-bold py-1 px-2 rounded-full ${gradeInfo.color}`}>{gradeInfo.label}</span>
                     <div className="text-right">
                        <p className="font-semibold text-on-surface-secondary dark:text-dark-on-surface-secondary text-sm">{part.condition}</p>
                     </div>
                </div>
                <h3 className="text-lg font-bold text-on-surface dark:text-dark-on-surface mb-2 flex-grow">{part.component}</h3>
                <p className="text-sm text-on-surface-secondary dark:text-dark-on-surface-secondary mb-4">{part.details}</p>
                <div className="mt-auto">
                    <p className="text-2xl font-bold text-primary dark:text-dark-primary text-right mb-4">{formattedPrice}</p>
                    <button className="w-full block text-center bg-accent text-black font-semibold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors duration-200">
                        Inquire in Store
                    </button>
                </div>
            </div>
        </motion.div>
    );
}


const UsedPartsPage: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-on-surface dark:text-dark-on-surface">EZYPC Certified Pre-Owned</h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-on-surface-secondary dark:text-dark-on-surface-secondary">
                Quality components, tested and certified by our in-house experts. Get great performance for less.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {usedPartsData.map((part) => (
                <UsedPartCard key={part.id} part={part} />
            ))}
        </div>

        <div className="text-center mt-12 border-t border-on-surface/10 dark:border-dark-on-surface/10 pt-8">
             <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">Have Parts to Sell?</h2>
             <p className="mt-2 text-on-surface-secondary dark:text-dark-on-surface-secondary">Visit our store for a quote on our trade-in program.</p>
            <button className="mt-6 bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-colors duration-200">
                Learn About Trade-Ins
            </button>
        </div>
    </div>
  );
};

export default UsedPartsPage;