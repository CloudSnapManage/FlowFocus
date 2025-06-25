"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

export function PomodoroChart() {
    return (
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
    )
}
