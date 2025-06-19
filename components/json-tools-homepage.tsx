import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitCompare, FileJson } from "lucide-react"

const tools = [
  {
    title: "JSON Formatter",
    description: "Format and beautify JSON data with syntax highlighting and validation.",
    href: "/formatter",
    icon: FileText,
  },
  {
    title: "JSON Comparator",
    description: "Compare two JSON objects and highlight differences with detailed analysis.",
    href: "/comparator",
    icon: GitCompare,
  },
  {
    title: "Schema Validator",
    description: "Validate JSON data against JSON Schema with comprehensive error reporting.",
    href: "/validator",
    icon: FileJson,
  },
]

export function JsonToolsHomepage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Developer Utilities</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A collection of free, offline-first tools designed to streamline common development tasks, save you time, and
          reduce repetitive work. All processing happens locally in your browser.
        </p>
      </div>

      {/* Why These Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Why These Tools?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Save Time & Effort</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automate common tasks like formatting JSON, comparing data structures, or validating schemas. Focus on
                building, not on tedious manual work.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All tools run entirely in your browser. Your data never leaves your machine, ensuring complete privacy
                and security. No sign-ups, no tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available JSON Tools</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
