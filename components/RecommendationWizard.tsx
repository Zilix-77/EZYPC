import React, { useState } from 'react';
import { UseCase, Question, Answer, Product } from '../types';
import { QUESTIONS } from '../constants';
import { getPCRecommendation } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface RecommendationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (products: Product[]) => void;
}

type WizardStep = 'SELECT_USE_CASE' | 'ASK_QUESTIONS' | 'GENERATING' | 'ERROR';

const GamepadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 7a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm16.586 2.414a1 1 0 010 1.414l-2.829 2.829a1 1 0 01-1.414 0l-2.828-2.829a1 1 0 111.414-1.414L14 11.586l1.172-1.172a1 1 0 011.414 0zM3.414 9.414a1 1 0 011.414 0L6 10.586l1.172-1.172a1 1 0 111.414 1.414L7.414 12l1.172 1.172a1 1 0 11-1.414 1.414L6 13.414l-1.172 1.172a1 1 0 01-1.414-1.414L4.586 12 3.414 10.828a1 1 0 010-1.414z" /></svg> );
const BookIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg> );
const ComputerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.492a.75.75 0 01-.734.958H6.83a.75.75 0 01-.734-.958l.123-.492H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg> );

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
                setError('An error occurred. Please check your API key and try again.');
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
                    { id: UseCase.STUDENT, label: 'For Studies', icon: <BookIcon /> },
                    { id: UseCase.GENERAL, label: 'General Use', icon: <ComputerIcon /> },
                ];
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-on-surface dark:text-dark-on-surface mb-2">What will you use this PC for?</h2>
                        <p className="text-center text-on-surface-secondary dark:text-dark-on-surface-secondary mb-8">This helps us narrow down the options for you.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {useCases.map(({ id, label, icon }) => (
                                <button key={id} onClick={() => handleStart(id)} className="group bg-surface/50 dark:bg-dark-surface/50 p-6 rounded-xl border border-on-surface/10 dark:border-dark-on-surface/10 hover:border-primary transition-colors flex flex-col items-center justify-center text-on-surface-secondary dark:text-dark-on-surface-secondary hover:text-primary">
                                    {icon}
                                    <span className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'ASK_QUESTIONS':
                 if (!useCase) return null;
                 const questions = QUESTIONS[useCase];
                 const progress = (currentQuestionIndex + 1) / questions.length;
                 return (
                    <div>
                        <div className="w-full bg-surface/50 dark:bg-dark-surface/50 rounded-full h-2 mb-6">
                            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }}></div>
                        </div>
                        <h2 className="text-2xl font-semibold text-on-surface dark:text-dark-on-surface text-center mb-6">{questions[currentQuestionIndex].question}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {questions[currentQuestionIndex].options.map(option => (
                                <button key={option} onClick={() => handleAnswer(option)} className="bg-surface/50 dark:bg-dark-surface/50 text-on-surface dark:text-dark-on-surface p-4 rounded-lg border border-on-surface/10 dark:border-dark-on-surface/10 hover:border-primary transition-colors text-left">
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                 );
            case 'GENERATING':
                return (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <LoadingSpinner />
                        <h2 className="text-xl font-semibold mt-6 text-on-surface dark:text-dark-on-surface">Crafting your recommendations...</h2>
                    </div>
                );
            case 'ERROR':
                 return (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
                        <p className="text-on-surface-secondary dark:text-dark-on-surface-secondary mt-2 max-w-sm">{error}</p>
                        <button onClick={resetAndClose} className="mt-6 bg-primary text-base font-semibold py-2 px-6 rounded-lg">
                            Close
                        </button>
                    </div>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={resetAndClose}>
            <div className="bg-surface dark:bg-dark-surface border border-on-surface/10 dark:border-dark-on-surface/10 rounded-2xl w-full max-w-3xl shadow-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
                {renderStepContent()}
            </div>
        </div>
    );
};

export default RecommendationWizard;