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
import { FileJson, GitCompare, FileText, Code, Home, Settings, HelpCircle, Zap, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navGroups = [
  {
    label: "Main",
    items: [{ href: "/", label: "Dashboard", icon: Home }],
  },
  {
    label: "JSON Tools",
    items: [
      { href: "/formatter", label: "Formatter", icon: FileText, badge: "Hot" },
      { href: "/comparator", label: "Comparator", icon: GitCompare, badge: "New" },
      { href: "/validator", label: "Schema Validator", icon: FileJson },
    ],
  },
  {
    label: "Coming Soon",
    items: [
      { href: "#", label: "Base64 Encoder", icon: Code, disabled: true },
      { href: "#", label: "Regex Tester", icon: Zap, disabled: true },
      { href: "#", label: "URL Parser", icon: Settings, disabled: true },
    ],
  },
]

const recentTools = [
  { href: "/formatter", label: "JSON Formatter", time: "2m ago" },
  { href: "/comparator", label: "JSON Comparator", time: "1h ago" },
]

export function AppSidebarNav() {
  const pathname = usePathname()

  return (
    <Sidebar className="w-56 flex-shrink-0">
      <SidebarHeader className="p-3 border-b border-border">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Code className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground leading-none truncate">Dev Tools</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-4">
        {/* Main Navigation */}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild={!item.disabled}
                        isActive={isActive}
                        className={`
                          flex items-center justify-between w-full h-8 px-2 text-sm
                          ${isActive ? "bg-accent text-accent-foreground font-medium" : ""}
                          ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}
                        `}
                      >
                        {item.disabled ? (
                          <div className="flex items-center gap-2 min-w-0 w-full">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                            <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-auto">
                              Soon
                            </Badge>
                          </div>
                        ) : (
                          <Link href={item.href} className="flex items-center gap-2 min-w-0 w-full">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badge === "Hot" ? "destructive" : "secondary"}
                                className="h-4 px-1 text-[10px]"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Recent Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {recentTools.map((tool) => (
                <SidebarMenuItem key={tool.href}>
                  <SidebarMenuButton asChild className="h-7 px-2 text-xs">
                    <Link href={tool.href} className="flex items-center justify-between w-full">
                      <span className="truncate">{tool.label}</span>
                      <span className="text-muted-foreground text-[10px]">{tool.time}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start gap-2">
            <Star className="h-3 w-3" />
            Feedback
          </Button>
          <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start gap-2">
            <HelpCircle className="h-3 w-3" />
            Help & Docs
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Tools Used</span>
              <span className="font-mono">1,247</span>
            </div>
            <div className="flex justify-between">
              <span>Data Processed</span>
              <span className="font-mono">2.4MB</span>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
