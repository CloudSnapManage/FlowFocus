
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { Plus } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { useNotes } from '@/hooks/use-notes';
import { useIsMobile } from "@/hooks/use-mobile";
import { NoteList } from '@/components/note-list';
import { NoteEditor } from '@/components/note-editor';
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn, exportNoteAsMarkdown } from "@/lib/utils";
import type { Note, Deck } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { ToastAction } from "@/components/ui/toast";


export default function NotesPage() {
  const {
    filteredNotes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchTerm,
    setSearchTerm,
    selectedTag,
    setSelectedTag,
    allTags,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    manualSave,
    selectNextNote,
    selectPrevNote,
    importNote,
  } = useNotes();
  
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            createNote();
            break;
          case 's':
            event.preventDefault();
            manualSave();
            break;
          case 'f':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'ArrowUp':
            event.preventDefault();
            selectPrevNote();
            break;
          case 'ArrowDown':
            event.preventDefault();
            selectNextNote();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [createNote, manualSave, selectPrevNote, selectNextNote]);
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedMimeTypes = ['text/markdown', 'text/plain'];
    const allowedExtensions = ['.md', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a Markdown (.md) or Text (.txt) file.',
        variant: 'destructive',
      });
      if(event.target) event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importNote(file.name, content);
      toast({
        title: 'Note Imported',
        description: `"${file.name}" has been successfully imported.`,
      });
    };
    reader.readAsText(file);

    if (event.target) event.target.value = '';
  };


  const handleDeleteRequest = (id: string) => {
    const note = filteredNotes.find(n => n.id === id);
    if (note) setNoteToDelete(note);
  };
  
  const confirmDelete = () => {
    if (noteToDelete) {
        // If on mobile and deleting the active note, close the dialog
        if (isMobile && activeNoteId === noteToDelete.id) {
            setActiveNoteId(null);
        }
        deleteNote(noteToDelete.id);
        
        // Find new active note after deletion
        const currentIndex = filteredNotes.findIndex(n => n.id === noteToDelete.id);
        const newNotes = filteredNotes.filter(n => n.id !== noteToDelete.id);
        if (newNotes.length > 0) {
            const newIndex = Math.max(0, currentIndex - 1);
            setActiveNoteId(newNotes[newIndex].id);
        } else {
            setActiveNoteId(null);
        }

        setNoteToDelete(null);
    }
  };

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
  }
  
  const handleGenerateFlashcards = async (note: Note) => {
    if (!note.body.trim()) {
      toast({
        title: 'Note is empty',
        description: 'Cannot generate flashcards from an empty note.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateFlashcards({ content: note.body });
      
      const newDeck: Deck = {
        id: `d${Date.now()}`,
        name: `Flashcards for "${note.title}"`,
        description: `AI-generated from note.`,
        cards: result.cards.map(card => ({
          id: `c${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          question: card.question,
          answer: card.answer,
          createdAt: new Date().toISOString(),
          source: 'AI',
        })),
      };

      const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
      const decks: Deck[] = storedDecks ? JSON.parse(storedDecks) : [];
      localStorage.setItem(LOCAL_STORAGE_KEYS.DECKS, JSON.stringify([newDeck, ...decks]));

      toast({
        title: 'Flashcard Deck Created!',
        description: `"${newDeck.name}" has been added.`,
        action: (
            <ToastAction asChild altText="View Deck">
              <Link href={`/flashcards/${newDeck.id}`}>View Deck</Link>
            </ToastAction>
        ),
      });

    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating flashcards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const editorComponent = activeNote ? (
    <NoteEditor 
      note={activeNote}
      onUpdate={updateNote}
      onDelete={handleDeleteRequest}
      onExport={exportNoteAsMarkdown}
      onGenerateFlashcards={handleGenerateFlashcards}
      isGeneratingFlashcards={isGenerating}
    />
  ) : (
     <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-semibold">No note selected</h2>
        <p className="text-muted-foreground mt-2">Select a note from the list or create a new one to get started.</p>
        <Button onClick={createNote} className="mt-6">
          <Plus className="mr-2 h-4 w-4" /> Create Note
        </Button>
      </div>
  );

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-5rem)]">
      <NoteList
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onCreateNote={createNote}
        onTriggerImport={() => fileInputRef.current?.click()}
        onTogglePin={togglePin}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        searchInputRef={searchInputRef}
      />
      
      {isMobile ? (
        <Dialog open={!!activeNoteId} onOpenChange={(isOpen) => !isOpen && setActiveNoteId(null)}>
          <DialogContent className="p-0 border-0 max-w-full w-full h-full max-h-screen">
            {editorComponent}
          </DialogContent>
        </Dialog>
      ) : (
        <main className="flex flex-col">
            {editorComponent}
        </main>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        className="hidden"
        accept=".md,.txt,text/markdown,text/plain"
      />

      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{noteToDelete?.title}" note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
