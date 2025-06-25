
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BrainCircuit, Loader2, Check, Download, Trash2, ArrowLeft } from 'lucide-react';
import type { StudyPlan, WeeklyPlan, StudyTask } from '@/lib/types';
import { generateStudyPlan, type StudyPlanInput } from '@/ai/flows/generate-study-plan';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const planFormSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters long."),
  duration: z.string().min(5, "Please specify a study duration."),
  details: z.string().optional(),
});

export default function StudyPlanPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      subject: "",
      duration: "",
      details: "",
    },
  });

  useEffect(() => {
    const savedPlan = localStorage.getItem('flowfocus_study_plan');
    if (savedPlan) {
      setStudyPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handleGeneratePlan = async (data: z.infer<typeof planFormSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateStudyPlan(data as StudyPlanInput);
      setStudyPlan(plan);
      localStorage.setItem('flowfocus_study_plan', JSON.stringify(plan));
    } catch (e) {
      console.error(e);
      setError("Failed to generate study plan. Please try again.");
      toast({
        title: "Error",
        description: "There was a problem generating your study plan. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (weekIndex: number, taskIndex: number, completed: boolean) => {
    if (!studyPlan) return;

    const newPlan = { ...studyPlan };
    newPlan.weeklyPlans[weekIndex].tasks[taskIndex].completed = completed;

    setStudyPlan(newPlan);
    localStorage.setItem('flowfocus_study_plan', JSON.stringify(newPlan));
  };
  
  const handleResetPlan = () => {
    setStudyPlan(null);
    localStorage.removeItem('flowfocus_study_plan');
    form.reset();
  }
  
  const handleExportPlan = () => {
    if (!studyPlan) return;

    let markdownContent = `# Study Plan: ${studyPlan.goal}\n\n`;

    studyPlan.weeklyPlans.forEach(week => {
        markdownContent += `## Week ${week.week}: ${week.theme}\n\n`;
        week.tasks.forEach(task => {
            markdownContent += `- [${task.completed ? 'x' : ' '}] **${task.topic}** (${task.duration})\n`;
            markdownContent += `  - ${task.description}\n`;
        });
        markdownContent += `\n`;
    });
    
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = studyPlan.goal.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `study_plan_${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


  const progress = useMemo(() => {
    if (!studyPlan) return { total: 0, completed: 0, percentage: 0 };
    const allTasks = studyPlan.weeklyPlans.flatMap(w => w.tasks);
    const completedTasks = allTasks.filter(t => t.completed);
    return {
      total: allTasks.length,
      completed: completedTasks.length,
      percentage: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
    };
  }, [studyPlan]);


  if (studyPlan) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button variant="ghost" onClick={handleResetPlan} className='mb-4'>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Form
                </Button>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Your Study Plan: {studyPlan.goal}</h1>
                <p className="text-muted-foreground">Here is the schedule generated by AI. Check off tasks as you complete them.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                    <CardDescription>You have completed {progress.completed} of {progress.total} tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={progress.percentage} className="h-2"/>
                </CardContent>
                <CardFooter className='gap-2'>
                     <Button onClick={handleExportPlan}>
                        <Download className="mr-2 h-4 w-4"/>
                        Export as Markdown
                    </Button>
                    <Button variant="destructive" onClick={handleResetPlan}>
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Delete and Start Over
                    </Button>
                </CardFooter>
            </Card>

            <Accordion type="multiple" defaultValue={['week-0']} className="w-full">
                {studyPlan.weeklyPlans.map((week, weekIndex) => (
                    <AccordionItem value={`week-${weekIndex}`} key={week.week}>
                        <AccordionTrigger>
                            <div className='flex flex-col items-start'>
                                <h3 className="text-xl font-headline font-semibold">Week {week.week}: {week.theme}</h3>
                                <p className='text-sm text-muted-foreground font-normal'>
                                    {week.tasks.filter(t => t.completed).length} / {week.tasks.length} tasks completed
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='space-y-3 pt-2'>
                           {week.tasks.map((task, taskIndex) => (
                                <Card key={task.id} className={task.completed ? 'bg-muted/50' : ''}>
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <Checkbox
                                            id={task.id}
                                            checked={task.completed}
                                            onCheckedChange={(checked) => handleTaskToggle(weekIndex, taskIndex, !!checked)}
                                            className='mt-1'
                                        />
                                        <div className='grid gap-1.5 leading-none'>
                                            <label htmlFor={task.id} className="text-base font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {task.topic} <span className="text-sm font-normal text-muted-foreground">({task.duration})</span>
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
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI Study Planner</h1>
        <p className="text-muted-foreground">Let our AI generate a personalized study schedule to help you achieve your goals.</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Describe Your Goal</CardTitle>
          <CardDescription>Tell our AI what you want to learn, your time constraints, and any other relevant details.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGeneratePlan)}>
                <CardContent className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject / Topic</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Data Structures in Python" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Study Duration</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 2 weeks, 1 hour per day" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Details (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., I'm a beginner, focus on practical examples." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
  )
}
