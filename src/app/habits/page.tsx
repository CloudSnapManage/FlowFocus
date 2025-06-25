
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Flame, Pencil, MoreVertical, Trash2 } from "lucide-react";
import type { Habit } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const initialHabits: Habit[] = [
    { id: 'h1', name: "Read", category: "Mind", type: 'quantitative', streak: 12, completedToday: false, value: 0, target: 30, unit: 'min' },
    { id: 'h2', name: "Workout", category: "Health", type: 'binary', streak: 5, completedToday: false, value: 0, target: 1, unit: '' },
    { id: 'h3', name: "Code", category: "Work", type: 'quantitative', streak: 27, completedToday: false, value: 0, target: 60, unit: 'min' },
    { id: 'h4', name: "Meditate", category: "Mind", type: 'binary', streak: 2, completedToday: false, value: 0, target: 1, unit: '' },
    { id: 'h5', name: "Drink water", category: "Health", type: 'binary', streak: 40, completedToday: false, value: 1, target: 1, unit: '' },
];

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


export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const form = useForm<z.infer<typeof habitFormSchema>>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      category: "",
      type: "binary",
      target: 1,
      unit: "",
      goalStreak: 21,
    },
  });

  const habitType = form.watch("type");
  
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

  const openDialogForHabit = (habit: Habit | null) => {
    setEditingHabit(habit);
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
    setIsDialogOpen(true);
  };

  function onSubmit(data: z.infer<typeof habitFormSchema>) {
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
    
    setIsDialogOpen(false);
    setEditingHabit(null);
  }

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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                form.reset();
                setEditingHabit(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button onClick={() => openDialogForHabit(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Habit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
                    <DialogDescription>
                        {editingHabit ? "Make changes to your habit." : "Create a new habit to track. You can group it by category."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                <DropdownMenuItem onClick={() => openDialogForHabit(habit)}>
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
