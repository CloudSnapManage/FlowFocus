
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Trash2, Tag, X } from "lucide-react";
import { useDebounceCallback } from "usehooks-ts";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

const initialNotes: Note[] = [
  {
    id: "n1",
    title: "Welcome to FlowFocus Notes",
    body: `## Welcome to Your New Notes Section!

This is a simple note-taking app with **Markdown** support.

- Create, edit, and delete notes.
- Organize with tags.
- Search your notes.
- Your data is saved locally in your browser.

Happy note-taking!`,
    tags: ["welcome", "getting-started"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Load notes from localStorage on initial render
  useEffect(() => {
    const storedNotes = localStorage.getItem("flowfocus_notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      setNotes(initialNotes);
    }
  }, []);

  // Set first note as active on initial load
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setActiveNoteId(sortedNotes[0].id);
    } else if (notes.length === 0) {
      setActiveNoteId(null);
    }
  }, [notes]);

  // Save notes to localStorage whenever they change
  const debouncedSave = useDebounceCallback((notesToSave: Note[]) => {
    localStorage.setItem("flowfocus_notes", JSON.stringify(notesToSave));
  }, 500);

  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem("flowfocus_notes")) {
      debouncedSave(notes);
    }
  }, [notes, debouncedSave]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: "Untitled Note",
      body: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setSelectedTag(null);
    setSearchTerm("");
  };

  const handleDeleteNote = (noteId: string) => {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    
    if (activeNoteId === noteId) {
        if (updatedNotes.length > 0) {
            const newActiveIndex = Math.max(0, noteIndex - 1);
            const sortedFiltered = filteredNotes.filter(n => n.id !== noteId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setActiveNoteId(sortedFiltered[0]?.id || null);
        } else {
            setActiveNoteId(null);
        }
    }
    setNoteToDelete(null);
  };
  
  const handleUpdateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      )
    );
  }, []);

  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.body.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm, selectedTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-5rem)]">
      <aside className="hidden md:flex flex-col border-r">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">My Notes</h2>
            <Button size="icon" variant="ghost" onClick={handleCreateNote} aria-label="New note">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 pt-0 space-y-2">
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground"/>
                <h3 className="text-sm font-semibold">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge 
                    variant={!selectedTag ? "default" : "secondary"}
                    onClick={() => setSelectedTag(null)}
                    className="cursor-pointer"
                >
                    All Notes
                </Badge>
                {allTags.map(tag => (
                    <Badge 
                        key={tag}
                        variant={selectedTag === tag ? "default" : "secondary"}
                        onClick={() => setSelectedTag(tag)}
                        className="cursor-pointer"
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredNotes.map((note) => (
              <Button
                key={note.id}
                variant="ghost"
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "w-full h-auto justify-start flex-col items-start p-2",
                  activeNoteId === note.id && "bg-accent text-accent-foreground"
                )}
              >
                <span className="font-semibold truncate w-full text-left">{note.title}</span>
                <span className="text-xs text-muted-foreground w-full text-left">
                    {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex flex-col">
        {activeNote ? (
            <div className="flex flex-col h-full">
                <div className="flex items-center p-4 border-b gap-4">
                    <Input 
                        value={activeNote.title}
                        onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                        className="text-2xl font-bold font-headline h-auto border-none shadow-none focus-visible:ring-0 p-0"
                    />
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setNoteToDelete(activeNote)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-4 flex items-center gap-2 border-b flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground"/>
                    {activeNote.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="group">
                           {tag}
                           <button onClick={() => handleUpdateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tag) })} className="ml-1 rounded-full opacity-50 group-hover:opacity-100">
                                <X className="h-3 w-3" />
                           </button>
                        </Badge>
                    ))}
                     <Input 
                        placeholder="Add a tag..."
                        className="h-6 w-24 border-none shadow-none focus-visible:ring-0 p-0"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const newTag = e.currentTarget.value.trim().toLowerCase();
                                if (!activeNote.tags.includes(newTag)) {
                                    handleUpdateNote(activeNote.id, { tags: [...activeNote.tags, newTag] })
                                }
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                </div>
                <div className="flex-1 overflow-auto" data-color-mode="light">
                    <MDEditor
                        value={activeNote.body}
                        onChange={(value) => handleUpdateNote(activeNote.id, { body: value || "" })}
                        className="h-full"
                        preview="live"
                        style={{border: "none", borderRadius: 0}}
                    />
                </div>
            </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-semibold">No note selected</h2>
            <p className="text-muted-foreground mt-2">Select a note from the list or create a new one to get started.</p>
            <Button onClick={handleCreateNote} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Create Note
            </Button>
          </div>
        )}
      </main>

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
                <AlertDialogAction onClick={() => handleDeleteNote(noteToDelete!.id)} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
