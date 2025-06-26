
"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { summarizeTranscript, type SummarizeTranscriptOutput } from "@/ai/flows/summarize-transcript";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileVideo, AlertCircle, Download, Send, Type, BrainCircuit, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import { exportNoteAsMarkdown } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import type { Deck } from "@/lib/types";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), {
  ssr: false,
  loading: () => <div className="p-4">Loading preview...</div>,
});

const summaryStyles = [
  { value: 'Normal: A standard, clear, and well-structured summary for general study.', label: 'Normal' },
  { value: 'Academic: A formal, objective summary using precise terminology suitable for a university setting.', label: 'Academic Style' },
  { value: 'In-depth: Create a super long, comprehensive, and highly detailed summary. Elaborate and explain every concept in-depth, covering all nuances. This is intended for deep research purposes, so do not hold back on detail or length.', label: 'In-depth Research' },
  { value: 'For a 5-year-old: A summary using very simple words and short sentences, as if explaining to a 5-year-old.', label: 'For a 5-year-old' },
];

const urlFormSchema = z.object({
  url: z.string().url("Please enter a valid YouTube URL."),
  summaryStyle: z.string().optional(),
});
type UrlFormValues = z.infer<typeof urlFormSchema>;

const textFormSchema = z.object({
    content: z.string().min(100, "Please paste at least 100 characters of text to summarize."),
    summaryStyle: z.string().optional(),
});
type TextFormValues = z.infer<typeof textFormSchema>;

export default function ContentSummarizerPage() {
  const [isSummarizing, startSummarizing] = useTransition();
  const [isGeneratingFlashcards, startFlashcardGeneration] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeTranscriptOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['cards'] | null>(null);

  const { toast } = useToast();
  const { importNote } = useNotes();

  const urlForm = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: { url: "", summaryStyle: summaryStyles[0].value },
  });

  const textForm = useForm<TextFormValues>({
      resolver: zodResolver(textFormSchema),
      defaultValues: { content: "", summaryStyle: summaryStyles[0].value },
  });

  const resetState = () => {
    setError(null);
    setResult(null);
    setFlashcards(null);
  }

  const handleUrlSubmit = (data: UrlFormValues) => {
    resetState();
    startSummarizing(async () => {
      try {
        const response = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: data.url }),
        });

        const resultData = await response.json();

        if (!response.ok) {
          throw new Error(resultData.error || 'An unexpected error occurred fetching the transcript.');
        }
        
        const summaryResult = await summarizeTranscript({ 
            transcript: resultData.transcript, 
            summaryStyle: data.summaryStyle 
        });
        setResult(summaryResult);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      }
    });
  };

  const handleTextSubmit = (data: TextFormValues) => {
    resetState();
    startSummarizing(async () => {
        try {
            const summaryResult = await summarizeTranscript({ 
                transcript: data.content,
                summaryStyle: data.summaryStyle
            });
            setResult(summaryResult);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        }
    });
  };
  
  const handleGenerateFlashcards = () => {
    if (!result) return;
    startFlashcardGeneration(async () => {
        try {
            const flashcardResult = await generateFlashcards({ content: result.summary });
            setFlashcards(flashcardResult.cards);
        } catch (e: any) {
            setError("Failed to generate flashcards. Please try again.");
        }
    });
  }

  const handleSaveToNotes = () => {
    if (!result) return;
    importNote(result.title, result.summary);
    toast({
        title: "Saved to Notes",
        description: `"${result.title}" has been added to your notes.`,
    });
  }
  
  const handleDownload = () => {
      if(!result) return;
      exportNoteAsMarkdown({
          id: '',
          title: result.title,
          body: result.summary,
          tags: ['summarized', 'youtube'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false
      });
  }

  const handleSaveToDecks = () => {
    if (!result || !flashcards) return;
    const newDeck: Deck = {
      id: `d${Date.now()}`,
      name: `Flashcards for "${result.title}"`,
      description: `AI-generated from a video summary.`,
      cards: flashcards.map(card => ({
        id: `c${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        question: card.question,
        answer: card.answer,
        createdAt: new Date().toISOString(),
        source: 'AI',
      })),
    };

    try {
        const storedDecks = localStorage.getItem(LOCAL_STORAGE_KEYS.DECKS);
        const decks: Deck[] = storedDecks ? JSON.parse(storedDecks) : [];
        localStorage.setItem(LOCAL_STORAGE_KEYS.DECKS, JSON.stringify([newDeck, ...decks]));

        toast({
            title: 'Flashcard Deck Saved!',
            description: `"${newDeck.name}" has been added to your decks.`,
            action: (
                <ToastAction asChild altText="View Deck">
                    <Link href={`/flashcards/${newDeck.id}`}>View Deck</Link>
                </ToastAction>
            ),
        });
        setFlashcards(null); // Clear the generated cards after saving
    } catch (e) {
        setError("Failed to save the deck to your local storage.");
    }
  }


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Content Summarizer</h1>
        <p className="text-muted-foreground">Generate structured study notes from YouTube videos or any text content.</p>
      </div>

      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="youtube">From YouTube URL</TabsTrigger>
            <TabsTrigger value="text">From Text</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube">
            <Card>
                <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(handleUrlSubmit)}>
                    <CardHeader>
                    <CardTitle>YouTube Video URL</CardTitle>
                    <CardDescription>This feature is currently in development. Pasting a link may not always work due to network restrictions. If it fails, please use the "From Text" option.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={urlForm.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">YouTube URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={urlForm.control}
                            name="summaryStyle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Summary Style</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a summary style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {summaryStyles.map(style => (
                                                <SelectItem key={style.label} value={style.value}>{style.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSummarizing} className="w-full">
                            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileVideo className="mr-2 h-4 w-4" />}
                            {isSummarizing ? "Summarizing..." : "Summarize Video"}
                        </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
        </TabsContent>
        <TabsContent value="text">
            <Card>
                <Form {...textForm}>
                <form onSubmit={textForm.handleSubmit(handleTextSubmit)}>
                    <CardHeader>
                    <CardTitle>Paste Your Text</CardTitle>
                    <CardDescription>Manually paste a transcript or any other text content here to generate notes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={textForm.control}
                            name="content"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Text Content</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Paste your text content here..." {...field} rows={8} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={textForm.control}
                            name="summaryStyle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Summary Style</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a summary style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {summaryStyles.map(style => (
                                                <SelectItem key={style.label} value={style.value}>{style.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSummarizing} className="w-full">
                            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Type className="mr-2 h-4 w-4" />}
                            {isSummarizing ? "Summarizing..." : "Summarize Text"}
                        </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
            <CardHeader>
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>AI-generated study notes from the provided content.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-4 bg-muted/20">
                   <MDEditor source={result.summary} />
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button onClick={handleSaveToNotes}><Send className="mr-2 h-4 w-4" /> Save to Notes</Button>
                <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download Markdown</Button>
            </CardFooter>
        </Card>
      )}

      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Generate Flashcards</CardTitle>
                <CardDescription>Create a study deck from the summary above.</CardDescription>
            </CardHeader>
            <CardContent>
                {isGeneratingFlashcards && (
                     <div className="flex items-center justify-center p-8">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                        <p>Generating flashcards...</p>
                    </div>
                )}

                {!flashcards && !isGeneratingFlashcards && (
                    <Button onClick={handleGenerateFlashcards} className="w-full">
                        <BrainCircuit className="mr-2 h-4 w-4" /> Generate Flashcards from Summary
                    </Button>
                )}

                {flashcards && (
                    <div className="space-y-4">
                        {flashcards.map((card, index) => (
                            <div key={index} className="p-4 border rounded-md">
                                <p className="font-semibold text-sm">Q: {card.question}</p>
                                <p className="text-sm text-muted-foreground mt-1">A: {card.answer}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {flashcards && (
                <CardFooter>
                    <Button onClick={handleSaveToDecks}><Copy className="mr-2 h-4 w-4" /> Save to Decks</Button>
                </CardFooter>
            )}
        </Card>
      )}
    </div>
  );
}

    