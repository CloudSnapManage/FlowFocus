
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Note } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportNoteAsMarkdown(note: Note) {
  const markdownContent = `# ${note.title}\n\n${note.body}`;
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${safeTitle}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
