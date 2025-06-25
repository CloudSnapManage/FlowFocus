
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
import { addDays, format, parseISO } from 'date-fns';

const StudyPlanInputSchema = z.object({
  subject: z.string().describe('The subject or topic the user wants to study.'),
  duration: z.string().describe('The total duration and frequency of study (e.g., "3 weeks, 4 days a week, 2 hours per day").'),
  details: z.string().optional().describe('Any additional details or preferences, such as learning style, pace, and interests (e.g., "I prefer hands-on projects and a medium pace. I am a complete beginner.").'),
  startDate: z.string().describe('The start date of the plan in ISO format (e.g., "2024-07-28").'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyTaskSchema = z.object({
  id: z.string().describe("A unique identifier for the task (e.g., 'w1d1t1')."),
  topic: z.string().describe('The specific topic for this study session.'),
  description: z.string().describe('A brief description of what to cover in the topic.'),
  duration: z.string().describe('Estimated time to complete the task (e.g., "2 hours", "90 minutes").'),
  date: z.string().describe('The scheduled date for this task in YYYY-MM-DD format.'),
  resource: z.string().optional().describe("A relevant, publicly accessible URL to a resource (e.g., article, video, documentation)."),
});

const StudyPlanOutputSchema = z.object({
  title: z.string().describe('A concise, engaging title for the overall study plan.'),
  tasks: z.array(StudyTaskSchema).describe('A flat list of all study tasks for the entire duration.'),
});

// The public-facing function that returns the full StudyPlan object
export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlan> {
  const planOutput = await generateStudyPlanFlow(input);

  // Add a completed field to each task, as the AI model might not include it.
  const tasksWithCompletion = planOutput.tasks.map(task => ({
      ...task,
      completed: false,
  }));
  
  // Combine the AI output with the original user input to form the complete StudyPlan object
  return {
    id: `plan_${Date.now()}`,
    ...planOutput,
    tasks: tasksWithCompletion,
    goal: input.subject,
    userInput: input,
    startDate: input.startDate,
  };
}

const prompt = ai.definePrompt({
  name: 'generateStudyPlanPrompt',
  input: { schema: StudyPlanInputSchema },
  output: { schema: StudyPlanOutputSchema },
  prompt: `You are an expert curriculum designer. Create a detailed, day-by-day study plan based on the user's goal.

User Goal: {{{subject}}}
Time Commitment: {{{duration}}}
Start Date: {{{startDate}}}
Preferences and Details: {{{details}}}

Your task is to generate a comprehensive study plan as a flat list of tasks.
- Create a concise, engaging title for the entire study plan.
- Break down the subject into specific, actionable study tasks for each study day.
- For each task, provide a topic, a brief description, and an estimated duration.
- For each task, you MUST also suggest a relevant, publicly accessible online resource URL (e.g., a high-quality article, video, or documentation page).
- Crucially, you must assign a specific date to each task in 'YYYY-MM-DD' format, starting from the user's provided start date and respecting their weekly study frequency.
- Generate a unique ID for each task, like 't1', 't2', etc.

Structure your response strictly in the JSON format defined by the output schema. Do not group tasks by week.
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
