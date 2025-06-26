
"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from 'next/dynamic';

import { summarizeTranscript, type SummarizeTranscriptOutput } from "@/ai/flows/summarize-transcript";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileVideo, AlertCircle, Download, Send, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import { exportNoteAsMarkdown } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeTranscriptOutput | null>(null);

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

  const handleUrlSubmit = (data: UrlFormValues) => {
    setError(null);
    setResult(null);

    startTransition(async () => {
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
    setError(null);
    setResult(null);

    startTransition(async () => {
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
          id: '', // Not needed for export
          title: result.title,
          body: result.summary,
          tags: ['summarized', 'youtube'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false
      });
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
                         <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileVideo className="mr-2 h-4 w-4" />}
                            {isPending ? "Summarizing..." : "Summarize Video"}
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
                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Type className="mr-2 h-4 w-4" />}
                            {isPending ? "Summarizing..." : "Summarize Text"}
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
    </div>
  );
}
