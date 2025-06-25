import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BrainCircuit, Copy, NotebookText, Repeat, Timer } from "lucide-react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { day: "Monday", sessions: 4 },
  { day: "Tuesday", sessions: 3 },
  { day: "Wednesday", sessions: 5 },
  { day: "Thursday", sessions: 2 },
  { day: "Friday", sessions: 6 },
  { day: "Saturday", sessions: 1 },
  { day: "Sunday", sessions: 4 },
]

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const features = [
    { title: "Pomodoro Timer", description: "Stay focused with the Pomodoro technique.", icon: Timer, href: "/pomodoro" },
    { title: "Habit Tracker", description: "Build good habits and track your progress.", icon: Repeat, href: "/habits" },
    { title: "Flashcards", description: "Review and memorize with digital flashcards.", icon: Copy, href: "/flashcards" },
    { title: "Notes", description: "Capture your thoughts with Markdown support.", icon: NotebookText, href: "/notes" },
    { title: "AI Study Plan", description: "Generate a personalized study plan.", icon: BrainCircuit, href: "/study-plan" },
  ];

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
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Sessions</CardTitle>
            <CardDescription>Your focus sessions this week.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Habit Streaks</CardTitle>
            <CardDescription>Your current active streaks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Workout</span>
              <span className="font-bold">12 days</span>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm">Read</span>
              <span className="font-bold">5 days</span>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm">Code</span>
              <span className="font-bold">27 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
