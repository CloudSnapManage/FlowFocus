
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrainCircuit, Copy, LayoutDashboard, ListTodo, NotebookText, Repeat, Timer, BookMarked } from "lucide-react"

import { cn } from "@/lib/utils"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

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

export function MainNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href)
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.href)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
