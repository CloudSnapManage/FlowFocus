
"use client"

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Play, TimerReset, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [tempSettings, setTempSettings] = useState(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load settings from local storage on mount
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.POMODORO_SETTINGS);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setTempSettings(parsedSettings);
      setTime(parsedSettings.pomodoro * 60);
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    
    // Set up audio - you'll need to place a sound file at this path
    setAudio(new Audio('/sounds/notification.mp3'));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((t) => t - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      setIsActive(false);
      
      // Play sound and show notification
      if (audio) {
        audio.play().catch(error => {
          console.error("Could not play sound. Ensure notification.mp3 exists in /public/sounds.", error);
        });
      }

      if (Notification.permission === "granted") {
        const notificationTitle = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Finished!`;
        const notificationBody = mode === "pomodoro" ? "Time for a break!" : "Time to get back to focus!";
        new Notification(notificationTitle, { body: notificationBody });
      }
      
      // Track completed pomodoro sessions
      if (mode === 'pomodoro') {
        const today = format(new Date(), 'yyyy-MM-dd');
        const sessions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.POMODORO_SESSIONS) || '{}');
        sessions[today] = (sessions[today] || 0) + 1;
        localStorage.setItem(LOCAL_STORAGE_KEYS.POMODORO_SESSIONS, JSON.stringify(sessions));
      }
      
      // Automatically switch to the next mode
      const nextMode = mode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
      handleModeChange(nextMode);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, audio, settings]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(settings[mode] * 60);
  };
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTime(settings[newMode] * 60);
  }

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem(LOCAL_STORAGE_KEYS.POMODORO_SETTINGS, JSON.stringify(tempSettings));
    setIsSettingsOpen(false);

    // Update timer if not active
    if (!isActive) {
      setTime(tempSettings[mode] * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((settings[mode] * 60 - time) / (settings[mode] * 60)) * 100;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-headline">Pomodoro Timer</CardTitle>
          <CardDescription className="text-center">Stay focused and get things done.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Tabs value={mode} onValueChange={(v) => handleModeChange(v as Mode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pomodoro">Focus</TabsTrigger>
              <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
              <TabsTrigger value="longBreak">Long Break</TabsTrigger>
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
        <CardFooter className="flex justify-center items-center gap-4">
            <Button size="lg" className="w-40" onClick={toggleTimer}>
              {isActive ? <Pause className="mr-2"/> : <Play className="mr-2"/>}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer} aria-label="Reset timer">
                <TimerReset />
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Timer settings">
                        <Settings />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                    <DialogDescription>
                        Customize your session durations (in minutes).
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pomodoro" className="text-right">Focus</Label>
                            <Input id="pomodoro" type="number" value={tempSettings.pomodoro} onChange={(e) => setTempSettings({...tempSettings, pomodoro: Number(e.target.value)})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shortBreak" className="text-right">Short Break</Label>
                            <Input id="shortBreak" type="number" value={tempSettings.shortBreak} onChange={(e) => setTempSettings({...tempSettings, shortBreak: Number(e.target.value)})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="longBreak" className="text-right">Long Break</Label>
                            <Input id="longBreak" type="number" value={tempSettings.longBreak} onChange={(e) => setTempSettings({...tempSettings, longBreak: Number(e.target.value)})} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSaveSettings}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
