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
    <Sidebar>
      <SidebarHeader>
        {" "}
        {/* Uses base p-3 from ui/sidebar.tsx */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          {" "}
          {/* Content styling is fine here */}
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Code className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-none truncate">Dev Tools</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {" "}
        {/* Uses base p-3 from ui/sidebar.tsx */}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {" "}
            {/* Uses base space-y-2 from ui/sidebar.tsx */}
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel> {/* Uses base styling from ui/sidebar.tsx */}
            <SidebarGroupContent>
              {" "}
              {/* Uses base space-y-1 from ui/sidebar.tsx */}
              <SidebarMenu>
                {" "}
                {/* Uses base space-y-0.5 from ui/sidebar.tsx */}
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      {/* No className prop here, so base styles from ui/sidebar.tsx apply */}
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href} className="flex items-center gap-2 min-w-0">
                          {" "}
                          {/* Content styling */}
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
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
