"use client"

import Link from "next/link"
import { Code, Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar" // Import SidebarTrigger

export function AppHeaderNav() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        {" "}
        {/* Show logo and trigger on mobile */}
        <SidebarTrigger className="md:hidden" /> {/* Sidebar trigger for mobile */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">Dev Tools</span>
        </Link>
      </div>
      <div className="relative ml-auto flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a href="https://github.com/vercel/v0" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  )
}
