
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BrainCircuit, Copy, LayoutDashboard, ListTodo, NotebookText, Repeat, Timer, BookMarked } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pomodoro", label: "Pomodoro", icon: Timer },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/habits", label: "Habit Tracker", icon: Repeat },
  { href: "/flashcards", label: "Flashcards", icon: Copy },
  { href: "/notes", label: "Notes", icon: NotebookText },
  { href: "/study-plan", label: "AI Study Planner", icon: BrainCircuit },
  { href: "/study-plans", label: "Study Plans", icon: BookMarked },
]

export function TopNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center gap-2">
      <TooltipProvider delayDuration={0}>
        {navItems.map((item, index) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant={isActive(item.href) ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "h-12 w-12 transform transition-transform duration-200 hover:scale-110 animate-drop-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link href={item.href}>
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </nav>
  )
}
