
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Habit } from '@/lib/types';
import { useEffect } from 'react';

const habitFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.string().min(2, "Category must be at least 2 characters."),
  type: z.enum(["binary", "quantitative"], { required_error: "You need to select a habit type." }),
  target: z.coerce.number().min(1).optional(),
  unit: z.string().optional(),
  goalStreak: z.coerce.number().min(1).optional(),
})
.refine((data) => {
    if (data.type === 'quantitative') {
      return !!data.target && data.target > 0;
    }
    return true;
  }, {
    message: "Target must be a positive number for quantitative habits.",
    path: ['target'],
  })
.refine((data) => {
    if (data.type === 'quantitative') {
      return !!data.unit && data.unit.trim().length > 0;
    }
    return true;
  }, {
    message: "Unit is required for quantitative habits.",
    path: ['unit'],
  });

export type HabitFormData = z.infer<typeof habitFormSchema>;

interface HabitFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitFormData) => void;
  habit: Habit | null;
}

export function HabitFormDialog({ isOpen, onOpenChange, onSubmit, habit }: HabitFormDialogProps) {
  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitFormSchema),
  });

  const habitType = form.watch("type");

  useEffect(() => {
    if (isOpen) {
        if (habit) {
        form.reset({
            name: habit.name,
            category: habit.category,
            type: habit.type,
            target: habit.type === 'quantitative' ? habit.target : 1,
            unit: habit.unit,
            goalStreak: habit.goalStreak,
        });
        } else {
        form.reset({
            name: "",
            category: "",
            type: "binary",
            target: 1,
            unit: "",
            goalStreak: 21,
        });
        }
    }
  }, [habit, form, isOpen]);

  const handleFormSubmit = (data: HabitFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
          <DialogDescription>
            {habit ? "Make changes to your habit." : "Create a new habit to track. You can group it by category."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Read a book" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Health, Study" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="binary" />
                        </FormControl>
                        <FormLabel className="font-normal">Binary (Done/Not Done)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="quantitative" />
                        </FormControl>
                        <FormLabel className="font-normal">Quantitative</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {habitType === 'quantitative' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., min, pages" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="goalStreak"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Streak Goal (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 21" {...field} />
                  </FormControl>
                  <FormDescription>Set a desired streak goal to work towards.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
