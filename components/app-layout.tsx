"use client"

import type * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebarNav } from "./app-sidebar-nav"
import { AppHeaderNav } from "./app-header-nav"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebarNav />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <AppHeaderNav />
          <ScrollArea className="flex-1">
            <main className="container mx-auto p-6">{children}</main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
