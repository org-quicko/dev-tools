"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, GitCompare, Shield, Home } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
  ],
  jsonTools: [
    {
      title: "Formatter",
      url: "/formatter",
      icon: FileText,
    },
    {
      title: "Comparator",
      url: "/comparator",
      icon: GitCompare,
    },
    {
      title: "Schema Validator",
      url: "/validator",
      icon: Shield,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Dev Tools</span>
            <span className="truncate text-xs">Developer Utilities</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>JSON Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.jsonTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm transition-all">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs text-sidebar-foreground/70">Built with shadcn/ui</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
