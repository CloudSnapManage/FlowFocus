"use client";

import React, { useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';

import { useStudyPlans } from '@/hooks/use-study-plans';
import type { StudyPlan, StudyTask } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, BookMarked, Pencil, Upload, Download, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

const taskSchema = z.object({
    id: z.string(),
    topic: z.string().min(1, "Topic is required."),
    description: z.string().optional(),
    duration: z.string().min(1, "Duration is required."),
    date: z.date(),
    resource: z.string().optional(),
    completed: z.boolean(),
});

const planSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Plan title is required."),
 goal: z.string().optional(),
    startDate: z.date(),
    tasks: z.array(taskSchema),
});

function parseDurationToHours(durationStr: string): number {
    if (!durationStr) return 0;
    const hoursMatch = durationStr.match(/(\d+(\.\d+)?)\s*hours?/);
    const minutesMatch = durationStr.match(/(\d+)\s*minutes?|mins?/);
    let totalHours = 0;
    if (hoursMatch) totalHours += parseFloat(hoursMatch[1]);
    if (minutesMatch) totalHours += parseInt(minutesMatch[1], 10) / 60;
    return totalHours;
}

const PlanEditor = ({ plan, onSave, onCancel }: { plan?: StudyPlan, onSave: (data: StudyPlan) => void, onCancel: () => void }) => {
    const form = useForm<z.infer<typeof planSchema>>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            id: plan?.id || `plan_${Date.now()}`,
            title: plan?.title || '',
            goal: plan?.goal || '',
            startDate: plan?.startDate ? parseISO(plan.startDate) : new Date(),
            tasks: plan?.tasks.map(t => ({...t, date: parseISO(t.date)})) || [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tasks",
    });

    const onSubmit = (data: z.infer<typeof planSchema>) => {
        onSave({
            ...data,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
 tasks: data.tasks.map(t => ({ ...t, date: format(t.date, 'yyyy-MM-dd'), })),
            goal: data.goal || '', // Ensure goal is a string, even if data.goal is undefined
 // Merge new data into existing userInput, preserving existing fields if they exist
 userInput: {
 subject: plan?.userInput?.subject || data.goal || data.title,
 duration: plan?.userInput?.duration || '',
 details: plan?.userInput?.details || 'Manually created',
 startDate: plan?.userInput?.startDate || format(data.startDate, 'yyyy-MM-dd')
 }
        });
        onCancel();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className='grid md:grid-cols-2 gap-4'>
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Frontend Developer Roadmap" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="goal" render={({ field }) => (
                        <FormItem><FormLabel>Goal</FormLabel><FormControl><Input placeholder="e.g., Master React and TypeScript" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks</CardTitle>
                        <CardDescription>Add or edit the tasks for this study plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[40vh] overflow-y-auto p-4">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="p-3">
                                <div className="space-y-2">
                                    <FormField control={form.control} name={`tasks.${index}.topic`} render={({ field }) => (
                                        <FormItem><FormLabel>Topic</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`tasks.${index}.description`} render={({ field }) => (
                                       <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField control={form.control} name={`tasks.${index}.duration`} render={({ field }) => (
                                           <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="e.g., 2 hours" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`tasks.${index}.date`} render={({ field: { onChange, value } }) => (
                                            <FormItem className="flex flex-col"><FormLabel>Date</FormLabel>
                                                <Popover><PopoverTrigger asChild><FormControl>
                                                    <Button variant="outline" className={cn(!value && "text-muted-foreground")}>
                                                        {value ? format(value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl></PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={value} onSelect={onChange} initialFocus/>
                                                </PopoverContent></Popover><FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <FormField control={form.control} name={`tasks.${index}.resource`} render={({ field }) => (
                                        <FormItem><FormLabel>Resource URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="flex justify-end">
                                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Remove Task
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="button" variant="outline" onClick={() => append({ id: `task_${Date.now()}`, topic: '', description: '', duration: '1 hour', date: new Date(), resource: '', completed: false })}>
                           <Plus className="h-4 w-4 mr-2" /> Add Task
                        </Button>
                    </CardFooter>
                </Card>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit">Save Plan</Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

export default function StudyPlansPage() {
    const { plans, addPlan, updatePlan, deletePlan, importPlans } = useStudyPlans();
    const [editingPlan, setEditingPlan] = useState<StudyPlan | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleSavePlan = (planData: StudyPlan) => {
        if (plans.some(p => p.id === planData.id)) {
            updatePlan(planData.id, planData);
            toast({ title: "Plan Updated", description: `"${planData.title}" has been updated.`});
        } else {
            addPlan(planData);
            toast({ title: "Plan Created", description: `"${planData.title}" has been saved.`});
        }
    };

    const handleEdit = (plan: StudyPlan) => {
        setEditingPlan(plan);
        setIsEditorOpen(true);
    };

    const handleCreateNew = () => {
        setEditingPlan(undefined);
        setIsEditorOpen(true);
    };

    const handleToggleTask = (planId: string, taskId: string, completed: boolean) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            const updatedTasks = plan.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
            updatePlan(planId, { ...plan, tasks: updatedTasks });
        }
    };

    const handleExport = () => {
        if (plans.length === 0) {
            toast({ title: "No plans to export", variant: 'destructive'});
            return;
        }
        const dataStr = JSON.stringify(plans, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `flowfocus_study_plans_${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: "Export Successful" });
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const parsedPlans = JSON.parse(result);
                    // Basic validation
                    if (Array.isArray(parsedPlans) && parsedPlans.every(p => p.id && p.title && p.tasks)) {
                        importPlans(parsedPlans);
                        toast({ title: "Import Successful", description: `${parsedPlans.length} plans were imported.`});
                    } else {
                        throw new Error("Invalid file format.");
                    }
                }
            } catch (error) {
                toast({ title: "Import Failed", description: "The selected file is not a valid study plan export.", variant: 'destructive' });
            } finally {
                // Reset the file input so the same file can be re-uploaded
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Study Plans</h1>
                    <p className="text-muted-foreground">Manage your custom study plans.</p>
                </div>
                 <div className='flex gap-2'>
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import</Button>
                    <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleCreateNew}><Plus className="mr-2 h-4 w-4"/> New Plan</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{editingPlan ? 'Edit Study Plan' : 'Create New Study Plan'}</DialogTitle>
                            </DialogHeader>
                            <PlanEditor plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsEditorOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {plans.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                    {plans.map(plan => {
                        const progress = plan.tasks.length > 0 ? (plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100 : 0;
                        return (
                            <AccordionItem value={plan.id} key={plan.id} className="border rounded-lg bg-card">
                                <div className="flex items-center w-full p-4">
                                    <AccordionTrigger className="flex-1 text-left hover:no-underline p-0">
                                        <div className="flex flex-col items-start text-left w-full">
                                            <h3 className="text-xl font-headline font-semibold">{plan.title}</h3>
                                            <p className="text-sm text-muted-foreground font-normal">{plan.goal}</p>
                                            <div className='w-full mt-2 pr-6'>
                                                <Progress value={progress} className="h-2"/>
                                                <p className='text-xs text-muted-foreground mt-1'>{Math.round(progress)}% complete</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex gap-2 self-center pl-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(plan)}><Pencil className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deletePlan(plan.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                                <AccordionContent className="p-4 pt-0 space-y-2">
                                    {plan.tasks.sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).map(task => (
                                        <Card key={task.id} className={cn("p-3 flex items-start gap-3", task.completed && 'bg-muted/50')}>
                                            <Checkbox id={`${plan.id}-${task.id}`} checked={task.completed} onCheckedChange={(checked) => handleToggleTask(plan.id, task.id, !!checked)} className="mt-1" />
                                            <div className="grid gap-1 leading-none flex-1">
                                                <label htmlFor={`${plan.id}-${task.id}`} className="font-semibold">{task.topic} <span className='font-normal text-muted-foreground text-sm'>({task.duration})</span></label>
                                                <p className="text-sm text-muted-foreground">{format(parseISO(task.date), 'EEE, MMM dd, yyyy')}</p>
                                                {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                                                {task.resource && (
                                                    <a href={task.resource} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5 mt-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span>Suggested Resource</span>
                                                    </a>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
                    <BookMarked className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">No study plans yet</h3>
                    <p className="text-muted-foreground mt-2">Create your first plan or generate one with AI.</p>
                    <Button onClick={handleCreateNew} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create New Plan
                    </Button>
                </div>
            )}
        </div>
    );
}
