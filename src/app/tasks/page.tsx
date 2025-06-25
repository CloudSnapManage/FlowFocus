
"use client";

import { useState, useMemo, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Task, Habit } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Tag, CalendarIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const initialTasks: Task[] = [
    { id: 't1', name: "Finish project report", description: "Finalize the Q3 report for the client.", category: "Work", completed: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), priority: 'high' },
    { id: 't2', name: "Go for a 30-min run", category: "Health", completed: false, dueDate: new Date().toISOString(), priority: 'medium', habitId: 'h2' },
    { id: 't3', name: "Read 1 chapter of a book", category: "Mind", completed: false, dueDate: new Date().toISOString(), priority: 'low', habitId: 'h1' },
    { id: 't4', name: "Buy groceries", description: "Milk, bread, eggs, and cheese.", category: "Personal", completed: true, dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), priority: 'medium' },
    { id: 't5', name: "Review PRs", category: "Work", completed: false, dueDate: new Date().toISOString(), priority: 'high', habitId: 'h3' },
];

const priorityStyles = {
    high: "bg-red-500/20 text-red-700 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 border-green-500/30",
}

const taskFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().min(2, "Category is required."),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]),
  habitId: z.string().optional(),
});


export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    const form = useForm<z.infer<typeof taskFormSchema>>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            priority: "medium",
            habitId: "",
        },
    });

    useEffect(() => {
        const storedTasks = localStorage.getItem('flowfocus_tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            setTasks(initialTasks);
        }

        const storedHabits = localStorage.getItem('flowfocus_habits');
        if (storedHabits) {
            setHabits(JSON.parse(storedHabits));
        }
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('flowfocus_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    const handleTaskCompletion = (taskId: string, completed: boolean) => {
        let updatedTask: Task | undefined;
        const updatedTasks = tasks.map(t => {
            if (t.id === taskId) {
                updatedTask = { ...t, completed };
                return updatedTask;
            }
            return t;
        });
        setTasks(updatedTasks);

        if (updatedTask?.habitId) {
            updateLinkedHabit(updatedTask.habitId, completed);
        }
    };
    
    const updateLinkedHabit = (habitId: string, completed: boolean) => {
        const storedHabits = localStorage.getItem('flowfocus_habits');
        if (storedHabits) {
            let habits: Habit[] = JSON.parse(storedHabits);
            habits = habits.map(h => {
                if (h.id === habitId) {
                    return { ...h, completedToday: completed, value: completed ? h.target : 0 };
                }
                return h;
            });
            localStorage.setItem('flowfocus_habits', JSON.stringify(habits));
        }
    };
    
    const openDialogForTask = (task: Task | null) => {
        setEditingTask(task);
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
        setIsDialogOpen(true);
    };
    
    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        setTaskToDelete(null); // Close confirmation dialog
    };

    function onSubmit(data: z.infer<typeof taskFormSchema>) {
        const newHabitId = data.habitId === 'none' || !data.habitId ? undefined : data.habitId;
        
        if (editingTask) {
            const updatedTask: Task = {
                ...editingTask,
                name: data.name,
                description: data.description,
                category: data.category,
                dueDate: data.dueDate ? data.dueDate.toISOString() : null,
                priority: data.priority as 'low' | 'medium' | 'high',
                habitId: newHabitId,
            };
            setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
        } else {
            const newTask: Task = {
                id: `t${Date.now()}`,
                name: data.name,
                description: data.description,
                category: data.category,
                completed: false,
                dueDate: data.dueDate ? data.dueDate.toISOString() : null,
                priority: data.priority as 'low' | 'medium' | 'high',
                habitId: newHabitId,
            };
            setTasks((currentTasks) => [...currentTasks, newTask]);
        }

        form.reset();
        setIsDialogOpen(false);
        setEditingTask(null);
    }

    const groupedTasks = useMemo(() => {
        return tasks.reduce((acc, task) => {
            const category = task.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [tasks]);

    const defaultActiveCategories = Object.keys(groupedTasks);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">Manage your daily routines and one-time to-dos.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        form.reset();
                        setEditingTask(null);
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialogForTask(null)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                            <DialogDescription>
                                {editingTask ? 'Make changes to your task.' : 'Add a new task to your list. Fill in the details below.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            </div>
            <Accordion type="multiple" defaultValue={defaultActiveCategories} className="w-full">
                {Object.entries(groupedTasks).map(([category, tasksInCategory]) => (
                    <AccordionItem value={category} key={category}>
                        <AccordionTrigger>
                            <h2 className="text-xl font-headline font-semibold">{category}</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid gap-2 pt-4">
                                {tasksInCategory.sort((a,b) => Number(a.completed) - Number(b.completed)).map(task => (
                                    <Card key={task.id} className={cn("shadow-sm transition-all", task.completed && "opacity-50")}>
                                        <CardContent className="p-3 flex items-start gap-4">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={(checked) => handleTaskCompletion(task.id, !!checked)}
                                                id={`task-${task.id}`}
                                                aria-label={`Mark ${task.name} as completed`}
                                                className="mt-1"
                                            />
                                            <div className="flex-grow space-y-1">
                                                <p className={cn("font-medium", task.completed && "line-through")}>{task.name}</p>
                                                 {task.description && (
                                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                                )}
                                                {task.dueDate && (
                                                     <p className="text-xs text-muted-foreground">
                                                        Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                                     </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {task.habitId && <Tag className="size-4 text-muted-foreground" title="Linked to a habit" />}
                                                <Badge variant="outline" className={cn("capitalize border", priorityStyles[task.priority])}>
                                                    {task.priority}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">More options</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDialogForTask(task)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
             <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task: "{taskToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTask(taskToDelete!.id)} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
