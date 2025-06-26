"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeft, Home, FileText, GitCompare, Shield, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextType {
  isExpanded: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function SidebarProvider({ children, defaultExpanded = true }: SidebarProviderProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  const toggleSidebar = React.useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const value = React.useMemo(
    () => ({
      isExpanded,
      toggleSidebar,
    }),
    [isExpanded, toggleSidebar],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={toggleSidebar} {...props}>
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

const menuItems = [
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
    icon: Shield,
  },
]

interface SidebarProps {
  className?: string
}

export function CustomSidebar({ className }: SidebarProps) {
  const { isExpanded } = useSidebar()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code className="h-4 w-4" />
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Dev Tools</span>
              <span className="text-xs text-muted-foreground">Developer Utilities</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-95",
                isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                !isExpanded && "justify-center",
              )}
              title={!isExpanded ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {isExpanded && <span className="truncate transition-opacity duration-200">{item.title}</span>}
              {/* Active indicator */}
              {isActive && !isExpanded && <div className="absolute right-0 h-6 w-1 rounded-l-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">Built with shadcn/ui</div>
        </div>
      )}

      {/* Resize handle */}
      <div
        className={cn(
          "absolute -right-1 top-1/2 h-8 w-2 -translate-y-1/2 cursor-col-resize opacity-0 transition-opacity hover:opacity-100",
          "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border",
        )}
      />
    </div>
  )
}

export function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("flex flex-1 flex-col overflow-hidden", className)}>{children}</main>
}
