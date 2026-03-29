import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Plus, Search, X, LayoutGrid, List, Mic } from 'lucide-react';
import { Note, Theme } from '../types';
import { formatDate, highlightText } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun } from 'lucide-react';

interface SubjectDetailProps {
  subject: string;
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onBack: () => void;
  onCreateNote: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  theme: Theme;
  onToggleTheme: () => void;
}

export function SubjectDetail({ 
  subject, 
  notes, 
  onNoteClick, 
  onBack, 
  onCreateNote,
  onSearch,
  searchQuery,
  theme,
  onToggleTheme
}: SubjectDetailProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[var(--bg-app)] flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--bg-card)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div 
              key="search-bar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search in this subject..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full bg-[var(--bg-app)] border-none rounded-full py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
              </div>
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  onSearch('');
                }}
                className="p-2 text-amber-600"
              >
                <X size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="normal-header"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2 text-amber-900 dark:text-amber-100">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-xl font-black text-amber-900 dark:text-amber-100 tracking-tight">{subject}</h1>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{notes.length} Notes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onToggleTheme}
                  className="p-2 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button 
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
                  title={viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
                >
                  {viewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
                </button>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
                >
                  <Search size={20} />
                </button>
                <button 
                  onClick={onCreateNote}
                  className="p-2 bg-amber-600 text-white rounded-full shadow-lg active:scale-95 transition-transform hover:bg-amber-700"
                >
                  <Plus size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notes List */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-400 opacity-60">
            <BookOpen size={48} className="mb-4" />
            <p>{searchQuery ? 'No matching notes found.' : 'No notes in this subject yet.'}</p>
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
            {filteredNotes.map((note) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => onNoteClick(note)}
                  className={`w-full text-left bg-[var(--bg-card)] rounded-[2rem] shadow-sm border border-[var(--border-color)] hover:shadow-md active:scale-[0.98] transition-all flex flex-col ${viewMode === 'list' ? 'p-5' : 'p-4 h-full'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-amber-400 font-mono">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <h3 className={`font-bold text-[var(--text-primary)] mb-2 leading-tight ${viewMode === 'list' ? 'text-xl' : 'text-base line-clamp-2'}`}>
                    {highlightText(note.title, searchQuery)}
                  </h3>
                  <p className={`text-sm text-amber-700/80 dark:text-gray-400 leading-relaxed font-serif ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3 flex-1'}`}>
                    {highlightText(note.content, searchQuery)}
                  </p>
                  
                  {note.voiceNotes.length > 0 && (
                    <div className="mt-3 flex items-center gap-1 text-amber-500 dark:text-amber-400">
                      <Mic size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {note.voiceNotes.length} {viewMode === 'list' ? 'Voice Notes' : ''}
                      </span>
                    </div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
