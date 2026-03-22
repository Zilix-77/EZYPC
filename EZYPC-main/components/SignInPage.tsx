import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassSurface from './GlassSurface';
import { User } from '../types';

interface SignInPageProps {
  onBack: () => void;
  onSignIn: (user: User) => void;
  mode: 'signin' | 'signup';
  onToggleMode: (mode: 'signin' | 'signup') => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onBack, onSignIn, mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    
    // Admin Check
    const isAdmin = email.toLowerCase() === 'admin@ezypc.com';

    setTimeout(() => {
        onSignIn({
            id: Math.random().toString(36).substr(2, 9),
            email,
            role: isAdmin ? 'ADMIN' : 'USER',
            lastSearches: []
        });
    }, 1500);
  };

  if (status === 'success') {
    return (
        <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-8 text-on-surface dark:text-dark-on-surface">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">{mode === 'signin' ? 'Welcome Back' : 'Welcome to EZYPC'}</h1>
                <p className="opacity-60 mb-12">Session established. Redirecting...</p>
                <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
            </motion.div>
        </div>
    );
  }

  return (
    <div className="w-full max-md:max-w-md mx-auto py-32 px-6 flex flex-col items-center">
      <div className="mb-12 text-center max-w-sm">
        <span className="text-[10px] font-black tracking-[0.4em] text-black/20 dark:text-white/20 uppercase mb-4 block">Secure Portal</span>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface dark:text-dark-on-surface uppercase mb-4" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-xs font-bold leading-relaxed opacity-40 uppercase tracking-widest">
            {mode === 'signin' ? 'Access your saved builds and hardware preferences.' : 'Join the elite community of high-performance builders.'}
        </p>
      </div>

      <GlassSurface width={400} height="auto" borderRadius={20} backgroundOpacity={0.05} className="p-10 border border-black/10 dark:border-white/10">
        <form onSubmit={handleSubmit} className="space-y-8">
            {mode === 'signup' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Full Name</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-3 text-lg font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            )}
            <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Email Address</label>
                <input 
                    type="email" 
                    required 
                    className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-3 text-lg font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Password</label>
                <input 
                    type="password" 
                    required 
                    className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-3 text-lg font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                    placeholder="••••••••"
                />
            </div>

            <button 
                type="submit" 
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-transform"
            >
                {mode === 'signin' ? 'Authorize' : 'Create Account'}
            </button>
        </form>

        <div className="mt-8 text-center space-y-4">
            <button 
                onClick={() => onToggleMode(mode === 'signin' ? 'signup' : 'signin')} 
                className="text-[10px] font-black tracking-widest text-black dark:text-white uppercase opacity-40 hover:opacity-100 transition-opacity"
            >
                {mode === 'signin' ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
            </button>
            <div className="pt-4">
                <button onClick={onBack} className="text-[8px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase hover:text-black dark:hover:text-white transition-colors">Return to Store</button>
            </div>
        </div>
      </GlassSurface>
    </div>
  );
};

export default SignInPage;
