import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeaderNav() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      {/* Rest of your existing header content */}
    </header>
  )
}
