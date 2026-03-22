import React, { useState } from 'react';
import { UseCase, Question, Answer, Product } from '../types';
import { QUESTIONS } from '../constants';
import { getPCRecommendation } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (products: Product[]) => void;
}

type WizardStep = 'SELECT_USE_CASE' | 'ASK_QUESTIONS' | 'GENERATING' | 'ERROR';

const GamepadIcon = () => ( 
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4m-2-2v4m7-2h.01m2-2h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const BookIcon = () => ( 
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20M4 19.5V4a2 2 0 012-2h14v15L6.5 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ComputerIcon = () => ( 
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RecommendationWizard: React.FC<RecommendationWizardProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState<WizardStep>('SELECT_USE_CASE');
    const [useCase, setUseCase] = useState<UseCase | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleStart = (selectedUseCase: UseCase) => {
        setUseCase(selectedUseCase);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setStep('ASK_QUESTIONS');
    };

    const handleAnswer = async (answer: string) => {
        if (!useCase) return;
        const currentQuestion = QUESTIONS[useCase][currentQuestionIndex];
        const newAnswers = [...answers, { question: currentQuestion.question, answer }];
        setAnswers(newAnswers);

        if (currentQuestionIndex < QUESTIONS[useCase].length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setStep('GENERATING');
            try {
                const result = await getPCRecommendation(useCase, newAnswers);
                if (result && result.recommendations) {
                    onComplete(result.recommendations);
                    resetAndClose();
                } else {
                    setError('Could not get valid recommendations.');
                    setStep('ERROR');
                }
            } catch (e) {
                console.error(e);
                setError('An error occurred. Please check your AI service and try again.');
                setStep('ERROR');
            }
        }
    };
    
    const resetAndClose = () => {
        setStep('SELECT_USE_CASE');
        setUseCase(null);
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setError(null);
        onClose();
    };

    const renderStepContent = () => {
        switch (step) {
            case 'SELECT_USE_CASE':
                const useCases = [
                    { id: UseCase.GAMING, label: 'Gaming', icon: <GamepadIcon /> },
                    { id: UseCase.STUDENT, label: 'Academic', icon: <BookIcon /> },
                    { id: UseCase.GENERAL, label: 'Daily Use', icon: <ComputerIcon /> },
                ];
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase mb-4 block text-center" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Step 01</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-center text-on-surface uppercase tracking-tighter mb-12 leading-tight" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                            What is your <br />primary focus?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {useCases.map(({ id, label, icon }) => (
                                <button 
                                    key={id} 
                                    onClick={() => handleStart(id)} 
                                    className="group flex flex-col items-center justify-center p-10 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 bg-white dark:bg-black"
                                >
                                    <div className="text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors mb-6 scale-125">
                                        {icon}
                                    </div>
                                    <span className="text-xs font-black tracking-widest uppercase text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'ASK_QUESTIONS':
                 if (!useCase) return null;
                 const questions = QUESTIONS[useCase];
                 const progress = (currentQuestionIndex + 1) / questions.length;
                 return (
                    <motion.div 
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-[10px] font-black tracking-[0.4em] text-black/40 dark:text-white/40 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                                Question {currentQuestionIndex + 1}/{questions.length}
                            </span>
                            <div className="w-32 h-[2px] bg-black/5 dark:bg-white/5 relative">
                                <motion.div 
                                    className="absolute left-0 top-0 h-full bg-black dark:bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl font-black text-on-surface mb-12 uppercase tracking-tighter leading-tight" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                            {questions[currentQuestionIndex].question}
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {questions[currentQuestionIndex].options.map((option, idx) => (
                                <button 
                                    key={option} 
                                    onClick={() => handleAnswer(option)} 
                                    className="group flex justify-between items-center p-6 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 bg-white dark:bg-black text-left"
                                >
                                    <span className="text-sm font-black uppercase tracking-wider text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                                        {option}
                                    </span>
                                    <span className="text-[10px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.3em]">0{idx + 1}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                 );
            case 'GENERATING':
                return (
                    <div className="flex flex-col items-center justify-center text-center p-20">
                        <div className="w-16 h-16 relative">
                            <motion.div 
                                className="absolute inset-0 border-2 border-black/10 dark:border-white/10"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                            <motion.div 
                                className="absolute inset-0 border-t-2 border-black dark:border-white"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            />
                        </div>
                        <h2 className="text-xs font-black tracking-[0.4em] mt-12 text-black/40 dark:text-white/40 uppercase" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
                            Analyzing configurations
                        </h2>
                    </div>
                );
            case 'ERROR':
                 return (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                        <span className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase mb-4" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Error Detected</span>
                        <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter mb-4" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Operation Failed</h2>
                        <p className="text-xs text-on-surface-secondary mt-2 max-w-sm mb-12 uppercase tracking-widest">{error}</p>
                        <button 
                            onClick={resetAndClose} 
                            className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black text-xs font-black tracking-widest uppercase hover:scale-105 transition-transform"
                            style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                        >
                            Return Home
                        </button>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm"
                onClick={resetAndClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-black w-full h-full sm:h-auto sm:max-w-4xl sm:min-h-[600px] flex flex-col justify-center p-8 sm:p-24 overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={resetAndClose}
                    className="absolute top-8 right-8 text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white p-2 transition-colors uppercase text-[10px] font-black tracking-widest"
                    style={{ fontFamily: '"Host Grotesk", sans-serif' }}
                >
                    Close [ESC]
                </button>
                {renderStepContent()}
            </motion.div>
        </div>
    );
};

export default RecommendationWizard;