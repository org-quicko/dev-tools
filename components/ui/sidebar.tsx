"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Removed ChevronLeft, ChevronRight as SidebarTrigger is removed

// 1. Sidebar Context (Simplified - no longer needs isCollapsible or variant)
interface SidebarContextType {
  isOpen: boolean // Still useful for internal state, though not for external collapse
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

  // Persist sidebar state in a cookie (still useful if we want to remember open/closed state for other reasons, but not for collapse)
  React.useEffect(() => {
    document.cookie = `sidebar:state=${isOpen}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [isOpen])

  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

// 2. Sidebar Component (Fixed width, no collapsible variants)
const sidebarVariants = cva(
  "flex flex-col h-screen bg-background text-foreground transition-all duration-300 ease-in-out",
  {
    variants: {
      // No isOpen or collapsible variants needed for fixed sidebar
    },
    defaultVariants: {
      // No default variants needed
    },
  },
)

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({ className, ...props }, ref) => {
  return (
    <aside
      ref={ref}
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 md:relative md:translate-x-0", // Fixed width, always visible on desktop
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
    <div ref={ref} className={cn("flex items-center justify-between p-4", className)} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

// 4. Sidebar Content
export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)} {...props} />
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

// 7. Sidebar Menu Button (for navigation links - simplified)
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
        size="default" // Always default size
        className={cn("w-full justify-start", isActive && "bg-accent text-accent-foreground", className)}
        asChild={asChild}
        {...props}
      />
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// 8. Sidebar Group
export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

// 9. Sidebar Group Label (always visible)
export const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// 10. Sidebar Group Content
export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// 11. Sidebar Trigger (Removed - no longer needed)
// export const SidebarTrigger = ...

// 12. Sidebar Inset (for main content - fixed margin)
export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 md:ml-64", // Always apply ml-64 on desktop
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

// 13. Sidebar Overlay (Removed - no longer needed)
// export const SidebarOverlay = ...
