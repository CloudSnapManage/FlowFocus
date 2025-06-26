
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileVideo, AlertCircle, Download, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNotes } from "@/hooks/use-notes";
import { exportNoteAsMarkdown } from "@/lib/utils";

const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), {
  ssr: false,
  loading: () => <div className="p-4">Loading preview...</div>,
});


const formSchema = z.object({
  url: z.string().url("Please enter a valid YouTube URL."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContentSummarizerPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeTranscriptOutput | null>(null);

  const { toast } = useToast();
  const { importNote } = useNotes();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
  });

  const handleSubmit = (data: FormValues) => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: data.url }),
        });

        const resultData = await response.json();

        if (!response.ok) {
          throw new Error(resultData.error || 'An unexpected error occurred fetching the transcript.');
        }
        
        const summaryResult = await summarizeTranscript({ transcript: resultData.transcript });
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
        <p className="text-muted-foreground">Paste a YouTube video link to generate structured study notes.</p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardHeader>
              <CardTitle>YouTube Video URL</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">YouTube URL</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                        <Button type="submit" disabled={isPending} className="min-w-[150px]">
                          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileVideo className="mr-2 h-4 w-4" />}
                          {isPending ? "Summarizing..." : "Summarize"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>
      
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
                <CardDescription>AI-generated study notes from the video.</CardDescription>
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
