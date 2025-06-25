
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
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  habitId?: string; // Optional link to a habit
}
