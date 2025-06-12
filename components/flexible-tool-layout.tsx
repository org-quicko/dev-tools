"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ColumnConfig {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

interface FlexibleToolLayoutProps {
  columns: ColumnConfig[]
  topControls?: React.ReactNode
  className?: string
}

export function FlexibleToolLayout({ columns, topControls, className }: FlexibleToolLayoutProps) {
  const columnCount = columns.length
  const gridCols = columnCount === 2 ? "grid-cols-2" : columnCount === 3 ? "grid-cols-3" : "grid-cols-1"

  return (
    <div className={cn("flex flex-col h-screen w-full bg-background", className)}>
      {/* Top Controls */}
      {topControls && (
        <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="w-full px-4 sm:px-6 py-3">{topControls}</div>
        </div>
      )}

      {/* Dynamic Column Layout */}
      <div className={cn("flex-1 min-h-0 w-full grid divide-x divide-border", gridCols)}>
        {columns.map((column, index) => (
          <div key={column.id} className="flex flex-col h-full min-h-0 w-full">
            {/* Column Header */}
            <div className="shrink-0 border-b bg-muted/30">
              <div className="px-3 sm:px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {column.icon}
                    <h3 className="font-medium text-sm truncate">{column.title}</h3>
                  </div>
                  {column.actions && <div className="flex items-center gap-1 shrink-0">{column.actions}</div>}
                </div>
              </div>
            </div>

            {/* Column Content */}
            <div className={cn("flex-1 min-h-0 w-full", column.className)}>
              <ScrollArea className="h-full w-full zinc-scrollbar">
                <div className="p-3 sm:p-4 w-full">{column.content}</div>
              </ScrollArea>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shared components for consistent styling
export function ColumnEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8 w-full">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-base sm:text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

export function ColumnLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8 w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
