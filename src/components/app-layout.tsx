
"use client";

import { useLayout } from "@/hooks/use-layout";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNav } from "./top-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { layout } = useLayout();

    if (layout === 'top-nav') {
        return (
            <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-40 w-full border-b bg-card">
                    <div className="container flex h-20 items-center justify-between px-4 md:px-6">
                        <Link href="/" className="flex items-center gap-2">
                           <Rocket className="size-6 text-primary" />
                           <span className="font-bold text-lg font-headline">FlowFocus</span>
                        </Link>
                        <div className="flex-1 flex items-center justify-center">
                            <TopNav />
                        </div>
                        <div className="flex items-center">
                            <UserNav />
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        )
    }

    // Default layout
    return (
        <SidebarProvider className="animate-slide-in-from-left">
            <Sidebar>
                <SidebarHeader>
                    <div className="p-2">
                        <Button variant="ghost" asChild className="w-full justify-start text-lg font-bold font-headline gap-2">
                            <Link href="/">
                                <Rocket className="size-5 text-primary" />
                                <span className="group-data-[collapsible=icon]:hidden">FlowFocus</span>
                            </Link>
                        </Button>
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2 pt-0">
                    <MainNav />
                </SidebarContent>
                <SidebarFooter>

                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
                    <UserNav />
                </header>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}
