"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

const TOOL_TITLES: Record<string, { title: string; icon: string }> = {
  "/formatter": { title: "JSON Formatter", icon: "🔧" },
  "/comparator": { title: "JSON Comparator", icon: "⚖️" },
  "/validator": { title: "JSON Schema Validator", icon: "✅" },
}

export function AppHeaderNav() {
  const pathname = usePathname()
  const currentTool = TOOL_TITLES[pathname]

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 w-full">
      <div className="md:hidden">
        <SidebarTrigger className="-ml-1.5 p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </SidebarTrigger>
      </div>
      <Separator orientation="vertical" className="mx-2 h-6 hidden md:block" />

      {/* Tool Title */}
      {currentTool && (
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentTool.icon}</span>
          <h1 className="text-lg font-semibold text-foreground">{currentTool.title}</h1>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
