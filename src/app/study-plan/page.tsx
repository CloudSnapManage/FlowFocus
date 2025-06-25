
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, startOfWeek } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { BrainCircuit, Loader2, Trash2, ArrowLeft, Send, CalendarIcon } from 'lucide-react';
import type { StudyPlan, StudyTask } from '@/lib/types';
import { generateStudyPlan, type StudyPlanInput } from '@/ai/flows/generate-study-plan';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useStudyPlans } from '@/hooks/use-study-plans';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

const planFormSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters long."),
  weeks: z.coerce.number().min(1, "Must be at least 1 week.").max(12),
  daysPerWeek: z.coerce.number().min(1, "Must be at least 1 day.").max(7),
  hoursPerDay: z.coerce.number().min(0.5, "Must be at least 0.5 hours.").max(8),
  startDate: z.date({ required_error: "A start date is required." }),
  pace: z.enum(['slow', 'medium', 'fast']),
  studyType: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one study type.",
  }),
  interests: z.string().optional(),
});

const studyTypes = [
    { id: 'videos', label: 'Videos' },
    { id: 'articles', label: 'Articles' },
    { id: 'practice', label: 'Practice/Projects' },
];

function parseDurationToHours(durationStr: string): number {
    if (!durationStr) return 0;
    const hoursMatch = durationStr.match(/(\d+(\.\d+)?)\s*hours?/);
    const minutesMatch = durationStr.match(/(\d+)\s*minutes?|mins?/);

    let totalHours = 0;
    if (hoursMatch) { totalHours += parseFloat(hoursMatch[1]); }
    if (minutesMatch) { totalHours += parseInt(minutesMatch[1], 10) / 60; }
    return totalHours;
}

export default function StudyPlanPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addPlan } = useStudyPlans();

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      subject: "",
      weeks: 4,
      daysPerWeek: 5,
      hoursPerDay: 2,
      startDate: new Date(),
      pace: 'medium',
      studyType: ['videos', 'practice'],
      interests: "",
    },
  });

  useEffect(() => {
    const savedPlan = localStorage.getItem('flowfocus_ai_study_plan');
    if (savedPlan) {
      try {
        setStudyPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Failed to parse study plan from localStorage", e);
        localStorage.removeItem('flowfocus_ai_study_plan');
      }
    }
  }, []);

  const handleGeneratePlan = async (data: z.infer<typeof planFormSchema>) => {
    setIsLoading(true);
    
    const duration = `${data.weeks} weeks, about ${data.daysPerWeek} days a week, and ${data.hoursPerDay} hours per day.`;
    const details = `Learning pace: ${data.pace}. Preferred study methods: ${data.studyType.join(', ')}. ${data.interests ? `Other interests or details: ${data.interests}` : ''}`;
    
    const aiInput: StudyPlanInput = {
      subject: data.subject,
      duration: duration,
      details: details,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
    };

    try {
      const plan = await generateStudyPlan(aiInput);
      setStudyPlan(plan);
      localStorage.setItem('flowfocus_ai_study_plan', JSON.stringify(plan));
    } catch (e) {
      console.error(e);
      toast({
        title: "Error Generating Plan",
        description: "There was a problem generating your study plan. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    if (!studyPlan) return;
    const newPlan = { ...studyPlan };
    newPlan.tasks = newPlan.tasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    setStudyPlan(newPlan);
    localStorage.setItem('flowfocus_ai_study_plan', JSON.stringify(newPlan));
  };
  
  const handleResetPlan = () => {
    setStudyPlan(null);
    localStorage.removeItem('flowfocus_ai_study_plan');
    form.reset();
  }

  const handleSendToPlans = () => {
    if (!studyPlan) return;
    addPlan(studyPlan);
    toast({
        title: "Plan Saved!",
        description: `"${studyPlan.title}" has been added to your Study Plans.`,
    });
    handleResetPlan();
  };

  const weeklyGroupedTasks = useMemo(() => {
    if (!studyPlan || !studyPlan.tasks) return [];

    const groupedByWeek: Record<string, StudyTask[]> = {};

    studyPlan.tasks.forEach(task => {
        try {
            const taskDate = parseISO(task.date);
            const weekStartDate = startOfWeek(taskDate, { weekStartsOn: 1 });
            const weekKey = format(weekStartDate, 'yyyy-MM-dd');

            if (!groupedByWeek[weekKey]) {
                groupedByWeek[weekKey] = [];
            }
            groupedByWeek[weekKey].push(task);
        } catch (error) {
            console.warn(`Skipping task with invalid date:`, task);
        }
    });

    return Object.keys(groupedByWeek)
        .sort((a, b) => a.localeCompare(b))
        .map((weekKey, index) => ({
            week: index + 1,
            weekOf: format(parseISO(weekKey), 'MMM dd'),
            tasks: groupedByWeek[weekKey].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()),
        }));
  }, [studyPlan]);

  const progress = useMemo(() => {
    if (!studyPlan) return { total: 0, completed: 0, percentage: 0, hoursStudied: 0, totalHours: 0 };
    const allTasks = studyPlan.tasks;
    const completedTasks = allTasks.filter(t => t.completed);

    const hoursStudied = completedTasks.reduce((sum, task) => sum + parseDurationToHours(task.duration), 0);
    const totalHours = allTasks.reduce((sum, task) => sum + parseDurationToHours(task.duration), 0);

    return {
      total: allTasks.length,
      completed: completedTasks.length,
      percentage: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      hoursStudied: parseFloat(hoursStudied.toFixed(1)),
      totalHours: parseFloat(totalHours.toFixed(1)),
    };
  }, [studyPlan]);


  if (studyPlan) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="ghost" onClick={handleResetPlan} className="mb-4 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Create a New Plan
                </Button>
                <h1 className="text-3xl font-bold font-headline tracking-tight">{studyPlan.title}</h1>
                <p className="text-muted-foreground">Here is the schedule generated by AI for your goal: "{studyPlan.goal}"</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <p className="font-medium">Task Completion</p>
                            <p className="text-muted-foreground">{progress.completed} of {progress.total} tasks</p>
                        </div>
                        <Progress value={progress.percentage} className="h-2"/>
                    </div>
                     <div>
                        <div className="flex justify-between text-sm mb-1">
                            <p className="font-medium">Time Studied</p>
                            <p className="text-muted-foreground">{progress.hoursStudied} / {progress.totalHours} hours</p>
                        </div>
                        <Progress value={(progress.totalHours > 0 ? (progress.hoursStudied / progress.totalHours) * 100 : 0)} className="h-2"/>
                    </div>
                </CardContent>
                <CardFooter className="gap-2 flex-wrap">
                    <Button onClick={handleSendToPlans}>
                        <Send className="mr-2 h-4 w-4" />
                        Send to Study Plans
                    </Button>
                    <Button variant="destructive" onClick={handleResetPlan}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Discard Plan
                    </Button>
                </CardFooter>
            </Card>

            <Accordion type="multiple" defaultValue={['week-1']} className="w-full">
                {weeklyGroupedTasks.map((week) => (
                    <AccordionItem value={`week-${week.week}`} key={week.week}>
                        <AccordionTrigger>
                            <div className="flex flex-col items-start">
                                <h3 className="text-xl font-headline font-semibold">Week {week.week} <span className="text-base font-normal text-muted-foreground">(Week of {week.weekOf})</span></h3>
                                <p className="text-sm text-muted-foreground font-normal">
                                    {week.tasks.filter(t => t.completed).length} / {week.tasks.length} tasks completed
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-2">
                           {week.tasks.map((task) => (
                                <Card key={task.id} className={task.completed ? 'bg-muted/50' : ''}>
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <Checkbox
                                            id={task.id}
                                            checked={task.completed}
                                            onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none flex-1">
                                            <label htmlFor={task.id} className="text-base font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {task.topic} 
                                                <span className="text-sm font-normal text-muted-foreground ml-2">({task.duration})</span>
                                                <span className="text-sm font-normal text-muted-foreground ml-2">| {format(parseISO(task.date), 'EEE, MMM dd')}</span>
                                            </label>
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
  } else {
    return (
        <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">AI Study Planner</h1>
            <p className="text-muted-foreground">Let our AI generate a personalized study schedule to help you achieve your goals.</p>
        </div>
        <Card className="shadow-sm">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGeneratePlan)}>
                <CardHeader>
                <CardTitle>Describe Your Goal</CardTitle>
                <CardDescription>Tell the AI what you want to learn, your time constraints, and your preferences.</CardDescription>
                </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What do you want to learn?</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Data Structures in Python, React for Beginners" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="weeks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Weeks</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="daysPerWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Days per Week</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hours per Day</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
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
                                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="studyType"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                    <FormLabel className="text-base">Preferred Study Methods</FormLabel>
                                    <FormDescription>
                                        Select how you like to learn.
                                    </FormDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                    {studyTypes.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="studyType"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            (field.value || []).filter(
                                                            (value) => value !== item.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pace"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Learning Pace</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a pace" />
                                        </Trigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="slow">Slow & Steady</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="fast">Fast-paced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Details (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., I'm a complete beginner. I want to focus on practical, hands-on examples." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                        ) : (
                        <><BrainCircuit className="mr-2 h-4 w-4" /> Generate Plan</>
                        )}
                    </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
        </div>
    );
  }
}
