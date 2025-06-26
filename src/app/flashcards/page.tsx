
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as z from "zod";
import { Plus, MoreVertical, Pencil, Trash2, FolderOpen, BrainCircuit } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { FlashcardGeneratorDialog, type GeneratorFormData } from "@/components/flashcard-generator-dialog";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";


const initialDecks: Deck[] = [
  {
    id: "d1",
    name: "React Fundamentals",
    description: "Key concepts for mastering React.",
    cards: [
      { id: "c1", question: "What is React?", answer: "A JavaScript library for building user interfaces.", createdAt: new Date().toISOString(), source: 'manual' },
      { id: "c2", question: "What is JSX?", answer: "A syntax extension for JavaScript, used with React to describe what the UI should look like.", createdAt: new Date().toISOString(), source: 'manual' },
      { id: "c3", question: "What is the virtual DOM?", answer: "A programming concept where a virtual representation of a UI is kept in memory and synced with the 'real' DOM.", createdAt: new Date().toISOString(), source: 'manual' },
    ],
  },
  {
    id: "d2",
    name: "JavaScript Essentials",
    description: "Core JS concepts every developer should know.",
    cards: [
        { id: "c4", question: "What are Promises?", answer: "An object representing the eventual completion or failure of an asynchronous operation.", createdAt: new Date().toISOString(), source: 'manual' },
        { id: "c5", question: "Difference between `let`, `const`, and `var`?", answer: "`var` is function-scoped, `let` and `const` are block-scoped. `const` cannot be reassigned.", createdAt: new Date().toISOString(), source: 'manual' },
    ]
  }
];

export default function FlashcardsHomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
      if (storedDecks) {
        setDecks(JSON.parse(storedDecks));
      } else {
        setDecks(initialDecks);
      }
    } catch (error) {
        console.error("Failed to load decks from localStorage", error);
        setDecks(initialDecks);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.DECKS, JSON.stringify(decks));
    }
  }, [decks, isLoaded]);

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
  
  const handleGenerateFromText = async (data: GeneratorFormData) => {
    try {
      const result = await generateFlashcards({ content: data.content });
      
      const newDeck: Deck = {
        id: `d${Date.now()}`,
        name: data.deckName,
        description: `AI-generated from provided text.`,
        cards: result.cards.map(card => ({
          id: `c${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          question: card.question,
          answer: card.answer,
          createdAt: new Date().toISOString(),
          source: 'AI',
        })),
      };

      setDecks(prevDecks => [newDeck, ...prevDecks]);

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
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Flashcard Decks</h1>
          <p className="text-muted-foreground">Create and manage your study decks.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsGeneratorOpen(true)}>
                <BrainCircuit className="mr-2 h-4 w-4" /> Generate with AI
            </Button>
            <Button onClick={() => openFormDialog(null)}>
                <Plus className="mr-2 h-4 w-4" /> New Deck
            </Button>
        </div>
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

      <FlashcardGeneratorDialog 
        isOpen={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        onSubmit={handleGenerateFromText}
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
