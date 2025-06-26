"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, GitCompare, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

const tools = [
  {
    title: "JSON Formatter",
    description: "Cleanly format and inspect JSON with syntax highlighting.",
    icon: FileText,
    href: "/formatter",
  },
  {
    title: "JSON Comparator",
    description: "Spot differences instantly by comparing two JSON files side-by-side.",
    icon: GitCompare,
    href: "/comparator",
  },
  {
    title: "Schema Validator",
    description: "Check your JSON against a schema with detailed, human-friendly feedback.",
    icon: Shield,
    href: "/validator",
  },
]

export function JsonToolsHomepage() {
  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Dev Tools</h1>
        <div className="w-full mx-auto text-center text-muted-foreground text-base sm:text-lg leading-snug px-4">
          <p>
            A growing suite of developer tools — simple, fast, and always in&nbsp;
            <span className="whitespace-nowrap">your browser</span>.
          </p>
          <p className="mt-2">No logins. No clutter. Just clean, focused tools built for everyday coding.</p>
        </div>
      </div>

      {/* Why Use These Tools? Section */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-2xl font-semibold text-center">Why Use These Tools?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-lg border p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base sm:text-lg">Designed for Focus</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Each tool does one thing — fast and clearly — so you stay in flow, not lost in menus.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base sm:text-lg">Instant Access</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                No setup, no installs. Open a tool and get to work right in your browser.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base sm:text-lg">Open & Growing</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Free, open-source, and evolving with your needs. New tools added regularly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-2xl font-semibold text-center">Available Tools</h2>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card key={tool.title} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" title={tool.title} />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{tool.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full text-xs sm:text-sm" size="sm">
                    <Link href={tool.href} className="flex items-center justify-center gap-2">
                      Open Tool
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Footer Tagline */}
      <p className="text-sm text-muted-foreground text-center py-4">Simple tools, thoughtfully made — with ❤️</p>
    </div>
  )
}
