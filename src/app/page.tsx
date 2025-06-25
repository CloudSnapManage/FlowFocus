
"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Copy, NotebookText, Timer, ListTodo, ArrowRight, BookOpen, Clock, GripVertical, Settings, Undo, Check } from "lucide-react";
import Link from "next/link";
import { PomodoroChart } from "@/components/pomodoro-chart";
import React, { useEffect, useState, useMemo } from "react";
import type { Habit, Task, Note, StudyPlan, StudyTask } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { format, isToday, parseISO, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

const priorityStyles = {
    high: "bg-red-500/20 text-red-700 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 border-green-500/30",
};

const DashboardCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { isCustomizing?: boolean }>(
  ({ className, children, isCustomizing, ...props }, ref) => (
    <div ref={ref} {...props} className={cn("bg-card rounded-lg border shadow-sm flex flex-col", className)}>
      {children}
      {isCustomizing && <div className="react-resizable-handle" />}
    </div>
  )
);
DashboardCard.displayName = "DashboardCard";

const DraggableCardHeader = ({ children, isCustomizing }: { children: React.ReactNode, isCustomizing: boolean }) => (
  <CardHeader className={cn(isCustomizing && 'draggable-handle cursor-move', 'flex-row items-center justify-between')}>
      <div>{children}</div>
      {isCustomizing && <GripVertical className="text-muted-foreground" />}
  </CardHeader>
);


export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { layouts, isCustomizing, setIsCustomizing, onLayoutChange, resetLayouts } = useDashboardLayout();
  
  useEffect(() => {
    setIsMounted(true);
    const loadData = () => {
      try {
        const storedHabits = localStorage.getItem('flowfocus_habits');
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        
        const storedTasks = localStorage.getItem('flowfocus_tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        
        const storedNotes = localStorage.getItem('flowfocus_notes');
        if (storedNotes) setNotes(JSON.parse(storedNotes));

        const storedStudyPlans = localStorage.getItem('flowfocus_study_plans');
        if (storedStudyPlans) setStudyPlans(JSON.parse(storedStudyPlans));
      } catch (error) {
        console.error("Failed to load data from localStorage", error);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    }
  }, []);

  const completedHabits = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const recentNotes = useMemo(() => notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3), [notes]);
    
  const todaysAgenda = useMemo(() => [
    ...tasks.filter(task => task.dueDate && isToday(parseISO(task.dueDate)) && !task.completed),
    ...studyPlans.flatMap(plan => 
        plan.tasks
            .filter(task => isToday(parseISO(task.date)) && !task.completed)
            .map(studyTask => ({...studyTask, planTitle: plan.title, type: 'study'} as const))
    )
  ].sort((a,b) => {
    const dateA = 'dueDate' in a ? a.dueDate : a.date;
    const dateB = 'dueDate' in b ? b.dueDate : b.date;
    return new Date(dateA!).getTime() - new Date(dateB!).getTime()
  }), [tasks, studyPlans]);

  const dashboardItems = {
    agenda: (
      <DashboardCard key="agenda" isCustomizing={isCustomizing} className="flex flex-col">
        <DraggableCardHeader isCustomizing={isCustomizing}>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="text-primary"/>
            Today's Agenda
          </CardTitle>
          <CardDescription>Tasks and study items scheduled for today.</CardDescription>
        </DraggableCardHeader>
        <CardContent className="flex-grow">
          {todaysAgenda.length > 0 ? (
            <div className="space-y-4">
              {todaysAgenda.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {'planTitle' in item ? <BookOpen className="w-5 h-5 text-purple-500" /> : <ListTodo className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{'name' in item ? item.name : item.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {'planTitle' in item ? (
                          <>From plan: <span className="font-semibold">{item.planTitle}</span></>
                      ) : (
                          <>Category: <span className="font-semibold">{item.category}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {'duration' in item && item.duration && (
                      <span className="flex items-center gap-1">
                       <Clock className="w-4 h-4" /> {item.duration}
                      </span>
                    )}
                    {'priority' in item && (
                      <Badge variant="outline" className={cn("capitalize", priorityStyles[item.priority])}>{item.priority}</Badge>
                    )}
                  </div>
                </div>
              ))}
              {todaysAgenda.length > 5 && (
                <p className="text-sm text-center text-muted-foreground pt-2">
                  ...and {todaysAgenda.length - 5} more.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Nothing on the agenda for today. Enjoy your break!</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
             <Button asChild variant="ghost" className="ml-auto">
                <Link href="/tasks">
                    View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </DashboardCard>
    ),
    notes: (
        <DashboardCard key="notes" isCustomizing={isCustomizing} className="flex flex-col">
            <DraggableCardHeader isCustomizing={isCustomizing}>
              <CardTitle className="flex items-center gap-2">
                <NotebookText className="text-primary"/>
                Recent Notes
              </CardTitle>
              <CardDescription>Jump back into your recent thoughts and ideas.</CardDescription>
            </DraggableCardHeader>
            <CardContent className="flex-grow">
              {recentNotes.length > 0 ? (
                <div className="space-y-3">
                  {recentNotes.map(note => (
                    <Link key={note.id} href="/notes" className="block p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                      <h4 className="font-semibold truncate">{note.title}</h4>
                      <p className="text-sm text-muted-foreground">Last updated: {formatDistanceToNow(parseISO(note.updatedAt), { addSuffix: true })}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No notes found. Create your first one!</p>
                   <Button asChild variant="secondary" className="mt-4">
                    <Link href="/notes">Create Note</Link>
                   </Button>
                </div>
              )}
            </CardContent>
        </DashboardCard>
    ),
    progress: (
      <DashboardCard key="progress" isCustomizing={isCustomizing}>
        <DraggableCardHeader isCustomizing={isCustomizing}>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>Your habit and task completion for today.</CardDescription>
        </DraggableCardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium">Habits Completed</span>
              <span className="text-muted-foreground">{completedHabits} of {totalHabits}</span>
            </div>
            <Progress value={habitProgress} aria-label={`${Math.round(habitProgress)}% of habits completed`} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium">Tasks Completed</span>
              <span className="text-muted-foreground">{completedTasks} of {totalTasks}</span>
            </div>
            <Progress value={taskProgress} aria-label={`${Math.round(taskProgress)}% of tasks completed`} />
          </div>
        </CardContent>
      </DashboardCard>
    ),
    pomodoro: (
      <DashboardCard key="pomodoro" isCustomizing={isCustomizing} className="h-full">
         <PomodoroChart />
      </DashboardCard>
    ),
    features: (
      <DashboardCard key="features" isCustomizing={isCustomizing}>
          <DraggableCardHeader isCustomizing={isCustomizing}>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="text-primary"/>
                Explore Features
              </CardTitle>
              <CardDescription>Discover all the tools available to you.</CardDescription>
          </DraggableCardHeader>
          <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/pomodoro"><Timer className="mr-2"/> Pomodoro Timer</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/flashcards"><Copy className="mr-2"/> Flashcard Decks</Link>
              </Button>
               <Button asChild variant="outline" className="justify-start">
                <Link href="/study-plan"><BrainCircuit className="mr-2"/> AI Study Planner</Link>
              </Button>
          </CardContent>
      </DashboardCard>
    ),
  };

  if (!isMounted) {
    return (
        <div className="flex justify-center items-center h-full">
            <p>Loading Dashboard...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back! Here's what's on your plate today.</p>
        </div>
        <div className="flex gap-2">
          {isCustomizing ? (
            <>
              <Button variant="outline" onClick={resetLayouts}><Undo className="mr-2 h-4 w-4" /> Reset Layout</Button>
              <Button onClick={() => setIsCustomizing(false)}><Check className="mr-2 h-4 w-4" /> Done</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsCustomizing(true)}><Settings className="mr-2 h-4 w-4" /> Customize</Button>
          )}
        </div>
      </div>
      
      <ResponsiveGridLayout
        className={cn("layout", isCustomizing && "border-2 border-dashed rounded-lg p-2 bg-muted/20")}
        layouts={layouts}
        onLayoutChange={(layout, allLayouts) => onLayoutChange(allLayouts)}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        draggableHandle=".draggable-handle"
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        margin={[16, 16]}
      >
        {layouts.lg.map(item => (dashboardItems as any)[item.i])}
      </ResponsiveGridLayout>

    </div>
  )
}

    