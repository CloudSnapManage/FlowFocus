"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { format, subDays } from "date-fns";

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "hsl(var(--primary))",
  },
}

export function PomodoroChart() {
    const [chartData, setChartData] = useState<{day: string; sessions: number}[]>([]);

    useEffect(() => {
        const sessions = JSON.parse(localStorage.getItem('pomodoro_sessions') || '{}');
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateString = format(date, 'yyyy-MM-dd');
            const dayName = format(date, 'eee');
            data.push({
                day: dayName,
                sessions: sessions[dateString] || 0,
            });
        }
        setChartData(data);
    }, []);

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
