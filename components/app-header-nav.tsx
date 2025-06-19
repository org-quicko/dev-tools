"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
// Removed Menu import
// Removed SidebarTrigger import

const TOOL_TITLES: Record<string, { title: string; icon: string }> = {
  "/formatter": { title: "JSON Formatter", icon: "🔧" },
  "/comparator": { title: "JSON Comparator", icon: "⚖️" },
  "/validator": { title: "JSON Schema Validator", icon: "✅" },
}

export function AppHeaderNav() {
  const pathname = usePathname()
  const currentTool = TOOL_TITLES[pathname]

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-x-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 md:px-4 w-full">
      {/* Removed SidebarTrigger from here */}

      {/* Tool Title */}
      {currentTool && (
        <div className="flex items-center gap-2">
          <span className="text-base">{currentTool.icon}</span>
          <h1 className="text-base font-semibold text-foreground">{currentTool.title}</h1>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
