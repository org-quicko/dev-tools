"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/custom-sidebar"

const pageConfig = {
  "/": {
    title: "Dev Tools",
    description: "Developer Utilities",
  },
  "/formatter": {
    title: "JSON Formatter",
    description: "Format and beautify JSON data",
  },
  "/comparator": {
    title: "JSON Comparator",
    description: "Compare JSON files side by side",
  },
  "/validator": {
    title: "Schema Validator",
    description: "Validate JSON against schemas",
  },
}

export function DynamicHeader() {
  const pathname = usePathname()
  const config = pageConfig[pathname as keyof typeof pageConfig] || pageConfig["/"]

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="h-4 w-px bg-border" />
      <div className="flex flex-col">
        <h1 className="font-semibold text-sm">{config.title}</h1>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>
    </header>
  )
}
