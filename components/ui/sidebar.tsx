"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// 1. Sidebar Context
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isCollapsible: boolean
  variant: "default" | "icon"
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
  collapsible?: "default" | "icon"
}

export function SidebarProvider({ children, defaultOpen = true, collapsible = "default" }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const isCollapsible = collapsible !== "default"
  const variant = collapsible

  // Persist sidebar state in a cookie
  React.useEffect(() => {
    document.cookie = `sidebar:state=${isOpen}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [isOpen])

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsible, variant }}>{children}</SidebarContext.Provider>
  )
}

// 2. Sidebar Component
const sidebarVariants = cva(
  "fixed md:relative z-30 flex flex-col h-screen bg-background text-foreground transition-all duration-300 ease-in-out",
  {
    variants: {
      isOpen: {
        true: "w-64 translate-x-0",
        false: "w-16 translate-x-0",
      },
      collapsible: {
        default: "w-64", // Fixed width if not collapsible
        icon: "", // Width controlled by isOpen
      },
    },
    compoundVariants: [
      {
        isOpen: false,
        collapsible: "icon",
        className: "w-16",
      },
      {
        isOpen: true,
        collapsible: "icon",
        className: "w-64",
      },
    ],
    defaultVariants: {
      isOpen: true,
      collapsible: "default",
    },
  },
)

interface SidebarProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sidebarVariants> {
  collapsible?: "default" | "icon" // Re-declare to ensure it's passed to variants
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsible = "default", ...props }, ref) => {
    const { isOpen, isCollapsible, variant } = useSidebar()

    return (
      <aside
        ref={ref}
        className={cn(
          sidebarVariants({
            isOpen: isCollapsible ? isOpen : true, // Only apply isOpen variant if collapsible
            collapsible: variant,
          }),
          className,
        )}
        {...props}
      />
    )
  },
)
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

// 7. Sidebar Menu Button (for navigation links)
interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild, ...props }, ref) => {
    const { isOpen, isCollapsible } = useSidebar()
    return (
      <Button
        ref={ref}
        variant="ghost"
        size={isCollapsible && !isOpen ? "icon" : "default"}
        className={cn(
          "w-full justify-start",
          isCollapsible && !isOpen && "w-10 h-10 p-0", // Ensure icon-only button is square
          isActive && "bg-accent text-accent-foreground",
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
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

// 9. Sidebar Group Label
export const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, isCollapsible } = useSidebar()
    if (isCollapsible && !isOpen) return null // Hide label when collapsed
    return <p ref={ref} className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// 10. Sidebar Group Content
export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("space-y-1", className)} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// 11. Sidebar Trigger
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSidebar()
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("h-8 w-8", className)}
        {...props}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="sr-only">{isOpen ? "Collapse sidebar" : "Expand sidebar"}</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

// 12. Sidebar Inset (for main content)
export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, isCollapsible, variant } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsible && isOpen && "md:ml-64", // Adjust margin based on sidebar width
          isCollapsible && !isOpen && "md:ml-16", // Adjust margin for collapsed state
          className,
        )}
        style={{ width: "100%" }}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = "SidebarInset"

// 13. Sidebar Overlay (for mobile)
export const SidebarOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-20 bg-background/80 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          className,
        )}
        onClick={() => setIsOpen(false)}
        {...props}
      />
    )
  },
)
SidebarOverlay.displayName = "SidebarOverlay"
