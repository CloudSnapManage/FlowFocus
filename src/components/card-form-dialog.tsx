
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Flashcard } from '@/lib/types';

const cardFormSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  answer: z.string().min(1, 'Answer cannot be empty.'),
});

export type CardFormData = z.infer<typeof cardFormSchema>;

interface CardFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CardFormData) => void;
  card: Flashcard | null;
}

export function CardFormDialog({ isOpen, onOpenChange, onSubmit, card }: CardFormDialogProps) {
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
  });

  useEffect(() => {
    form.reset(card ? { question: card.question, answer: card.answer } : { question: '', answer: '' });
  }, [card, form, isOpen]);

  const handleFormSubmit = (data: CardFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Edit Card' : 'Add New Card'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
  );
}
