
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrainCircuit, Copy, NotebookText, Repeat, Timer, ListTodo } from "lucide-react";
import Link from "next/link";
import { PomodoroChart } from "@/components/pomodoro-chart";
import React, { useEffect, useState } from "react";
import type { Habit, Task } from "@/lib/types";
import { Progress } from "@/components/ui/progress";


export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    const storedHabits = localStorage.getItem('flowfocus_habits');
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    const storedTasks = localStorage.getItem('flowfocus_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  const features = [
    { title: "Pomodoro Timer", description: "Stay focused with the Pomodoro technique.", icon: Timer, href: "/pomodoro" },
    { title: "Tasks", description: "Manage your to-do list for the day.", icon: ListTodo, href: "/tasks" },
    { title: "Habit Tracker", description: "Build good habits and track your progress.", icon: Repeat, href: "/habits" },
    { title: "Flashcards", description: "Review and memorize with digital flashcards.", icon: Copy, href: "/flashcards" },
    { title: "Notes", description: "Capture your thoughts with Markdown support.", icon: NotebookText, href: "/notes" },
    { title: "AI Study Plan", description: "Generate a personalized study plan.", icon: BrainCircuit, href: "/study-plan" },
  ];

  const completedHabits = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your activities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="hover:border-primary transition-colors flex flex-col shadow-sm">
            <Link href={feature.href} className="flex-grow flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium font-headline">{feature.title}</CardTitle>
                <feature.icon className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
       <div className="grid gap-4 md:grid-cols-2">
        <PomodoroChart />
        <Card>
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>A summary of your completed habits and tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Habits Completed</span>
                <span className="text-sm text-muted-foreground">{completedHabits} of {totalHabits}</span>
              </div>
              <Progress value={habitProgress} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm text-muted-foreground">{completedTasks} of {totalTasks}</span>
              </div>
              <Progress value={taskProgress} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
