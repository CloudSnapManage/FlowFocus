
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Shuffle, Pencil, Trash2, Home, List } from "lucide-react";
import type { Deck, Flashcard } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { CardFormDialog, type CardFormData } from '@/components/card-form-dialog';


export default function DeckPage() {
  const params = useParams();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
    if (storedDecks) {
      const decks: Deck[] = JSON.parse(storedDecks);
      const currentDeck = decks.find(d => d.id === deckId);
      if (currentDeck) {
        setDeck(currentDeck);
        setCardOrder(currentDeck.cards.map(c => c.id));
      }
    }
  }, [deckId]);
  
  const updateDeckInStorage = useCallback((updatedDeck: Deck) => {
    const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
    if (storedDecks) {
        let decks: Deck[] = JSON.parse(storedDecks);
        decks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d);
        localStorage.setItem(LOCAL_STORAGE_KEYS.DECKS, JSON.stringify(decks));
        setDeck(updatedDeck);
    }
  }, []);

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

  const openCardForm = useCallback((card: Flashcard | null) => {
    setCardToEdit(card);
    setIsCardFormOpen(true);
  }, []);

  const handleCardSubmit = useCallback((data: CardFormData) => {
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
  }, [deck, cardToEdit, updateDeckInStorage]);

  const handleDeleteCard = useCallback((cardId: string) => {
    if (!deck) return;
    const updatedCards = deck.cards.filter(c => c.id !== cardId);
    const updatedDeck = { ...deck, cards: updatedCards };
    updateDeckInStorage(updatedDeck);
    setCardOrder(prev => prev.filter(id => id !== cardId));
    if (currentIndex >= updatedCards.length) {
      setCurrentIndex(Math.max(0, updatedCards.length - 1));
    }
  }, [deck, currentIndex, updateDeckInStorage]);

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
            <Button onClick={() => openCardForm(null)}>
                <Plus className="mr-2 h-4 w-4" /> Add Card
            </Button>
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
      
      <CardFormDialog 
        isOpen={isCardFormOpen}
        onOpenChange={setIsCardFormOpen}
        onSubmit={handleCardSubmit}
        card={cardToEdit}
      />
    </div>
  );
}
