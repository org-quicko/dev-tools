"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { FileJson, GitCompare, FileText, Code } from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "JSON Tools",
    items: [
      { href: "/formatter", label: "Formatter", icon: FileText },
      { href: "/comparator", label: "Comparator", icon: GitCompare },
      { href: "/validator", label: "Schema Validator", icon: FileJson },
    ],
  },
]

export function AppSidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-3">
        {" "}
        {/* Reduced padding from p-4 to p-3 */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {" "}
            {/* Reduced from h-8 w-8 to h-6 w-6 */}
            <Code className="h-4 w-4" /> {/* Reduced from h-5 w-5 to h-4 w-4 */}
          </div>
          <span className="text-base font-semibold text-foreground leading-none">
            {" "}
            {/* Reduced from text-lg to text-base, added leading-none */}
            Dev Tools
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-3">
        {" "}
        {/* Reduced padding from p-4 to p-3 */}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-3">
            {" "}
            {/* Reduced from mb-4 to mb-3 */}
            {group.label && (
              <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2 py-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "justify-start gap-2 px-2 py-1.5 text-sm" /* Reduced from py-2 to py-1.5 */,
                          isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                          !isActive && "hover:bg-muted/50",
                        )}
                      >
                        <Link href={item.href}>
                          <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
