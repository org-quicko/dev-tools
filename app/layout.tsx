import type React from "react"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, CustomSidebar, SidebarInset } from "@/components/custom-sidebar"
import { DynamicHeader } from "@/components/dynamic-header"

import "./globals.css"

export const metadata = {
  title: "Dev Tools",
  description: "A collection of everyday utilities for developers.",
  generator: "v0.dev",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultExpanded={false}>
            <div className="flex h-screen overflow-hidden">
              <CustomSidebar />
              <SidebarInset>
                <DynamicHeader />
                <main className="flex flex-1 flex-col gap-2 sm:gap-4 p-2 sm:p-4 overflow-auto pt-4 sm:pt-6 pl-2 sm:pl-6">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
