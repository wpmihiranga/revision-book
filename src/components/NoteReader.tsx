import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Trash2, X, Maximize2, Image as ImageIcon, Mic, Music, Play, Pause, Volume2 } from 'lucide-react';
import { Note, Theme, VoiceNote } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { cn } from '../lib/utils';
import { Moon, Sun } from 'lucide-react';

interface NoteReaderProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onOpenImageViewer: (index: number) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function NoteReader({ note, onBack, onEdit, onDelete, onOpenImageViewer, theme, onToggleTheme }: NoteReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [selectedVoiceNote, setSelectedVoiceNote] = useState<VoiceNote | null>(null);

  useEffect(() => {
    const sections = note.content.split('\n\n');
    const groupedPages: string[] = [];
    let currentGroup = '';

    sections.forEach((section) => {
      if ((currentGroup + section).length > 800) {
        if (currentGroup) groupedPages.push(currentGroup);
        currentGroup = section;
      } else {
        currentGroup = currentGroup ? currentGroup + '\n\n' + section : section;
      }
    });
    if (currentGroup) groupedPages.push(currentGroup);
    
    setPages(groupedPages.length > 0 ? groupedPages : [note.content]);
  }, [note.content]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextPage();
    if (isRightSwipe) prevPage();
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-app)] flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-amber-900 dark:text-amber-100">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center truncate px-2">
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider">{note.subject}</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 truncate">{note.title}</p>
        </div>
        <div className="flex items-center gap-1">
          {note.images && note.images.length > 0 && (
            <button 
              onClick={() => onOpenImageViewer(0)}
              className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
              title="View Images"
            >
              <ImageIcon size={20} />
            </button>
          )}
          {note.voiceNotes && note.voiceNotes.length > 0 && (
            <button 
              onClick={() => setShowAudioPanel(true)}
              className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
              title="Voice Notes"
            >
              <Mic size={20} />
            </button>
          )}
          <button 
            onClick={onToggleTheme}
            className="p-2 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
          <button onClick={onEdit} className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors">
            <Edit3 size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 relative overflow-hidden bg-[var(--bg-app)]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: touchStart && touchEnd ? (touchStart > touchEnd ? 20 : -20) : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: touchStart && touchEnd ? (touchStart > touchEnd ? -20 : 20) : 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto px-6 py-8"
          >
            <div className="max-w-prose mx-auto">
              {currentPage === 0 && (
                <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-6 leading-tight">
                  {note.title}
                </h1>
              )}
              <div className="text-lg leading-relaxed text-[var(--text-primary)] font-serif whitespace-pre-wrap opacity-90">
                {pages[currentPage]}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Navigation */}
      <div className="px-4 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-sm flex items-center justify-between">
        <button 
          onClick={prevPage} 
          disabled={currentPage === 0}
          className="p-2 text-amber-900 dark:text-amber-100 disabled:opacity-20 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-1.5">
          {pages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentPage ? 'w-6 bg-amber-600 dark:bg-amber-400' : 'w-1.5 bg-amber-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={nextPage} 
          disabled={currentPage === pages.length - 1}
          className="p-2 text-amber-900 dark:text-amber-100 disabled:opacity-20 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Page Number Indicator */}
      <div className="absolute top-16 right-4 bg-amber-100/50 dark:bg-amber-900/30 px-2 py-1 rounded text-[10px] font-mono text-amber-800 dark:text-amber-200">
        PAGE {currentPage + 1} / {pages.length}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(note.id)}
        title="Delete Note?"
        message="Are you sure you want to move this note to trash? You can restore it later from the trash folder."
        confirmText="Delete"
        type="danger"
      />

      {/* Audio Panel */}
      <AnimatePresence>
        {showAudioPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAudioPanel(false);
                setSelectedVoiceNote(null);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] rounded-t-[2.5rem] shadow-2xl z-[70] max-h-[80vh] flex flex-col border-t border-[var(--border-color)]"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Voice Notes</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">{note.voiceNotes.length} Recordings</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAudioPanel(false);
                      setSelectedVoiceNote(null);
                    }}
                    className="p-2 bg-[var(--bg-app)] text-amber-900 dark:text-amber-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-6">
                  {note.voiceNotes.map((vn) => (
                    <button
                      key={vn.id}
                      onClick={() => setSelectedVoiceNote(vn)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                        selectedVoiceNote?.id === vn.id
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 shadow-sm"
                          : "bg-[var(--bg-app)] border-transparent hover:border-amber-100 dark:hover:border-amber-900/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        selectedVoiceNote?.id === vn.id ? "bg-amber-600 text-white" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      )}>
                        <Volume2 size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[var(--text-primary)]">Voice Note {vn.slotNumber}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {Math.floor(vn.duration / 60)}:{(vn.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      {selectedVoiceNote?.id === vn.id && (
                        <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>

                {selectedVoiceNote && (
                  <div className="mt-auto pt-6 border-t border-[var(--border-color)]">
                    <AudioPlayer 
                      voiceNote={selectedVoiceNote} 
                      onClose={() => setSelectedVoiceNote(null)} 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AudioPlayer({ voiceNote, onClose }: { voiceNote: VoiceNote, onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [voiceNote.id]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-3xl border border-amber-100 dark:border-amber-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center">
            <Music size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Now Playing</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-widest">Voice Note {voiceNote.slotNumber}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-amber-400 hover:text-amber-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2">
        <input 
          type="range"
          min="0"
          max={voiceNote.duration}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-amber-200 dark:bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />
        <div className="flex justify-between text-[10px] font-mono text-amber-700 dark:text-amber-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(voiceNote.duration)}</span>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button 
          onClick={togglePlay}
          className="w-14 h-14 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-600/20 active:scale-90 transition-transform"
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
        </button>
      </div>

      <audio 
        ref={audioRef}
        src={voiceNote.audioData}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

export function SwipeableImageViewer({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0, 200], [0, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.y) > 100) {
      onClose();
    }
  };

  const next = () => setIndex(prev => (prev + 1) % images.length);
  const prev = () => setIndex(prev => (prev - 1 + images.length) % images.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
    >
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <span className="text-white/70 text-sm font-bold">{index + 1} / {images.length}</span>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        className="w-full h-full flex items-center justify-center relative touch-none"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-full max-h-[80vh] object-contain"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-3 bg-white/10 rounded-full text-white backdrop-blur-md active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-3 bg-white/10 rounded-full text-white backdrop-blur-md active:scale-90 transition-transform"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </motion.div>
      
      <div className="absolute bottom-10 text-white/40 text-xs uppercase tracking-widest font-bold">
        Swipe down to close
      </div>
    </motion.div>
  );
}

