import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebarNav } from "@/components/app-sidebar-nav"
import { AppHeaderNav } from "@/components/app-header-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex h-screen w-full">
              <AppSidebarNav />
              <SidebarInset className="w-full">
                <AppHeaderNav />
                <main className="flex-1 overflow-auto">
                  <div className="h-full w-full p-4">{children}</div>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
