
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BrainCircuit } from 'lucide-react';
import { Input } from '@/components/ui/input';

const generatorFormSchema = z.object({
  content: z.string().min(50, 'Please provide at least 50 characters of content to generate flashcards.'),
  deckName: z.string().min(3, 'Deck name must be at least 3 characters long.'),
  cardCount: z.coerce.number().min(1, 'Please generate at least 1 card.').max(50, 'You can generate a maximum of 50 cards.'),
});

export type GeneratorFormData = z.infer<typeof generatorFormSchema>;

interface FlashcardGeneratorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GeneratorFormData) => Promise<void>;
}

export function FlashcardGeneratorDialog({ isOpen, onOpenChange, onSubmit }: FlashcardGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorFormSchema),
    defaultValues: {
      content: '',
      deckName: '',
      cardCount: 10,
    }
  });

  const handleFormSubmit = async (data: GeneratorFormData) => {
    setIsGenerating(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isGenerating) {
        onOpenChange(open);
        if (!open) form.reset();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Flashcards with AI</DialogTitle>
          <DialogDescription>Paste your notes or text below, and AI will create a flashcard deck for you.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="deckName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Deck Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chapter 5: Cell Biology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content to Summarize</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste your text here..." {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Flashcards</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} min="1" max="50" onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>How many Q&A cards should the AI generate? (Max 50)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isGenerating}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isGenerating}>
                 {isGenerating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>) : (<><BrainCircuit className="mr-2 h-4 w-4" /> Generate</>)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
