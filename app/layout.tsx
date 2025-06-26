import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, CustomSidebar, SidebarInset } from "@/components/custom-sidebar"
import { DynamicHeader } from "@/components/dynamic-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Dev Tools",
  description: "A collection of everyday utilities for developers.",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultExpanded={true}>
            <div className="flex h-screen overflow-hidden">
              <CustomSidebar />
              <SidebarInset>
                <DynamicHeader />
                <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto pt-6 pl-6 max-w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">JSON Formatter</h1>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Formatting Options</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Formatting options will be rendered here */}
                          <p className="text-sm text-muted-foreground">Formatting options will be available here.</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-1 gap-4 min-h-0">
                    <div className="flex-1 min-w-0">{/* JSON Input will go here */}</div>
                    <div className="flex-1 min-w-0">{/* Formatted JSON will go here */}</div>
                  </div>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
