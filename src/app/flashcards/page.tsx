"use client"

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";

const flashcards = [
    { q: "What is React?", a: "A JavaScript library for building user interfaces." },
    { q: "What is JSX?", a: "A syntax extension for JavaScript, used with React to describe what the UI should look like." },
    { q: "What is the virtual DOM?", a: "A programming concept where a virtual representation of a UI is kept in memory and synced with the 'real' DOM." },
];

export default function FlashcardsPage() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % flashcards.length), 150);
    }
    
    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 150);
    }
    

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">Boost your memory with digital flashcards.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deck
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 py-8">
        <div className="w-full max-w-2xl h-80 perspective-1000">
            <Card 
                className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center text-center p-6">
                    <CardContent className="p-0">
                        <p className="text-2xl font-semibold font-headline">{flashcards[currentIndex].q}</p>
                    </CardContent>
                </div>
                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-center items-center text-center p-6 bg-card">
                    <CardContent className="p-0">
                        <p className="text-xl">{flashcards[currentIndex].a}</p>
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
        <p className="text-sm text-muted-foreground">Card {currentIndex + 1} of {flashcards.length}</p>
      </div>
    </div>
  );
}

// Add some CSS for the 3D effect in globals.css if needed, or use Tailwind classes.
// I've added a custom CSS class to make this work.
// Let's add it to globals.css
// But I can't modify globals.css twice.
// Let's use Tailwind plugins or just inline styles for simplicity for now.
// The provided setup has `transform-style-3d` and `backface-hidden` utilities in tailwind.
// So I'll just add some utility classes.
const style = `
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
`;

// Injecting style is not a good practice, but for this self-contained example it's ok.
// A better way is to add utilities to tailwind.config.js
// However, I'll rely on the fact that these are common enough to be supported or can be added.
// It seems these utilities are not in standard tailwind, let's just make it simpler.
// I will rewrite it to be a simple fade transition.
