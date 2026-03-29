import React, { useState } from 'react';
import { X, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string) => Promise<void>;
  onSignUp: (email: string, displayName: string) => Promise<void>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignUp }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await onSignIn(email);
      } else {
        await onSignUp(email, displayName);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-card)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-color)]"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-amber-900 dark:text-amber-100 tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                {mode === 'signin' ? 'Sign in to your account' : 'Join RevisionBook today'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-[var(--bg-app)] text-amber-900 dark:text-amber-100 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex bg-[var(--bg-app)] p-1 rounded-2xl mb-8">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'signin' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-amber-600/60 hover:text-amber-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'signup' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-amber-600/60 hover:text-amber-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-xs font-medium leading-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-4">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[var(--bg-app)] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Migration:</strong> Signing up will migrate all your current guest notes to your new account.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{mode === 'signin' ? 'Sign In' : 'Sign Up & Migrate'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
