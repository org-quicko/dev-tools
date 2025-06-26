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
      setIsMobile(window.innerWidth < 1024)
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

  const gridCols = columns.length === 2 ? "lg:grid-cols-2" : columns.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-1"

  return (
    <div className={cn("flex flex-col w-full h-full max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)]", className)}>
      {topControls && <div className="mb-2 sm:mb-3">{topControls}</div>}

      <div className={cn("flex-1 flex flex-col lg:grid gap-2 sm:gap-3 min-h-0 max-h-full", gridCols)}>
        {columns.map((column, index) => (
          <Card
            key={column.id}
            className={cn(
              "flex-1 flex flex-col min-h-0 max-h-full overflow-hidden",
              isMobile && activeTab !== column.id && "hidden",
            )}
          >
            <CardHeader className="p-2 sm:p-3 flex flex-row items-center space-y-0 gap-2 border-b shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {column.icon && (
                  <span className="text-muted-foreground" title={column.title}>
                    {column.icon}
                  </span>
                )}
                <CardTitle className="text-xs sm:text-sm truncate">{column.title}</CardTitle>
              </div>
              {column.actions && (
                <div className="flex items-center space-x-1 z-10 pointer-events-auto">{column.actions}</div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full max-h-[70vh] lg:max-h-full overflow-auto p-2 sm:p-3">
                {column.content}
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {isMobile && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-x-auto">
          {columns.map((column) => (
            <button
              key={column.id}
              onClick={() => setActiveTab(column.id)}
              className={cn(
                "p-1.5 sm:p-2 rounded-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap",
                activeTab === column.id ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
              title={column.title}
            >
              {column.icon}
              <span className="font-medium">{column.title}</span>
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
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-2 sm:p-3 space-y-2 sm:space-y-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <h3 className="text-sm sm:text-base font-medium">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ColumnLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-2 sm:p-3 space-y-2 sm:space-y-3">
      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
      <p className="text-xs sm:text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
