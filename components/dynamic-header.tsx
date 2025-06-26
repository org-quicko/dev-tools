"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const TOOL_TITLES: Record<string, { title: string; icon: string }> = {
  "/": { title: "Dev Tools", icon: "🛠️" },
  "/formatter": { title: "JSON Formatter", icon: "🔧" },
  "/comparator": { title: "JSON Comparator", icon: "⚖️" },
  "/validator": { title: "JSON Schema Validator", icon: "✅" },
}

export function DynamicHeader() {
  const pathname = usePathname()
  const currentTool = TOOL_TITLES[pathname] || { title: "Dev Tools", icon: "🛠️" }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-sidebar-border" />
        <div className="flex items-center gap-2">
          <span className="text-base">{currentTool.icon}</span>
          <h1 className="font-semibold">{currentTool.title}</h1>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4 px-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
