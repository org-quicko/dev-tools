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

interface SharedThreeColumnLayoutProps {
  toolTitle: string
  toolIcon: React.ReactNode
  toolDescription?: string
  leftColumn: ColumnConfig
  middleColumn: ColumnConfig
  rightColumn: ColumnConfig
  topControls?: React.ReactNode
  className?: string
}

export function SharedThreeColumnLayout({
  toolTitle,
  toolIcon,
  toolDescription,
  leftColumn,
  middleColumn,
  rightColumn,
  topControls,
  className,
}: SharedThreeColumnLayoutProps) {
  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      {/* Tool Header */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {toolIcon}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{toolTitle}</h1>
                {toolDescription && <p className="text-sm text-muted-foreground">{toolDescription}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      {topControls && (
        <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-3">{topControls}</div>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-3 divide-x divide-border">
        {/* Left Column */}
        <div className="flex flex-col h-full min-h-0">
          <div className="shrink-0 border-b bg-muted/30">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {leftColumn.icon}
                  <h3 className="font-medium text-sm">{leftColumn.title}</h3>
                </div>
                {leftColumn.actions && <div className="flex items-center gap-1">{leftColumn.actions}</div>}
              </div>
            </div>
          </div>
          <div className={cn("flex-1 min-h-0", leftColumn.className)}>
            <ScrollArea className="h-full zinc-scrollbar">
              <div className="p-4">{leftColumn.content}</div>
            </ScrollArea>
          </div>
        </div>

        {/* Middle Column */}
        <div className="flex flex-col h-full min-h-0">
          <div className="shrink-0 border-b bg-muted/30">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {middleColumn.icon}
                  <h3 className="font-medium text-sm">{middleColumn.title}</h3>
                </div>
                {middleColumn.actions && <div className="flex items-center gap-1">{middleColumn.actions}</div>}
              </div>
            </div>
          </div>
          <div className={cn("flex-1 min-h-0", middleColumn.className)}>
            <ScrollArea className="h-full zinc-scrollbar">
              <div className="p-4">{middleColumn.content}</div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full min-h-0">
          <div className="shrink-0 border-b bg-muted/30">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {rightColumn.icon}
                  <h3 className="font-medium text-sm">{rightColumn.title}</h3>
                </div>
                {rightColumn.actions && <div className="flex items-center gap-1">{rightColumn.actions}</div>}
              </div>
            </div>
          </div>
          <div className={cn("flex-1 min-h-0", rightColumn.className)}>
            <ScrollArea className="h-full zinc-scrollbar">
              <div className="p-4">{rightColumn.content}</div>
            </ScrollArea>
          </div>
        </div>
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
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

export function ColumnLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
