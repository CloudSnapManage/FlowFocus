import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";

export default function HabitsPage() {
  const habits = [
    { name: "Read for 30 minutes", streak: 12, completed: true, goal: 30 },
    { name: "Workout", streak: 5, completed: false, goal: 20 },
    { name: "Code for 1 hour", streak: 27, completed: true, goal: 30 },
    { name: "Meditate", streak: 2, completed: false, goal: 10 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistent routines and watch your streaks grow.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <Card key={habit.name} className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-headline">{habit.name}</CardTitle>
                  <CardDescription>{habit.streak > 0 ? `${habit.streak} day streak` : "No streak yet"}</CardDescription>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                    <Checkbox checked={habit.completed} id={habit.name} aria-label={`Mark ${habit.name} as completed`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Progress value={(habit.streak / habit.goal) * 100} className="h-2"/>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{habit.streak} / {habit.goal} days</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
