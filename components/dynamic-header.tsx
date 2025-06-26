"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const TOOL_TITLES: Record<string, { title: string; icon: string }> = {
  "/formatter": { title: "JSON Formatter", icon: "🔧" },
  "/comparator": { title: "JSON Comparator", icon: "⚖️" },
  "/validator": { title: "JSON Schema Validator", icon: "✅" },
}

export function AppHeaderNav() {
  const pathname = usePathname()
  const currentTool = TOOL_TITLES[pathname]

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border mx-2" />

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
