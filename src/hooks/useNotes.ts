import { useState, useEffect, useMemo } from 'react';
import { get, set } from 'idb-keyval';
import { Note } from '../types';
import { SAMPLE_NOTES } from '../sampleData';

const STORAGE_KEY = 'revision_notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const savedNotes = await get<Note[]>(STORAGE_KEY);
        if (savedNotes && savedNotes.length > 0) {
          setNotes(savedNotes);
        } else {
          setNotes(SAMPLE_NOTES);
          await set(STORAGE_KEY, SAMPLE_NOTES);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
        setNotes(SAMPLE_NOTES);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const saveNotes = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    await set(STORAGE_KEY, updatedNotes);
  };

  const addNote = (note: Note) => {
    const updated = [note, ...notes];
    saveNotes(updated);
  };

  const updateNote = (updatedNote: Note) => {
    const updated = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    saveNotes(updated);
  };

  const moveToTrash = (id: string) => {
    const updated = notes.map(n => 
      n.id === id ? { ...n, isDeleted: true, deletedAt: Date.now() } : n
    );
    saveNotes(updated);
  };

  const restoreNote = (id: string) => {
    const updated = notes.map(n => 
      n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n
    );
    saveNotes(updated);
  };

  const permanentDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    moveToTrash(id);
  };

  const renameSubject = (oldName: string, newName: string) => {
    const updated = notes.map(n => 
      n.subject === oldName ? { ...n, subject: newName, updatedAt: Date.now() } : n
    );
    saveNotes(updated);
  };

  const activeNotes = useMemo(() => notes.filter(n => !n.isDeleted), [notes]);
  const deletedNotes = useMemo(() => notes.filter(n => n.isDeleted), [notes]);

  return { 
    notes: activeNotes, 
    deletedNotes,
    loading, 
    addNote, 
    updateNote, 
    deleteNote, 
    moveToTrash, 
    restoreNote, 
    permanentDeleteNote, 
    renameSubject 
  };
}
