"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle" // Assuming ThemeToggle exists
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"

export function AppHeaderNav() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger className="-ml-1.5 p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </SidebarTrigger>
      </div>
      <Separator orientation="vertical" className="mx-2 h-6 hidden md:block" />
      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Placeholder for breadcrumbs or other header content */}
        {/* <p className="text-sm text-muted-foreground">Current Tool: JSON Formatter</p> */}
        <ThemeToggle />
      </div>
    </header>
  )
}
