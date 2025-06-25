
import React from 'react';
import { Plus, Search, Tag, Pin, PinOff, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onTriggerImport: () => void;
  onTogglePin: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onTriggerImport,
  onTogglePin,
  searchTerm,
  onSearchChange,
  allTags,
  selectedTag,
  onSelectTag,
  searchInputRef,
}: NoteListProps) {
  return (
    <aside className="hidden md:flex flex-col border-r h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline">My Notes</h2>
          <div className="flex items-center">
            <Button size="icon" variant="ghost" onClick={onTriggerImport} aria-label="Import note">
              <FileUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCreateNote} aria-label="New note">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search notes... (Ctrl+F)"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 pt-0 space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!selectedTag ? 'default' : 'secondary'}
            onClick={() => onSelectTag(null)}
            className="cursor-pointer"
          >
            All Notes
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'secondary'}
              onClick={() => onSelectTag(tag)}
              className="cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="relative group">
              <Button
                variant="ghost"
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  'w-full h-auto justify-start flex-col items-start p-2 pr-8',
                  activeNoteId === note.id && 'bg-accent text-accent-foreground'
                )}
              >
                <div className="flex items-center w-full">
                  {note.isPinned && <Pin className="h-3 w-3 mr-2 shrink-0 text-amber-500" />}
                  <span className="font-semibold truncate w-full text-left">{note.title}</span>
                </div>
                <span className="text-xs text-muted-foreground w-full text-left">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note.id);
                }}
                aria-label={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? <PinOff className="h-4 w-4 text-amber-500" /> : <Pin className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
