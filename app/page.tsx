import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, GitCompare, FileJson, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-12 py-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Developer Utilities</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          A collection of free, offline-first tools designed to streamline common development tasks, save you time, and
          reduce repetitive work. All processing happens locally in your browser.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Why These Tools?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Save Time & Effort</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automate common tasks like formatting JSON, comparing data structures, or validating schemas. Focus on
                building, not on tedious manual work.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All tools run entirely in your browser. Your data never leaves your machine, ensuring complete privacy
                and security. No sign-ups, no tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Available JSON Tools</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "JSON Formatter",
              description: "Beautify and validate your JSON data with customizable options.",
              href: "/formatter",
              icon: FileText,
            },
            {
              title: "JSON Comparator",
              description: "Compare two JSON objects and highlight their differences.",
              href: "/comparator",
              icon: GitCompare,
            },
            {
              title: "Schema Validator",
              description: "Validate JSON data against a specified JSON Schema.",
              href: "/validator",
              icon: FileJson,
            },
          ].map((tool) => (
            <Card
              key={tool.title}
              className="flex flex-col bg-card/50 border-border hover:border-primary/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{tool.title}</CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link href={tool.href}>
                  <Button variant="outline" className="w-full zinc-button-outline hover:bg-muted">
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4 text-center">
        <p className="text-muted-foreground">
          More tools are planned. This project is open source and aims to be a reliable companion for everyday
          development tasks.
        </p>
      </section>
    </div>
  )
}
