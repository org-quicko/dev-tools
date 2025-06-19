import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitCompare, FileJson, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <div className="w-full max-w-none space-y-6">
      {/* Hero Section */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Developer Utilities</h1>
        <p className="text-xl text-muted-foreground max-w-4xl">
          A collection of free, offline-first tools designed to streamline common development tasks, save you time, and
          reduce repetitive work. All processing happens locally in your browser.
        </p>
      </div>

      {/* Why These Tools Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Why These Tools?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Save Time & Effort</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground text-sm">
                Automate common tasks like formatting JSON, comparing data structures, or validating schemas. Focus on
                building, not on tedious manual work.
              </p>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Privacy First</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground text-sm">
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
          More tools are planned. This project is open source and aims to be a reliable companion for everyday
          development tasks.
        </p>
      </div>
    </div>
  )
}
