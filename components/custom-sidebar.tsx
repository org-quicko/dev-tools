"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, FileText, GitCompare, CheckSquare, SidebarIcon, Code } from "lucide-react"

// Sidebar Context
interface SidebarContextType {
  isExpanded: boolean
  toggle: () => void
  setExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Sidebar Provider
interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function SidebarProvider({ children, defaultExpanded = true }: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggle = () => setIsExpanded(!isExpanded)
  const setExpanded = (expanded: boolean) => setIsExpanded(expanded)

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return <SidebarContext.Provider value={{ isExpanded, toggle, setExpanded }}>{children}</SidebarContext.Provider>
}

// Navigation items
const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Formatter",
    href: "/formatter",
    icon: FileText,
  },
  {
    title: "Comparator",
    href: "/comparator",
    icon: GitCompare,
  },
  {
    title: "Schema Validator",
    href: "/validator",
    icon: CheckSquare,
  },
]

// Custom Sidebar Component
export function CustomSidebar() {
  const { isExpanded } = useSidebar()
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        {isExpanded ? (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Dev Tools</span>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "active:scale-95",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              title={!isExpanded ? item.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isExpanded && <span className="truncate">{item.title}</span>}
              {!isExpanded && isActive && (
                <div className="absolute right-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-l bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      
    </aside>
  )
}

// Sidebar Trigger Button
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("h-8 w-8", className)}
      aria-label="Toggle sidebar"
    >
      <SidebarIcon className="h-4 w-4" />
    </Button>
  )
}

// Sidebar Inset (Main Content Area)
interface SidebarInsetProps {
  children: React.ReactNode
  className?: string
}

export function SidebarInset({ children, className }: SidebarInsetProps) {
  return <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>{children}</div>
}
