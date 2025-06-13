import type React from "react"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebarNav } from "@/components/app-sidebar-nav"
import { AppHeaderNav } from "@/components/app-header-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Import SidebarProvider, SidebarInset
import { cookies } from "next/headers" // Import cookies for persisted sidebar state

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
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true" // Read persisted state

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={defaultOpen} collapsible="icon">
            <div className="flex min-h-screen">
              {" "}
              {/* Flex container for sidebar and main content */}
              <AppSidebarNav />
              <SidebarInset className="flex flex-col flex-1">
                {" "}
                {/* SidebarInset wraps header and main, flex-1 to take remaining width */}
                <AppHeaderNav />
                <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>{" "}
                {/* main content takes remaining height */}
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
