"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColumnProps {
  id: string
  title: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  content: React.ReactNode
}

interface FlexibleToolLayoutProps {
  columns: ColumnProps[]
  topControls?: React.ReactNode
  className?: string
}

export function FlexibleToolLayout({ columns, topControls, className }: FlexibleToolLayoutProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile && !activeTab && columns.length > 0) {
      setActiveTab(columns[0].id)
    }
  }, [isMobile, activeTab, columns])

  const gridCols = columns.length === 2 ? "grid-cols-2" : columns.length === 3 ? "grid-cols-3" : "grid-cols-1"

  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {topControls && <div className="mb-4">{topControls}</div>}

      <div className={cn("flex-1 flex flex-col md:grid gap-4 min-h-0", gridCols)}>
        {columns.map((column, index) => (
          <Card
            key={column.id}
            className={cn(
              "flex-1 flex flex-col min-h-0 overflow-hidden",
              isMobile && activeTab !== column.id && "hidden",
              index < columns.length - 1 && "md:border-r", // Apply border-r to all but the last column
            )}
          >
            <CardHeader className="p-3 sm:p-4 flex flex-row items-center space-y-0 gap-2 border-b">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {column.icon && <span className="text-muted-foreground">{column.icon}</span>}
                <CardTitle className="text-base truncate">{column.title}</CardTitle>
              </div>
              {column.actions && (
                <div className="flex items-center space-x-1 z-10 pointer-events-auto">{column.actions}</div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full p-3 sm:p-4">{column.content}</ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {isMobile && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {columns.map((column) => (
            <button
              key={column.id}
              onClick={() => setActiveTab(column.id)}
              className={cn(
                "p-2 rounded-md flex items-center gap-2",
                activeTab === column.id ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {column.icon}
              <span className="text-xs font-medium">{column.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ColumnEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 space-y-4">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ColumnLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
