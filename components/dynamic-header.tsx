"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/custom-sidebar"
import { Separator } from "@/components/ui/separator"

const toolNames: { [key: string]: string } = {
  "/": "Home",
  "/formatter": "Formatter",
  "/comparator": "Comparator",
  "/validator": "Schema Validator",
}

export function DynamicHeader() {
  const pathname = usePathname()
  const currentToolName = toolNames[pathname] || "Dev Tools" // Default to "Dev Tools" if path not found

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="font-semibold">{currentToolName}</h1>
    </header>
  )
}
