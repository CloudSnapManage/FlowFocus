
import React from 'react';
import dynamic from 'next/dynamic';
import { Trash2, Tag, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Note } from '@/lib/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onExport: (note: Note) => void;
}

export function NoteEditor({ note, onUpdate, onDelete, onExport }: NoteEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b gap-4">
        <Input
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          className="text-2xl font-bold font-headline h-auto border-none shadow-none focus-visible:ring-0 p-0"
          aria-label="Note title"
        />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onExport(note)}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => onDelete(note.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 flex items-center gap-2 border-b flex-wrap">
        <Tag className="h-4 w-4 text-muted-foreground" />
        {note.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="group">
            {tag}
            <button
              onClick={() => onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) })}
              className="ml-1 rounded-full opacity-50 group-hover:opacity-100"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          placeholder="Add a tag..."
          className="h-6 w-24 border-none shadow-none focus-visible:ring-0 p-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              const newTag = e.currentTarget.value.trim().toLowerCase();
              if (!note.tags.includes(newTag)) {
                onUpdate(note.id, { tags: [...note.tags, newTag] });
              }
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      <div className="flex-1 overflow-auto" data-color-mode="light">
        <MDEditor
          value={note.body}
          onChange={(value) => onUpdate(note.id, { body: value || '' })}
          className="h-full"
          preview="live"
          style={{ border: 'none', borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
