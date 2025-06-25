
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import type { Note } from '@/lib/types';

const initialNotes: Note[] = [
  {
    id: 'n1',
    title: 'Welcome to FlowFocus Notes',
    body: `## Welcome to Your New Notes Section!

This is a simple note-taking app with **Markdown** support.

- Create, edit, and delete notes.
- Organize with tags.
- Search your notes.
- Your data is saved locally in your browser.

Happy note-taking!`,
    tags: ['welcome', 'getting-started'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: true,
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('flowfocus_notes');
      if (storedNotes) {
        const parsedNotes: Note[] = JSON.parse(storedNotes);
        // Add isPinned property to old notes for compatibility
        const compatibleNotes = parsedNotes.map(note => ({ ...note, isPinned: note.isPinned || false }));
        setNotes(compatibleNotes);
        if (compatibleNotes.length > 0 && !activeNoteId) {
            const sortedNotes = [...compatibleNotes]
                .sort((a, b) => (b.isPinned ? 1 : -1) - (a.isPinned ? 1 : -1) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setActiveNoteId(sortedNotes[0].id);
        }
      } else {
        setNotes(initialNotes);
        if (initialNotes.length > 0) {
            setActiveNoteId(initialNotes[0].id);
        }
      }
    } catch (error) {
        console.error("Failed to load notes from localStorage", error);
        setNotes(initialNotes);
    }
  }, []); // Only on mount

  // Save notes to localStorage with debounce
  const saveNotesToStorage = useDebounceCallback((notesToSave: Note[]) => {
    try {
        localStorage.setItem('flowfocus_notes', JSON.stringify(notesToSave));
    } catch (error) {
        console.error("Failed to save notes to localStorage", error);
    }
  }, 500);
  
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('flowfocus_notes')) {
        saveNotesToStorage(notes);
    }
  }, [notes, saveNotesToStorage]);
  
  const manualSave = useCallback(() => {
    saveNotesToStorage.flush();
  }, [saveNotesToStorage]);

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: 'Untitled Note',
      body: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    setSelectedTag(null);
    setSearchTerm('');
  }, []);

  const handleUpdateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  }, []);
  
  const handleTogglePin = useCallback((id: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  }, []);
  
  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  }, []);

  const handleImportNote = useCallback((title: string, body: string) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: title.replace(/\.(md|txt)$/i, ''), // Remove file extension
      body: body,
      tags: ['imported'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    setSelectedTag(null); // Deselect any tags to show the new note
    setSearchTerm(''); // Clear search to ensure the new note is visible
  }, []);

  const filteredNotes = useMemo(() => {
    const filtered = notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.body.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
      });

    const pinned = filtered.filter(n => n.isPinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const unpinned = filtered.filter(n => !n.isPinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return [...pinned, ...unpinned];
  }, [notes, searchTerm, selectedTag]);

  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [notes, activeNoteId]);
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const selectNextNote = useCallback(() => {
    const currentIndex = filteredNotes.findIndex(n => n.id === activeNoteId);
    if (currentIndex > -1 && currentIndex < filteredNotes.length - 1) {
      setActiveNoteId(filteredNotes[currentIndex + 1].id);
    }
  }, [activeNoteId, filteredNotes]);

  const selectPrevNote = useCallback(() => {
    const currentIndex = filteredNotes.findIndex(n => n.id === activeNoteId);
    if (currentIndex > 0) {
      setActiveNoteId(filteredNotes[currentIndex - 1].id);
    }
  }, [activeNoteId, filteredNotes]);


  return {
    notes,
    filteredNotes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    allTags,
    createNote: handleCreateNote,
    updateNote: handleUpdateNote,
    deleteNote: handleDeleteNote,
    togglePin: handleTogglePin,
    importNote: handleImportNote,
    manualSave,
    selectNextNote,
    selectPrevNote,
  };
}
