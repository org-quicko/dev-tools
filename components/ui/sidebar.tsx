"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// 1. Sidebar Context (Simplified - no longer needs isCollapsible or variant)
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  React.useEffect(() => {
    document.cookie = `sidebar:state=${isOpen}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [isOpen])

  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

// 2. Sidebar Component (Optimized width)
interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({ className, ...props }, ref) => {
  return (
    <aside
      ref={ref}
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border",
        "w-48 flex-shrink-0", // w-48 (192px)
        "fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0",
        className,
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

// 3. Sidebar Header
export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-3 border-b border-border h-14", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

// 4. Sidebar Content
export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden p-3", className)} {...props} />
  ),
)
SidebarContent.displayName = "SidebarContent"

// 5. Sidebar Menu
export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => <ul ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

// 6. Sidebar Menu Item
export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("", className)} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// 7. Sidebar Menu Button - THE SINGLE SOURCE OF TRUTH FOR STYLING
interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "w-full justify-start rounded-md px-3 py-2 text-sm font-normal transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground font-semibold",
          className,
        )}
        asChild={asChild}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// 8. Sidebar Group
export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-2", className)} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

// 9. Sidebar Group Label
export const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider", className)}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// 10. Sidebar Group Content
export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// 11. Sidebar Inset (for main content)
export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 flex flex-col min-w-0",
          "md:ml-48", // This should match the sidebar width (w-48)
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"
