import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebarNav } from "@/components/app-sidebar-nav"
import { AppHeaderNav } from "@/components/app-header-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Removed SidebarOverlay
import { cookies } from "next/headers"

import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Dev Tools",
  description: "A collection of everyday utilities for developers.",
    generator: 'v0.dev'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false" // Still useful for initial state, but sidebar won't collapse

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            {" "}
            {/* Removed collapsible prop */}
            <div className="flex h-screen overflow-hidden">
              {/* Removed SidebarOverlay */}
              <AppSidebarNav />
              <SidebarInset className="flex flex-col w-full">
                <AppHeaderNav />
                <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
