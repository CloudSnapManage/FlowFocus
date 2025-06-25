
"use client";

import { useState, useMemo, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import type { Task, Habit } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const initialTasks: Task[] = [
    { id: 't1', name: "Finish project report", category: "Work", completed: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), priority: 'high' },
    { id: 't2', name: "Go for a 30-min run", category: "Health", completed: false, dueDate: new Date().toISOString(), priority: 'medium', habitId: 'h2' },
    { id: 't3', name: "Read 1 chapter of a book", category: "Mind", completed: false, dueDate: new Date().toISOString(), priority: 'low', habitId: 'h1' },
    { id: 't4', name: "Buy groceries", category: "Personal", completed: true, dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), priority: 'medium' },
    { id: 't5', name: "Review PRs", category: "Work", completed: false, dueDate: new Date().toISOString(), priority: 'high', habitId: 'h3' },
];

const priorityStyles = {
    high: "bg-red-500/20 text-red-700 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 border-green-500/30",
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const storedTasks = localStorage.getItem('flowfocus_tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            setTasks(initialTasks);
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
                <Button>
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
                                        <CardContent className="p-3 flex items-center gap-4">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={(checked) => handleTaskCompletion(task.id, !!checked)}
                                                id={`task-${task.id}`}
                                                aria-label={`Mark ${task.name} as completed`}
                                            />
                                            <div className="flex-grow">
                                                <p className={cn("font-medium", task.completed && "line-through")}>{task.name}</p>
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
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
