
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { Deck } from "@/lib/types";

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

const deckFormSchema = z.object({
  name: z.string().min(2, "Deck name must be at least 2 characters."),
  description: z.string().optional(),
});

export default function FlashcardsHomePage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);

  const form = useForm<z.infer<typeof deckFormSchema>>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    const storedDecks = localStorage.getItem("flowfocus_decks");
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks));
    } else {
      setDecks(initialDecks);
    }
  }, []);

  useEffect(() => {
    // Only save if decks state is not the initial empty array, to avoid overwriting on first load
    if (decks.length > 0 || localStorage.getItem("flowfocus_decks")) {
      localStorage.setItem("flowfocus_decks", JSON.stringify(decks));
    }
  }, [decks]);

  const openFormDialog = (deck: Deck | null) => {
    setDeckToEdit(deck);
    form.reset(deck ? { name: deck.name, description: deck.description || "" } : { name: "", description: "" });
    setIsFormOpen(true);
  };

  const onSubmit = (data: z.infer<typeof deckFormSchema>) => {
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
    setIsFormOpen(false);
  };
  
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
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openFormDialog(null)}>
                    <Plus className="mr-2 h-4 w-4" /> New Deck
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{deckToEdit ? 'Edit Deck' : 'Create New Deck'}</DialogTitle>
                    <DialogDescription>{deckToEdit ? 'Rename your deck or change its description.' : 'Give your new deck a name and an optional description.'}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deck Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., React Hooks" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What's this deck about?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Save Deck</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
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
