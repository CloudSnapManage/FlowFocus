'use server';
/**
 * @fileOverview An AI flow to generate a personalized study plan.
 *
 * - generateStudyPlan - A function that creates a study plan based on user goals.
 * - StudyPlanInput - The input type for the study plan generator.
 * - StudyPlan - The output type representing the structured study plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { StudyPlan } from '@/lib/types';

const StudyPlanInputSchema = z.object({
  subject: z.string().describe('The subject or topic the user wants to study.'),
  duration: z.string().describe('The total duration and frequency of study (e.g., "3 weeks, 4 days a week, 2 hours per day").'),
  details: z.string().optional().describe('Any additional details or preferences, such as learning style (e.g., "I prefer hands-on projects", "I am a complete beginner").'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyTaskSchema = z.object({
  id: z.string().describe("A unique identifier for the task (e.g., 'w1d1t1')."),
  topic: z.string().describe('The specific topic for this study session.'),
  description: z.string().describe('A brief description of what to cover in the topic.'),
  duration: z.string().describe('Estimated time to complete the task (e.g., "2 hours").'),
  completed: z.boolean().default(false).describe('Whether the user has completed this task.'),
});

const WeeklyPlanSchema = z.object({
  week: z.number().describe('The week number of the study plan.'),
  theme: z.string().describe('The overarching theme or goal for the week.'),
  tasks: z.array(StudyTaskSchema).describe('A list of study tasks for the week.'),
});

const StudyPlanOutputSchema = z.object({
  goal: z.string().describe('The main goal of the study plan, derived from the user input.'),
  weeklyPlans: z.array(WeeklyPlanSchema).describe('An array of weekly plans, breaking down the subject.'),
});

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlan> {
  const plan = await generateStudyPlanFlow(input);
  // Add a completed field to each task, as the AI model might not include it.
  plan.weeklyPlans.forEach(week => {
      week.tasks.forEach(task => {
          task.completed = false;
      });
  });
  return plan;
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: { schema: StudyPlanInputSchema },
  output: { schema: StudyPlanOutputSchema },
  prompt: `You are an expert curriculum designer and academic planner. Your task is to create a detailed, week-by-week study plan for a user based on their learning goal.

User Goal: {{{subject}}}
Time Commitment: {{{duration}}}
Additional Details: {{{details}}}

Break down the subject into logical weekly themes. For each week, create a list of specific, actionable study tasks. Each task should have a clear topic, a brief description of what to cover, and an estimated duration. Ensure the plan is realistic for the given time commitment.

Generate a unique ID for each task, following the format 'w[week_number]d[day_number]t[task_number_within_day]', for example: 'w1d1t1'.

Structure your response strictly in the JSON format defined by the output schema.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: StudyPlanInputSchema,
    outputSchema: StudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
