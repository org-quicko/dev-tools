import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitCompare, FileJson, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  {
    title: "JSON Formatter",
    description: "Format and inspect JSON with syntax highlighting and clean structure.",
    href: "/formatter",
    icon: FileText,
  },
  {
    title: "JSON Comparator",
    description: "Compare two JSON files side-by-side and spot differences instantly.",
    href: "/comparator",
    icon: GitCompare,
  },
  {
    title: "Schema Validator",
    description: "Validate JSON against a schema with clear, detailed feedback.",
    href: "/validator",
    icon: FileJson,
  },
]

export function JsonToolsHomepage() {
  return (
    <div className="w-full max-w-none space-y-6">
      {/* Hero Section */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Developer Utilities</h1>
        
        <p className="text-muted-foreground max-w-4xl text-lg">
          A growing collection of focused tools for everyday development work.
          <br />
          No accounts. No clutter. Just useful tools that run instantly in your browser.
        </p>
      </div>

      {/* Why These Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Why These Tools?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Focused by Design</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground text-sm">
                Each tool does one job, simply and clearly, so you can stay in flow and get back to what matters.
              </p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Ready When You Are</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground text-sm">
                No setup. No downloads. Open a tool and start working. Everything runs in the browser.
              </p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Open & Evolving</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground text-sm">
                Built for the community. Free and open-source, with more tools coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available JSON Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.href}
                className="flex flex-col hover:shadow-md transition-shadow border-border hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Link href={tool.href}>
                    <Button variant="outline" className="w-full">
                      Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-muted-foreground text-sm">
          This is just the start. More tools are on the way—crafted with the same care and clarity.
        </p>
      </div>
    </div>
  )
}
