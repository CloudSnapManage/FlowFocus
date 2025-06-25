
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Task, Habit } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Tag, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { TaskFormDialog, type TaskFormData } from "@/components/task-form-dialog";

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

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    useEffect(() => {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS);
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            setTasks(initialTasks);
        }

        const storedHabits = localStorage.getItem(LOCAL_STORAGE_KEYS.HABITS);
        if (storedHabits) {
            setHabits(JSON.parse(storedHabits));
        }
    }, []);

    useEffect(() => {
        if (tasks.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEYS.TASKS)) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.TASKS, JSON.stringify(tasks));
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
        const storedHabits = localStorage.getItem(LOCAL_STORAGE_KEYS.HABITS);
        if (storedHabits) {
            let habits: Habit[] = JSON.parse(storedHabits);
            habits = habits.map(h => {
                if (h.id === habitId) {
                    return { ...h, completedToday: completed, value: completed ? h.target : 0 };
                }
                return h;
            });
            localStorage.setItem(LOCAL_STORAGE_KEYS.HABITS, JSON.stringify(habits));
        }
    };
    
    const openDialogForTask = useCallback((task: Task | null) => {
        setEditingTask(task);
        setIsDialogOpen(true);
    }, []);
    
    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        setTaskToDelete(null); // Close confirmation dialog
    };

    const handleSubmitForm = useCallback((data: TaskFormData) => {
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
    }, [editingTask, tasks]);

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
                <Button onClick={() => openDialogForTask(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
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
            
            <TaskFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmitForm}
                task={editingTask}
                habits={habits}
            />

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
