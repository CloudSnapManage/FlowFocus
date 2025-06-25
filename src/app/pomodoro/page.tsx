"use client"

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pause, Play, TimerReset } from "lucide-react";

export default function PomodoroPage() {
  const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const timeSettings = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Here you can add notification logic
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(timeSettings[mode]);
  };
  
  const handleModeChange = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setIsActive(false);
    setTime(timeSettings[newMode]);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((timeSettings[mode] - time) / timeSettings[mode]) * 100;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline">Pomodoro Timer</CardTitle>
          <CardDescription className="text-center">Stay focused and get things done.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Tabs defaultValue="pomodoro" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pomodoro" onClick={() => handleModeChange('pomodoro')}>Focus</TabsTrigger>
              <TabsTrigger value="shortBreak" onClick={() => handleModeChange('shortBreak')}>Short Break</TabsTrigger>
              <TabsTrigger value="longBreak" onClick={() => handleModeChange('longBreak')}>Long Break</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative h-64 w-64">
            <svg className="absolute h-full w-full" viewBox="0 0 100 100">
              <circle className="stroke-current text-muted/20" strokeWidth="4" cx="50" cy="50" r="45" fill="transparent"></circle>
              <circle 
                className="stroke-current text-primary -rotate-90 origin-center transition-all duration-300" 
                strokeWidth="4" 
                cx="50" cy="50" 
                r="45" 
                fill="transparent" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold font-mono text-foreground">{formatTime(time)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
            <Button size="lg" className="w-36" onClick={toggleTimer}>
              {isActive ? <Pause className="mr-2"/> : <Play className="mr-2"/>}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
                <TimerReset className="mr-2" />
                Reset
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
