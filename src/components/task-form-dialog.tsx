
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import type { Task, Habit } from '@/lib/types';
import { format } from 'date-fns';

const taskFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(2, "Category is required."),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]),
  habitId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  task: Task | null;
  habits: Habit[];
}

export function TaskFormDialog({ isOpen, onOpenChange, onSubmit, task, habits }: TaskFormDialogProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
  });

  useEffect(() => {
    if(isOpen) {
        if (task) {
            form.reset({
                name: task.name,
                description: task.description || "",
                category: task.category,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                priority: task.priority,
                habitId: task.habitId || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                category: "",
                priority: "medium",
                habitId: "",
                dueDate: undefined,
            });
        }
    }
  }, [task, habits, form, isOpen]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                    {task ? 'Make changes to your task.' : 'Add a new task to your list. Fill in the details below.'}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Finish project proposal" {...field} />
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
                                    <Textarea placeholder="Add more details about the task..." {...field} />
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
                                    <Input placeholder="e.g., Work, Personal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Due Date (Optional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="habitId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link to Habit (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a habit to link" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {habits.map((habit) => (
                                            <SelectItem key={habit.id} value={habit.id}>{habit.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Completing this task will also complete the linked habit for today.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save Task</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
