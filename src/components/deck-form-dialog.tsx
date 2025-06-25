
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Deck } from '@/lib/types';

const deckFormSchema = z.object({
  name: z.string().min(2, "Deck name must be at least 2 characters."),
  description: z.string().optional(),
});

export type DeckFormData = z.infer<typeof deckFormSchema>;

interface DeckFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeckFormData) => void;
  deck: Deck | null;
}

export function DeckFormDialog({ isOpen, onOpenChange, onSubmit, deck }: DeckFormDialogProps) {
  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckFormSchema),
  });

  useEffect(() => {
    form.reset(deck ? { name: deck.name, description: deck.description || "" } : { name: "", description: "" });
  }, [deck, form, isOpen]);

  const handleFormSubmit = (data: DeckFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deck ? 'Edit Deck' : 'Create New Deck'}</DialogTitle>
          <DialogDescription>{deck ? 'Rename your deck or change its description.' : 'Give your new deck a name and an optional description.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
  );
}
