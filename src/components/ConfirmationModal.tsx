import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border-color)]"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${
                  type === 'danger' ? 'bg-red-500/10 text-red-500' : 
                  type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
              </div>
              
              <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-all ${
                    type === 'danger' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                    'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  }`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-app)] active:scale-[0.98] transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
