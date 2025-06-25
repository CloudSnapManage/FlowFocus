
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Shuffle, Pencil, Trash2, Home, List } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Deck, Flashcard } from '@/lib/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const cardFormSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  answer: z.string().min(1, 'Answer cannot be empty.'),
});

export default function DeckPage({ params }: { params: { deckId: string } }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);

  const form = useForm<z.infer<typeof cardFormSchema>>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { question: '', answer: '' },
  });
  
  useEffect(() => {
    setIsMounted(true);
    const storedDecks = localStorage.getItem("flowfocus_decks");
    if (storedDecks) {
      const decks: Deck[] = JSON.parse(storedDecks);
      const currentDeck = decks.find(d => d.id === params.deckId);
      if (currentDeck) {
        setDeck(currentDeck);
        setCardOrder(currentDeck.cards.map(c => c.id));
      }
    }
  }, [params.deckId]);
  
  const updateDeckInStorage = (updatedDeck: Deck) => {
    const storedDecks = localStorage.getItem("flowfocus_decks");
    if (storedDecks) {
        let decks: Deck[] = JSON.parse(storedDecks);
        decks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
        localStorage.setItem("flowfocus_decks", JSON.stringify(decks));
        setDeck(updatedDeck);
    }
  }

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % (deck?.cards.length || 1)), 150);
  }
  
  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + (deck?.cards.length || 1)) % (deck?.cards.length || 1)), 150);
  }

  const handleShuffle = () => {
    if (!deck) return;
    const shuffledOrder = [...cardOrder].sort(() => Math.random() - 0.5);
    setCardOrder(shuffledOrder);
    setIsShuffled(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };
  
  const handleUnshuffle = () => {
    if (!deck) return;
    setCardOrder(deck.cards.map(c => c.id));
    setIsShuffled(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  const openCardForm = (card: Flashcard | null) => {
    setCardToEdit(card);
    form.reset(card ? { question: card.question, answer: card.answer } : { question: '', answer: '' });
    setIsCardFormOpen(true);
  };

  const handleCardSubmit = (data: z.infer<typeof cardFormSchema>) => {
    if (!deck) return;
    let updatedCards: Flashcard[];
    let newCardId = '';
    if (cardToEdit) {
      updatedCards = deck.cards.map(c => c.id === cardToEdit.id ? { ...c, ...data } : c);
    } else {
      newCardId = `c${Date.now()}`;
      const newCard: Flashcard = {
        id: newCardId,
        question: data.question,
        answer: data.answer,
      };
      updatedCards = [...deck.cards, newCard];
    }
    
    const updatedDeck = { ...deck, cards: updatedCards };
    updateDeckInStorage(updatedDeck);
    
    if (newCardId) {
      setCardOrder(prev => [...prev, newCardId]);
    }
    
    setIsCardFormOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!deck) return;
    const updatedCards = deck.cards.filter(c => c.id !== cardId);
    const updatedDeck = { ...deck, cards: updatedCards };
    updateDeckInStorage(updatedDeck);
    setCardOrder(prev => prev.filter(id => id !== cardId));
    if (currentIndex >= updatedCards.length) {
      setCurrentIndex(Math.max(0, updatedCards.length - 1));
    }
  }

  const currentCard = useMemo(() => {
    if (!deck || cardOrder.length === 0) return null;
    const currentId = cardOrder[currentIndex];
    return deck.cards.find(c => c.id === currentId) ?? null;
  }, [deck, cardOrder, currentIndex]);


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex justify-center items-center h-full flex-col gap-4">
        <h2 className="text-2xl font-bold">Deck not found</h2>
        <Button asChild><Link href="/flashcards"><Home className='mr-2' />Back to Decks</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{deck.name}</h1>
          {deck.description && <p className="text-muted-foreground">{deck.description}</p>}
        </div>
        <div className='flex items-center gap-2'>
            <Button variant="outline" asChild>
                <Link href="/flashcards"><Home className='mr-2 h-4 w-4'/> All Decks</Link>
            </Button>
            <Dialog open={isCardFormOpen} onOpenChange={setIsCardFormOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => openCardForm(null)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Card
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cardToEdit ? 'Edit Card' : 'Add New Card'}</DialogTitle>
                    </DialogHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCardSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question (Front)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., What is a React component?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="answer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Answer (Back)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., A reusable piece of UI." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit">Save Card</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {currentCard ? (
        <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-full max-w-2xl h-80 perspective-1000">
                <Card 
                    className={`w-full h-full relative transition-transform duration-700 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={handleFlip}
                >
                    <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center text-center p-6">
                        <CardContent className="p-0">
                            <p className="text-2xl font-semibold font-headline">{currentCard.question}</p>
                        </CardContent>
                    </div>
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center items-center text-center p-6 bg-card">
                        <CardContent className="p-0">
                            <p className="text-xl">{currentCard.answer}</p>
                        </CardContent>
                    </div>
                </Card>
            </div>
            <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous card"><ChevronLeft /></Button>
            <Button size="lg" onClick={handleFlip} className="w-40">
                <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
                {isFlipped ? 'View Question' : 'Reveal Answer'}
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next card"><ChevronRight /></Button>
            </div>
            <p className="text-sm text-muted-foreground">Card {currentIndex + 1} of {deck.cards.length}</p>
            {isShuffled ? (
                <Button variant="secondary" onClick={handleUnshuffle}><Shuffle className='mr-2 h-4 w-4' /> Unshuffle</Button>
            ) : (
                <Button variant="secondary" onClick={handleShuffle}><Shuffle className='mr-2 h-4 w-4' /> Shuffle</Button>
            )}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h3 className="text-xl font-semibold">This deck is empty</h3>
            <p className="text-muted-foreground mt-2">Add your first card to start studying.</p>
            <Button onClick={() => openCardForm(null)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
        </div>
      )}
      
      <Separator />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><List /> Cards in this Deck ({deck.cards.length})</h2>
        <div className="space-y-3">
          {deck.cards.map((card) => (
            <Card key={card.id} className='shadow-sm'>
              <CardContent className='p-4 flex items-start justify-between gap-4'>
                <div className='flex-grow grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <p className='text-xs text-muted-foreground font-semibold'>QUESTION</p>
                        <p className='font-sans'>{card.question}</p>
                    </div>
                     <div>
                        <p className='text-xs text-muted-foreground font-semibold'>ANSWER</p>
                        <p className='font-sans'>{card.answer}</p>
                    </div>
                </div>
                <div className='flex gap-1'>
                    <Button variant="ghost" size="icon" className='h-8 w-8' onClick={() => openCardForm(card)}><Pencil className='h-4 w-4' /></Button>
                    <Button variant="ghost" size="icon" className='h-8 w-8 text-destructive hover:text-destructive' onClick={() => handleDeleteCard(card.id)}><Trash2 className='h-4 w-4' /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
