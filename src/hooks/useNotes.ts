import { useState, useEffect, useMemo } from 'react';
import { get, set } from 'idb-keyval';
import { Note, User } from '../types';
import { SAMPLE_NOTES } from '../sampleData';

const STORAGE_KEY = 'revision_notes';
const INITIALIZED_KEY = 'revision_notes_initialized';

export function useNotes(user: User | null) {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const savedNotes = await get<Note[]>(STORAGE_KEY);
        const isInitialized = await get<boolean>(INITIALIZED_KEY);

        if (isInitialized) {
          setAllNotes(savedNotes || []);
        } else {
          // First time initialization
          setAllNotes(SAMPLE_NOTES);
          await set(STORAGE_KEY, SAMPLE_NOTES);
          await set(INITIALIZED_KEY, true);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
        setAllNotes(SAMPLE_NOTES);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const migrateNotes = async (newUserId: string) => {
    // Use functional update to ensure we have the latest notes
    setAllNotes(prev => {
      const userNoteIds = new Set(prev.filter(n => n.userId === newUserId).map(n => n.id));
      
      const updated = prev.map(n => {
        if (n.userId === 'guest') {
          // If the user already has a note with this ID, don't migrate it (it's a duplicate)
          if (userNoteIds.has(n.id)) {
            return null; 
          }
          return { ...n, userId: newUserId, updatedAt: Date.now() };
        }
        return n;
      }).filter((n): n is Note => n !== null);
      
      // Persist to storage
      set(STORAGE_KEY, updated);
      return updated;
    });
  };

  const userNotes = useMemo(() => {
    if (!user) return [];
    const filtered = allNotes.filter(n => n.userId === user.id);
    
    // Deduplicate by ID, prioritizing trashed state then updatedAt
    const deduplicated = filtered.reduce((acc: Record<string, Note>, note) => {
      const existing = acc[note.id];
      if (!existing) {
        acc[note.id] = note;
      } else {
        // Trash state wins if it's newer or if existing is not trashed
        const shouldReplace = 
          (!existing.isDeleted && note.isDeleted) || 
          (existing.isDeleted === note.isDeleted && note.updatedAt > existing.updatedAt);
        
        if (shouldReplace) {
          acc[note.id] = note;
        }
      }
      return acc;
    }, {});

    return Object.values(deduplicated);
  }, [allNotes, user]);

  const saveAndNormalize = (updatedAllNotes: Note[]) => {
    // We don't necessarily want to normalize the ENTIRE database at once 
    // because it might be large, but we should at least normalize the current user's notes
    // or the ones we just touched.
    // For safety, let's normalize the whole thing to clean up corruption.
    const map = new Map<string, Note>();
    updatedAllNotes.forEach(note => {
      const key = `${note.userId}-${note.id}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, note);
      } else {
        const shouldReplace = 
          (!existing.isDeleted && note.isDeleted) || 
          (existing.isDeleted === note.isDeleted && note.updatedAt > existing.updatedAt);
        if (shouldReplace) map.set(key, note);
      }
    });
    const normalized = Array.from(map.values());
    set(STORAGE_KEY, normalized);
    return normalized;
  };

  const addNote = (note: Note) => {
    if (!user) return;
    
    setAllNotes(prev => {
      const noteWithUser = { ...note, userId: user.id, updatedAt: Date.now() };
      // Remove all existing versions of this note for this user
      const otherNotes = prev.filter(n => !(n.id === note.id && n.userId === user.id));
      const updated = [noteWithUser, ...otherNotes];
      return saveAndNormalize(updated);
    });
  };

  const updateNote = (updatedNote: Note) => {
    if (!user) return;
    
    setAllNotes(prev => {
      const noteWithTimestamp = { ...updatedNote, updatedAt: Date.now() };
      // Remove all existing versions and add the updated one
      const otherNotes = prev.filter(n => !(n.id === updatedNote.id && n.userId === user.id));
      const updated = [noteWithTimestamp, ...otherNotes];
      return saveAndNormalize(updated);
    });
  };

  const moveToTrash = (id: string) => {
    if (!user) return;
    setAllNotes(prev => {
      const existingNotes = prev.filter(n => n.id === id && n.userId === user.id);
      if (existingNotes.length === 0) return prev;

      // Use the most recent one as base
      const baseNote = existingNotes.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b);
      const trashedNote = { 
        ...baseNote, 
        isDeleted: true, 
        deletedAt: Date.now(),
        updatedAt: Date.now() // Ensure it's the latest version
      };

      const otherNotes = prev.filter(n => !(n.id === id && n.userId === user.id));
      const updated = [trashedNote, ...otherNotes];
      return saveAndNormalize(updated);
    });
  };

  const restoreNote = (id: string) => {
    if (!user) return;
    setAllNotes(prev => {
      const existingNotes = prev.filter(n => n.id === id && n.userId === user.id);
      if (existingNotes.length === 0) return prev;

      const baseNote = existingNotes.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b);
      const restoredNote = { 
        ...baseNote, 
        isDeleted: false, 
        deletedAt: undefined,
        updatedAt: Date.now() 
      };

      const otherNotes = prev.filter(n => !(n.id === id && n.userId === user.id));
      const updated = [restoredNote, ...otherNotes];
      return saveAndNormalize(updated);
    });
  };

  const permanentDeleteNote = (id: string) => {
    if (!user) return;
    setAllNotes(prev => {
      const updated = prev.filter(n => !(n.id === id && n.userId === user.id));
      return saveAndNormalize(updated);
    });
  };

  const clearTrash = () => {
    if (!user) return;
    setAllNotes(prev => {
      const updated = prev.filter(n => !(n.userId === user.id && n.isDeleted));
      return saveAndNormalize(updated);
    });
  };

  const deleteNote = (id: string) => {
    moveToTrash(id);
  };

  const togglePin = (id: string) => {
    if (!user) return;
    setAllNotes(prev => {
      const updated = prev.map(n => 
        (n.userId === user.id && n.id === id) 
          ? { ...n, pinned: !n.pinned } 
          : n
      );
      return saveAndNormalize(updated);
    });
  };

  const renameSubject = (oldName: string, newName: string) => {
    if (!user) return;
    
    setAllNotes(prev => {
      const updated = prev.map(n => 
        (n.userId === user.id && n.subject === oldName) 
          ? { ...n, subject: newName, updatedAt: Date.now() } 
          : n
      );
      
      return saveAndNormalize(updated);
    });
  };

  const deleteUserNotes = async (userId: string) => {
    setAllNotes(prev => {
      const updated = prev.filter(n => n.userId !== userId);
      set(STORAGE_KEY, updated);
      return updated;
    });
  };

  const ensureGuestNotes = async () => {
    setAllNotes(prev => {
      const guestNotes = prev.filter(n => n.userId === 'guest');
      if (guestNotes.length === 0) {
        const updated = [...prev, ...SAMPLE_NOTES];
        set(STORAGE_KEY, updated);
        return updated;
      }
      return prev;
    });
  };

  const activeNotes = useMemo(() => userNotes.filter(n => !n.isDeleted), [userNotes]);
  const deletedNotes = useMemo(() => userNotes.filter(n => n.isDeleted), [userNotes]);

  return { 
    notes: activeNotes, 
    deletedNotes,
    allNotes, // Export all notes for admin dashboard
    loading, 
    addNote, 
    updateNote, 
    deleteNote, 
    togglePin,
    clearTrash,
    moveToTrash, 
    restoreNote, 
    permanentDeleteNote, 
    renameSubject,
    migrateNotes,
    deleteUserNotes,
    ensureGuestNotes
  };
}
