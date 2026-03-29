import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Trash2, Mic, Image as ImageIcon, X, Plus, AlertCircle, Moon, Sun } from 'lucide-react';
import { Note, VoiceNote, Theme } from '../types';
import { VoiceRecorder, VoiceNotePlayer } from './VoiceNotes';
import { cn } from '../lib/utils';
import { ConfirmationModal } from './ConfirmationModal';

interface NoteEditorProps {
  note: Note | null;
  initialSubject?: string;
  existingSubjects?: string[];
  onSave: (note: Note) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function NoteEditor({ note, initialSubject, existingSubjects = [], onSave, onDelete, onBack, theme, onToggleTheme }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [subject, setSubject] = useState(note?.subject || initialSubject || '');
  const [content, setContent] = useState(note?.content || '');
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(note?.voiceNotes || []);
  const [images, setImages] = useState<string[]>(note?.images || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSubjects = existingSubjects.filter(s => 
    s.toLowerCase().includes(subject.toLowerCase()) && s.toLowerCase() !== subject.toLowerCase()
  );

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a title for your note');
      return;
    }
    
    const newNote: Note = {
      id: note?.id || Date.now().toString(),
      title,
      subject: subject || 'General',
      content,
      createdAt: note?.createdAt || Date.now(),
      updatedAt: Date.now(),
      voiceNotes,
      images
    };
    onSave(newNote);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remaining = 5 - images.length;
    const toUpload = Array.from(files as FileList).slice(0, remaining);
    
    toUpload.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const deleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVoiceNote = (audioData: string, duration: number) => {
    const newVoiceNote: VoiceNote = {
      id: Date.now().toString(),
      noteId: note?.id || 'temp',
      audioData,
      duration,
      slotNumber: voiceNotes.length + 1,
      createdAt: Date.now()
    };
    setVoiceNotes([...voiceNotes, newVoiceNote]);
  };

  const deleteVoiceNote = (id: string) => {
    setVoiceNotes(voiceNotes.filter(vn => vn.id !== id));
  };

  const hasChanges = () => {
    if (!note) {
      return title.trim() !== '' || content.trim() !== '' || voiceNotes.length > 0 || images.length > 0;
    }
    return title !== note.title || 
           subject !== (note.subject || initialSubject || '') || 
           content !== note.content || 
           voiceNotes.length !== note.voiceNotes.length || 
           images.length !== note.images.length;
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-app)] flex flex-col z-50">
      {/* Header */}
      <div className="bg-[var(--bg-card)] px-4 py-3 shadow-sm flex items-center justify-between border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button onClick={handleCancel} className="p-1 text-amber-900 dark:text-amber-100 flex items-center gap-1">
            <ArrowLeft size={24} />
            <span className="text-sm font-medium hidden sm:inline">Cancel</span>
          </button>
        </div>
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">
          {note ? 'Edit Note' : 'Create Note'}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleTheme}
            className="p-2 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={handleCancel}
            className="text-amber-600 dark:text-amber-400 px-3 py-1.5 text-sm font-bold sm:hidden"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-amber-600 dark:bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            Save
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest ml-1">Title</label>
          <input
            type="text"
            placeholder="e.g., Photosynthesis Basics"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-2xl px-4 py-3 text-lg font-bold text-[var(--text-primary)] focus:border-amber-400 focus:ring-0 transition-colors placeholder:text-amber-200 dark:placeholder:text-gray-600"
          />
        </div>

        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest ml-1">Subject</label>
          <input
            type="text"
            placeholder="e.g., Biology"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-2xl px-4 py-3 text-[var(--text-primary)] focus:border-amber-400 focus:ring-0 transition-colors placeholder:text-amber-200 dark:placeholder:text-gray-600"
          />
          {showSuggestions && filteredSubjects.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden">
              {filteredSubjects.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSubject(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 text-[var(--text-primary)] border-b last:border-0 border-[var(--border-color)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest ml-1">Content</label>
          <textarea
            placeholder="Start writing your revision notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-2xl px-4 py-3 text-[var(--text-primary)] focus:border-amber-400 focus:ring-0 transition-colors placeholder:text-amber-200 dark:placeholder:text-gray-600 resize-none font-serif leading-relaxed"
          />
        </div>

        {/* Images Section */}
        <div className="pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={16} />
              Images ({images.length}/5)
            </h3>
            {images.length < 5 && (
              <label className="cursor-pointer bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-transform">
                <Plus size={12} />
                Add Image
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-[var(--border-color)]">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button 
                  onClick={() => deleteImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Notes Section */}
        <div className="pt-4 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100 uppercase tracking-widest flex items-center gap-2">
              <Mic size={16} />
              Voice Notes ({voiceNotes.length}/5)
            </h3>
          </div>
          
          <div className="space-y-2">
            {voiceNotes.map(vn => (
              <VoiceNotePlayer 
                key={vn.id} 
                voiceNote={vn} 
                onDelete={deleteVoiceNote} 
              />
            ))}
          </div>

          <VoiceRecorder 
            onSave={addVoiceNote} 
            disabled={voiceNotes.length >= 5} 
          />
        </div>

        {note && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors mt-8"
          >
            <Trash2 size={20} />
            Delete Note
          </button>
        )}
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={onBack}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
        confirmText="Discard"
        type="warning"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (note) onDelete(note.id);
        }}
        title="Delete Note?"
        message="Are you sure you want to move this note to trash? You can restore it later from the trash folder."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
