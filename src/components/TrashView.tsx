import React, { useState } from 'react';
import { ArrowLeft, Trash2, RotateCcw, BookOpen } from 'lucide-react';
import { Note, Theme } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { Moon, Sun } from 'lucide-react';

interface TrashViewProps {
  notes: Note[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function TrashView({ notes, onBack, onRestore, onPermanentDelete, theme, onToggleTheme }: TrashViewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-[var(--bg-app)] flex flex-col z-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-amber-900 dark:text-amber-100">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-amber-900 dark:text-amber-100 tracking-tight">Trash</h1>
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{notes.length} Deleted Notes</p>
        </div>
        <button 
          onClick={onToggleTheme}
          className="p-2 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Notes List */}
      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-400 opacity-60">
            <Trash2 size={48} className="mb-4" />
            <p className="font-bold">Trash is empty</p>
          </div>
        ) : (
          notes.map((note) => (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-card)] p-5 rounded-[2rem] shadow-sm border border-[var(--border-color)]"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-amber-400 font-mono">
                  Deleted {note.deletedAt ? formatDate(note.deletedAt) : 'recently'}
                </span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                  {note.subject}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 leading-tight">
                {note.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 font-serif">
                {note.content}
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => onRestore(note.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(note.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </main>

      <ConfirmationModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          if (showDeleteConfirm) {
            onPermanentDelete(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }
        }}
        title="Permanently Delete?"
        message="This action cannot be undone. The note will be gone forever."
        confirmText="Delete Forever"
        type="danger"
      />
    </div>
  );
}
