"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Search, FileText, GitCompare, FileJson, Github, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useState } from "react"

const TOOL_TITLES: Record<string, { title: string; icon: string; description: string }> = {
  "/": { title: "Home", icon: "🏠", description: "Developer Utilities Dashboard" },
  "/formatter": { title: "JSON Formatter", icon: "🔧", description: "Format and beautify JSON data" },
  "/comparator": { title: "JSON Comparator", icon: "⚖️", description: "Compare JSON objects and find differences" },
  "/validator": { title: "JSON Schema Validator", icon: "✅", description: "Validate JSON against schemas" },
}

const QUICK_ACTIONS = [
  { href: "/formatter", label: "Format", icon: FileText, shortcut: "F" },
  { href: "/comparator", label: "Compare", icon: GitCompare, shortcut: "C" },
  { href: "/validator", label: "Validate", icon: FileJson, shortcut: "V" },
]

export function AppHeaderNav() {
  const pathname = usePathname()
  const currentTool = TOOL_TITLES[pathname]
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 w-full">
      {/* Current Tool Info */}
      <div className="flex items-center gap-3 min-w-0">
        {currentTool && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-base">{currentTool.icon}</span>
              <div className="flex flex-col min-w-0">
                <h1 className="text-sm font-semibold text-foreground leading-none">{currentTool.title}</h1>
                <p className="text-xs text-muted-foreground truncate">{currentTool.description}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
          </>
        )}
      </div>

      {/* Quick Actions - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          const isActive = pathname === action.href
          return (
            <Link key={action.href} href={action.href}>
              <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5 text-xs">
                <Icon className="h-3 w-3" />
                {action.label}
                <Badge variant="outline" className="h-4 px-1 text-[10px] font-mono">
                  {action.shortcut}
                </Badge>
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Search Bar - Expandable */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools, shortcuts, or paste JSON..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-7 pr-3 text-xs bg-muted/30 border-muted-foreground/20 focus:bg-background"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>Online</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span>Privacy First</span>
        </div>

        {/* External Links */}
        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-3 w-3" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              <span className="sr-only">Documentation</span>
            </a>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />
        <ThemeToggle />
      </div>
    </header>
  )
}
