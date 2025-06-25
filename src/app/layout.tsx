import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'FlowFocus',
  description: 'Manage your productivity and studies, all in one place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system', 'rose']}
        >
          <SidebarProvider>
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
