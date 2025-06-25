
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as z from "zod";
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Deck } from "@/lib/types";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { DeckFormDialog, type DeckFormData } from "@/components/deck-form-dialog";

const initialDecks: Deck[] = [
  {
    id: "d1",
    name: "React Fundamentals",
    description: "Key concepts for mastering React.",
    cards: [
      { id: "c1", question: "What is React?", answer: "A JavaScript library for building user interfaces." },
      { id: "c2", question: "What is JSX?", answer: "A syntax extension for JavaScript, used with React to describe what the UI should look like." },
      { id: "c3", question: "What is the virtual DOM?", answer: "A programming concept where a virtual representation of a UI is kept in memory and synced with the 'real' DOM." },
    ],
  },
  {
    id: "d2",
    name: "JavaScript Essentials",
    description: "Core JS concepts every developer should know.",
    cards: [
        { id: "c4", question: "What are Promises?", answer: "An object representing the eventual completion or failure of an asynchronous operation." },
        { id: "c5", question: "Difference between `let`, `const`, and `var`?", answer: "`var` is function-scoped, `let` and `const` are block-scoped. `const` cannot be reassigned." },
    ]
  }
];

export default function FlashcardsHomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);

  useEffect(() => {
    const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks));
    } else {
      setDecks(initialDecks);
    }
  }, []);

  useEffect(() => {
    // Only save if decks state is not the initial empty array, to avoid overwriting on first load
    if (decks.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DECKS, JSON.stringify(decks));
    }
  }, [decks]);

  const openFormDialog = useCallback((deck: Deck | null) => {
    setDeckToEdit(deck);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback((data: DeckFormData) => {
    if (deckToEdit) {
      setDecks(decks.map(d => d.id === deckToEdit.id ? { ...d, ...data } : d));
    } else {
      const newDeck: Deck = {
        id: `d${Date.now()}`,
        name: data.name,
        description: data.description,
        cards: [],
      };
      setDecks([...decks, newDeck]);
    }
  }, [deckToEdit, decks]);
  
  const handleDeleteDeck = (deckId: string) => {
    setDecks(decks.filter(d => d.id !== deckId));
    setDeckToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Flashcard Decks</h1>
          <p className="text-muted-foreground">Create and manage your study decks.</p>
        </div>
        <DialogTrigger asChild>
            <Button onClick={() => openFormDialog(null)}>
                <Plus className="mr-2 h-4 w-4" /> New Deck
            </Button>
        </DialogTrigger>
      </div>

      {decks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map(deck => (
                <Card key={deck.id} className="flex flex-col shadow-sm">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="font-headline">{deck.name}</CardTitle>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Deck options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openFormDialog(deck)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeckToDelete(deck)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {deck.description && <CardDescription>{deck.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                       <p className="text-sm text-muted-foreground">{deck.cards.length} card{deck.cards.length !== 1 && 's'}</p>
                        <Button asChild className="mt-4 w-full">
                           <Link href={`/flashcards/${deck.id}`}>
                               <FolderOpen className="mr-2 h-4 w-4" />
                               Study Deck
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h3 className="text-xl font-semibold">No decks found</h3>
            <p className="text-muted-foreground mt-2">Get started by creating your first flashcard deck.</p>
            <Button onClick={() => openFormDialog(null)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create New Deck
            </Button>
        </div>
      )}

      <DeckFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        deck={deckToEdit}
      />

      <AlertDialog open={!!deckToDelete} onOpenChange={open => !open && setDeckToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the "{deckToDelete?.name}" deck and all its cards.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeckToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteDeck(deckToDelete!.id)} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
