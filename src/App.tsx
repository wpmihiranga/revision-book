import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Book, Moon, Sun, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { Note, AppScreen, Theme } from './types';
import { NoteEditor } from './components/NoteEditor';
import { NoteReader, SwipeableImageViewer } from './components/NoteReader';
import { SubjectDetail } from './components/SubjectDetail';
import { TrashView } from './components/TrashView';
import { cn, highlightText } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    notes, 
    deletedNotes,
    loading, 
    addNote, 
    updateNote, 
    deleteNote, 
    moveToTrash,
    restoreNote,
    permanentDeleteNote,
    renameSubject 
  } = useNotes();
  
  // Navigation State
  const [navStack, setNavStack] = useState<NavState[]>([{ screen: 'home' }]);
  const currentNav = navStack[navStack.length - 1];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('revisionbook-theme');
    return (saved as Theme) || 'light';
  });

  // Sync with browser history
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && Array.isArray(e.state.stack)) {
        setNavStack(e.state.stack);
      } else {
        setNavStack([{ screen: 'home' }]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Initial state
    window.history.replaceState({ stack: [{ screen: 'home' }] }, '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pushNav = (next: NavState) => {
    const newStack = [...navStack, next];
    setNavStack(newStack);
    window.history.pushState({ stack: newStack }, '');
  };

  const handleBack = () => {
    if (navStack.length > 1) {
      window.history.back();
    }
  };

  // Apply theme to body
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('revisionbook-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const subjects = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      counts[note.subject] = (counts[note.subject] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) || 
      n.subject.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const handleCreateNote = (subject?: string) => {
    pushNav({ screen: 'edit', selectedSubject: subject || null });
  };

  const handleEditNote = (note: Note) => {
    pushNav({ screen: 'edit', selectedNote: note });
  };

  const handleOpenReader = (note: Note) => {
    pushNav({ screen: 'reader', selectedNote: note });
  };

  const handleOpenImageViewer = (index: number) => {
    pushNav({ 
      screen: 'imageViewer', 
      selectedNote: currentNav.selectedNote, 
      selectedImageIndex: index 
    });
  };

  const handleSaveNote = (note: Note) => {
    const existing = notes.find(n => n.id === note.id);
    if (existing) {
      updateNote(note);
    } else {
      addNote(note);
    }
    handleBack();
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    handleBack();
  };

  const handleSubjectClick = (subject: string) => {
    pushNav({ screen: 'subjectDetail', selectedSubject: subject });
  };

  const handleRenameSubject = (oldName: string) => {
    if (!newSubjectName.trim() || newSubjectName === oldName) {
      setIsRenaming(null);
      return;
    }
    renameSubject(oldName, newSubjectName);
    setIsRenaming(null);
    setNewSubjectName('');
  };

  if (loading) {
    return (
      <div className="h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="text-center">
          <Book className="w-12 h-12 text-amber-600 animate-bounce mx-auto mb-4" />
          <p className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-sm">Loading RevisionBook...</p>
        </div>
      </div>
    );
  }

  const showSearch = currentNav.screen === 'home';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-amber-200 transition-colors duration-300">
      {/* Global Header with Search (Only on Home) */}
      {showSearch && (
        <header className="sticky top-0 z-50 bg-[var(--bg-card)]/80 backdrop-blur-md px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div onClick={() => setNavStack([{ screen: 'home' }])} className="cursor-pointer">
              <h1 className="text-xl font-black text-amber-900 dark:text-amber-500 tracking-tight">RevisionBook</h1>
              <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">O/A Level Study Hub</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 bg-[var(--bg-app)] text-amber-700 dark:text-amber-500 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search notes, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-app)] border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-[var(--text-secondary)]/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400"
                >
                  <Plus className="rotate-45" size={16} />
                </button>
              )}
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-sm font-bold text-amber-600 uppercase tracking-wider hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </header>
      )}

      {/* Search Results Overlay (Only on Home) */}
      {searchQuery.trim() !== '' && currentNav.screen === 'home' && (
        <div className="fixed inset-0 z-40 bg-[var(--bg-app)] pt-32 overflow-y-auto px-6 pb-24">
          <div className="max-w-md mx-auto">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-6">Search Results ({filteredNotes.length})</h2>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-4 text-amber-200" />
                <p>No notes found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => {
                      handleOpenReader(note);
                      setSearchQuery('');
                    }}
                    className="w-full text-left bg-[var(--bg-card)] p-5 rounded-[2rem] shadow-sm border border-[var(--border-color)] hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                        {highlightText(note.subject, searchQuery)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                      {highlightText(note.title, searchQuery)}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 font-serif">
                      {highlightText(note.content, searchQuery)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Home Screen (Subject List) */}
      <div className={cn("max-w-md mx-auto pb-24", (currentNav.screen !== 'home') && 'hidden')}>
        <div className="px-6 py-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Subjects</h2>
            <p className="text-[var(--text-secondary)] text-sm">Select a subject to view your revision notes.</p>
          </div>
          {deletedNotes.length > 0 && (
            <button 
              onClick={() => pushNav({ screen: 'trash' })}
              className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors relative"
              title="Trash"
            >
              <Trash2 size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {deletedNotes.length}
              </span>
            </button>
          )}
        </div>

        <main className="px-6 space-y-4">
          {subjects.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)]">
                <Plus className="text-amber-200" size={40} />
              </div>
              <p className="text-[var(--text-secondary)] font-medium">No notes yet. Start writing!</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.name} className="relative group">
                {isRenaming === subject.name ? (
                  <div className="bg-[var(--bg-card)] p-4 rounded-[2rem] border-2 border-amber-500 shadow-lg flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubject(subject.name)}
                      className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30"
                      placeholder="New subject name..."
                    />
                    <button 
                      onClick={() => handleRenameSubject(subject.name)}
                      className="p-2 bg-amber-600 text-white rounded-full active:scale-90 transition-transform"
                    >
                      <Plus className="rotate-0" size={18} />
                    </button>
                    <button 
                      onClick={() => setIsRenaming(null)}
                      className="p-2 bg-[var(--bg-app)] text-[var(--text-secondary)] rounded-full active:scale-90 transition-transform"
                    >
                      <Plus className="rotate-45" size={18} />
                    </button>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left bg-[var(--bg-card)] p-6 rounded-[2rem] shadow-sm border border-[var(--border-color)] flex items-center justify-between group transition-all"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handleSubjectClick(subject.name)}>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-amber-600 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                        {subject.count} {subject.count === 1 ? 'Note' : 'Notes'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRenaming(subject.name);
                          setNewSubjectName(subject.name);
                        }}
                        className="p-2 text-[var(--text-secondary)] hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 size={18} />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </main>

        <button
          onClick={() => handleCreateNote()}
          className="fixed bottom-8 right-8 w-16 h-16 bg-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-20"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Overlays */}
      <AnimatePresence mode="wait">
        {currentNav.screen === 'subjectDetail' && currentNav.selectedSubject && (
          <motion.div
            key="subject-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-20"
          >
            <SubjectDetail 
              subject={currentNav.selectedSubject}
              notes={notes.filter(n => n.subject === currentNav.selectedSubject)}
              onBack={handleBack}
              onNoteClick={handleOpenReader}
              onCreateNote={() => handleCreateNote(currentNav.selectedSubject!)}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}

        {currentNav.screen === 'edit' && (
          <motion.div
            key="edit-screen"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50"
          >
            <NoteEditor 
              note={currentNav.selectedNote || null} 
              initialSubject={currentNav.selectedSubject || undefined}
              existingSubjects={subjects.map(s => s.name)}
              onSave={handleSaveNote} 
              onDelete={handleDeleteNote}
              onBack={handleBack} 
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}

        {currentNav.screen === 'reader' && currentNav.selectedNote && (
          <motion.div
            key="reader-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-20"
          >
            <NoteReader 
              note={currentNav.selectedNote} 
              onBack={handleBack}
              onEdit={() => handleEditNote(currentNav.selectedNote!)}
              onDelete={handleDeleteNote}
              onOpenImageViewer={handleOpenImageViewer}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}

        {currentNav.screen === 'trash' && (
          <motion.div
            key="trash-screen"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-20"
          >
            <TrashView 
              notes={deletedNotes}
              onBack={handleBack}
              onRestore={restoreNote}
              onPermanentDelete={permanentDeleteNote}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}

        {currentNav.screen === 'imageViewer' && currentNav.selectedNote && (
          <motion.div
            key="image-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <SwipeableImageViewer 
              images={currentNav.selectedNote.images}
              initialIndex={currentNav.selectedImageIndex || 0}
              onClose={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavState {
  screen: AppScreen;
  selectedNote?: Note | null;
  selectedSubject?: string | null;
  selectedImageIndex?: number | null;
}
