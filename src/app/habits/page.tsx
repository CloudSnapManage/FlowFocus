
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import * as z from "zod";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Flame, Pencil, MoreVertical, Trash2 } from "lucide-react";
import type { Habit } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { HabitFormDialog, type HabitFormData } from "@/components/habit-form-dialog";

const initialHabits: Habit[] = [
    { id: 'h1', name: "Read", category: "Mind", type: 'quantitative', streak: 12, completedToday: false, value: 0, target: 30, unit: 'min' },
    { id: 'h2', name: "Workout", category: "Health", type: 'binary', streak: 5, completedToday: false, value: 0, target: 1, unit: '' },
    { id: 'h3', name: "Code", category: "Work", type: 'quantitative', streak: 27, completedToday: false, value: 0, target: 60, unit: 'min' },
    { id: 'h4', name: "Meditate", category: "Mind", type: 'binary', streak: 2, completedToday: false, value: 0, target: 1, unit: '' },
    { id: 'h5', name: "Drink water", category: "Health", type: 'binary', streak: 40, completedToday: false, value: 1, target: 1, unit: '' },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    const storedHabits = localStorage.getItem(LOCAL_STORAGE_KEYS.HABITS);
    if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
    } else {
        setHabits(initialHabits);
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEYS.HABITS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.HABITS, JSON.stringify(habits));
    }
  }, [habits]);

  const handleHabitChange = useCallback((id: string, newProps: Partial<Habit>) => {
    setHabits(currentHabits =>
      currentHabits.map(h => (h.id === id ? { ...h, ...newProps } : h))
    );
  }, []);
  
  const handleBinaryToggle = useCallback((habit: Habit) => {
    handleHabitChange(habit.id, { completedToday: !habit.completedToday });
  }, [handleHabitChange]);
  
  const handleQuantitativeChange = useCallback((habit: Habit, newInputValue: number) => {
    const value = Math.max(0, newInputValue || 0);
    const completedToday = habit.target > 0 ? value >= habit.target : false;
    handleHabitChange(habit.id, { value, completedToday });
  }, [handleHabitChange]);

  const handleOpenDialog = useCallback((habit: Habit | null) => {
    setEditingHabit(habit);
    setIsDialogOpen(true);
  }, []);

  const handleSubmitForm = useCallback((data: HabitFormData) => {
    if (editingHabit) {
      const updatedHabit = {
        ...editingHabit,
        name: data.name.trim(),
        category: data.category.trim(),
        type: data.type,
        target: data.type === 'binary' ? 1 : data.target || 1,
        unit: data.type === 'binary' ? '' : data.unit?.trim() || '',
        goalStreak: data.goalStreak,
      };
      setHabits(habits.map(h => h.id === editingHabit.id ? updatedHabit : h));
    } else {
      const newHabit: Habit = {
          id: `h${Date.now()}`,
          name: data.name.trim(),
          category: data.category.trim(),
          type: data.type,
          streak: 0,
          completedToday: false,
          value: 0,
          target: data.type === 'binary' ? 1 : data.target || 1,
          unit: data.type === 'binary' ? '' : data.unit?.trim() || '',
          goalStreak: data.goalStreak,
      };
      setHabits(currentHabits => [...currentHabits, newHabit]);
    }
  }, [editingHabit, habits]);

  const handleDeleteHabit = () => {
    if (!habitToDelete) return;
    setHabits(habits.filter(h => h.id !== habitToDelete.id));
    setHabitToDelete(null);
  };

  const groupedHabits = useMemo(() => {
    return habits.reduce((acc, habit) => {
        const category = habit.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(habit);
        return acc;
    }, {} as Record<string, Habit[]>);
  }, [habits]);

  const defaultActiveCategories = Object.keys(groupedHabits);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistent routines and watch your streaks grow.</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={defaultActiveCategories} className="w-full">
        {Object.entries(groupedHabits).map(([category, habitsInCategory]) => (
            <AccordionItem value={category} key={category}>
                <AccordionTrigger>
                    <h2 className="text-xl font-headline font-semibold">{category}</h2>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                        {habitsInCategory.map((habit) => (
                            <Card key={habit.id} className={`shadow-sm transition-all ${habit.completedToday ? 'border-primary' : ''}`}>
                                <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                    <CardTitle className="text-lg font-headline">{habit.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 pt-1">
                                        <Flame className={`size-4 ${habit.streak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                                        {habit.streak > 0 ? `${habit.streak} day streak` : "No streak yet"}
                                    </CardDescription>
                                    </div>
                                    <div className="flex items-center">
                                        {habit.type === 'binary' && (
                                            <div className="flex items-center space-x-2 pr-1">
                                                <Checkbox checked={habit.completedToday} onClick={() => handleBinaryToggle(habit)} id={habit.id} aria-label={`Mark ${habit.name} as completed`} />
                                            </div>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(habit)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setHabitToDelete(habit)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                </CardHeader>
                                <CardContent>
                                    {habit.type === 'quantitative' ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-muted-foreground">Progress</span>
                                                <div className="flex items-baseline gap-1">
                                                    <Input 
                                                        type="number" 
                                                        value={habit.value} 
                                                        onChange={(e) => handleQuantitativeChange(habit, parseInt(e.target.value, 10))}
                                                        className="w-20 h-8 text-right font-mono"
                                                    />
                                                    <span className="text-sm text-muted-foreground">/ {habit.target} {habit.unit}</span>
                                                </div>
                                            </div>
                                            <Progress value={habit.target > 0 ? (habit.value / habit.target) * 100 : 0} className="h-2"/>
                                        </div>
                                    ) : (
                                       <div className="h-[44px]" />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>

      <HabitFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitForm}
        habit={editingHabit}
      />

       <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the "{habitToDelete?.name}" habit.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setHabitToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteHabit} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
