import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function NotesPage() {
  const notes = [
    { id: 1, title: "React Hooks Cheatsheet", date: "2 days ago", tags: ["react", "frontend"] },
    { id: 2, title: "Next.js 14 Features", date: "1 week ago", tags: ["nextjs", "webdev"] },
    { id: 3, title: "Tailwind CSS Best Practices", date: "3 weeks ago", tags: ["css", "design"] },
    { id: 4, title: "Database Schema Ideas", date: "1 month ago", tags: ["database", "backend"] },
  ];

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 h-[calc(100vh-8rem)]">
      <aside className="flex-col gap-4 hidden md:flex border-r pr-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">My Notes</h2>
            <Button size="icon" variant="ghost" aria-label="New note"><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-8" />
        </div>
        <div className="flex flex-col gap-1 mt-4">
          {notes.map(note => (
            <Button variant="ghost" className="justify-start h-auto flex-col items-start" key={note.id}>
              <span className="font-semibold">{note.title}</span>
              <span className="text-xs text-muted-foreground">{note.date}</span>
            </Button>
          ))}
        </div>
      </aside>
      <main className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">React Hooks Cheatsheet</h1>
                <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">react</Badge>
                    <Badge variant="secondary">frontend</Badge>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline">Delete</Button>
                <Button>Save Note</Button>
            </div>
        </div>
        <Card className="flex-grow">
            <CardContent className="p-0 h-full">
                <Textarea
                    placeholder="Start writing your note here..."
                    className="h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-code"
                    defaultValue={`# React Hooks Cheatsheet

A quick reference for the most common React Hooks.

## useState

Used for adding state to functional components.

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

## useEffect

Used for handling side effects like data fetching or subscriptions.

\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;

  return () => {
    // Cleanup function
  };
}, [count]); // Only re-run the effect if count changes
\`\`\`
`}
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
