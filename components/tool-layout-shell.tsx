"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ToolTab {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface ToolLayoutShellProps {
  title: string
  icon: React.ReactNode
  description?: string
  tabs: ToolTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  stickyControls?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function ToolLayoutShell({
  title,
  icon,
  description,
  tabs,
  activeTab,
  onTabChange,
  stickyControls,
  className,
  children,
}: ToolLayoutShellProps) {
  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Tool Header - Fixed Height */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Controls - Fixed Height */}
      {stickyControls && (
        <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="px-6 py-3">{stickyControls}</div>
        </div>
      )}

      {/* Main Content Area - Flexible Height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex flex-col h-full">
          {/* Tab Navigation - Fixed Height */}
          <div className="shrink-0 border-b bg-background">
            <div className="px-6">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tab Content Area - Flexible Height with Stable Container */}
          <div className="flex-1 min-h-0 relative">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="absolute inset-0 m-0 p-6 overflow-y-auto zinc-scrollbar data-[state=inactive]:pointer-events-none data-[state=inactive]:opacity-0 transition-opacity duration-200"
              >
                <div className="h-full min-h-[600px]">{tab.content}</div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Additional children if needed */}
      {children}
    </div>
  )
}

// Shared layout components for consistent structure
export function ToolGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-6 h-full min-h-0", className)}>{children}</div>
}

export function ToolPanel({
  children,
  className,
  title,
  icon,
  actions,
}: {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <Card className={cn("flex flex-col h-full min-h-0 tool-card", className)}>
      {(title || actions) && (
        <CardHeader className="shrink-0 py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            {title && (
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {icon}
                {title}
              </CardTitle>
            )}
            {actions && <div className="flex items-center gap-1">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-0 p-0">{children}</CardContent>
    </Card>
  )
}

export function ToolEmptyState({
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
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  )
}

export function StickyResultsPanel({
  summary,
  children,
  className,
}: {
  summary: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Sticky Summary */}
      <div className="shrink-0 sticky top-0 bg-background/95 backdrop-blur border-b z-10">{summary}</div>
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto zinc-scrollbar">{children}</div>
    </div>
  )
}
