
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Flame } from "lucide-react";
import type { Habit, HabitType } from "@/lib/types";

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
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("");
  const [newHabitType, setNewHabitType] = useState<HabitType>("binary");
  const [newHabitTarget, setNewHabitTarget] = useState(1);
  const [newHabitUnit, setNewHabitUnit] = useState("");

  useEffect(() => {
    const storedHabits = localStorage.getItem('flowfocus_habits');
    if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
    } else {
        setHabits(initialHabits);
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('flowfocus_habits', JSON.stringify(habits));
    }
  }, [habits]);

  const handleHabitChange = (id: string, newProps: Partial<Habit>) => {
    setHabits(currentHabits =>
      currentHabits.map(h => (h.id === id ? { ...h, ...newProps } : h))
    );
  };
  
  const handleBinaryToggle = (habit: Habit) => {
    handleHabitChange(habit.id, { completedToday: !habit.completedToday });
  };
  
  const handleQuantitativeChange = (habit: Habit, newInputValue: number) => {
    const value = Math.max(0, newInputValue || 0);
    const completedToday = habit.target > 0 ? value >= habit.target : false;
    handleHabitChange(habit.id, { value, completedToday });
  };

  const resetNewHabitForm = () => {
    setNewHabitName("");
    setNewHabitCategory("");
    setNewHabitType("binary");
    setNewHabitTarget(1);
    setNewHabitUnit("");
  }

  const handleAddHabit = () => {
    if (!newHabitName.trim() || !newHabitCategory.trim()) {
        // TODO: Add toast notification for validation error
        return;
    }

    const newHabit: Habit = {
        id: `h${Date.now()}`,
        name: newHabitName.trim(),
        category: newHabitCategory.trim(),
        type: newHabitType,
        streak: 0,
        completedToday: false,
        value: 0,
        target: newHabitType === 'binary' ? 1 : newHabitTarget,
        unit: newHabitType === 'binary' ? '' : newHabitUnit.trim(),
    };

    setHabits([...habits, newHabit]);
    resetNewHabitForm();
    setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={() => resetNewHabitForm()}>
                <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                    <DialogDescription>
                        Create a new habit to track. You can group it by category.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} className="col-span-3" placeholder="e.g., Read a book"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Input id="category" value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)} className="col-span-3" placeholder="e.g., Health, Study"/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={newHabitType} onValueChange={(value) => setNewHabitType(value as HabitType)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="binary">Binary (Done/Not Done)</SelectItem>
                                <SelectItem value="quantitative">Quantitative (e.g., 30 mins)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {newHabitType === 'quantitative' && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="target" className="text-right">Target</Label>
                                <Input id="target" type="number" value={newHabitTarget} onChange={(e) => setNewHabitTarget(Number(e.target.value))} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">Unit</Label>
                                <Input id="unit" value={newHabitUnit} onChange={(e) => setNewHabitUnit(e.target.value)} className="col-span-3" placeholder="e.g., min, pages, reps" />
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={resetNewHabitForm}>Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddHabit}>Save Habit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                                    {habit.type === 'binary' && (
                                        <div className="flex items-center space-x-2 pt-1">
                                            <Checkbox checked={habit.completedToday} onClick={() => handleBinaryToggle(habit)} id={habit.id} aria-label={`Mark ${habit.name} as completed`} />
                                        </div>
                                    )}
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
    </div>
  )
}
