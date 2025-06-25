
import type { StudyPlanInput } from "@/ai/flows/generate-study-plan";

export type HabitType = 'binary' | 'quantitative';

export interface Habit {
  id: string;
  name: string;
  category: string;
  type: HabitType;
  streak: number;
  completedToday: boolean;
  value: number;
  target: number;
  unit: string;
  goalStreak?: number;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: string;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  habitId?: string; // Optional link to a habit
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Deck {
  id:string;
  name: string;
  description?: string;
  cards: Flashcard[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface StudyTask {
  id: string;
  topic: string;
  description: string;
  duration: string; // e.g., "2 hours"
  completed: boolean;
  date: string; // ISO date string, e.g., "2024-07-28"
  resource?: string;
}

export interface StudyPlan {
  id: string;
  title: string; // AI generated title or user-defined
  goal: string; // User's original goal
  tasks: StudyTask[];
  userInput: StudyPlanInput;
  startDate: string; // ISO date string
}
