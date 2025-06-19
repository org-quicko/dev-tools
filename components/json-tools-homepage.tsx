import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GitCompare, FileJson, ArrowRight, Zap, Shield, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const tools = [
  {
    title: "JSON Formatter",
    description: "Format and beautify JSON data with syntax highlighting and validation.",
    href: "/formatter",
    icon: FileText,
    usage: 85,
    badge: "Popular",
  },
  {
    title: "JSON Comparator",
    description: "Compare two JSON objects and highlight differences with detailed analysis.",
    href: "/comparator",
    icon: GitCompare,
    usage: 72,
    badge: "New",
  },
  {
    title: "Schema Validator",
    description: "Validate JSON data against JSON Schema with comprehensive error reporting.",
    href: "/validator",
    icon: FileJson,
    usage: 58,
  },
]

const stats = [
  { label: "Tools Available", value: "3", icon: Zap },
  { label: "Privacy First", value: "100%", icon: Shield },
  { label: "Avg Response", value: "<50ms", icon: Clock },
  { label: "User Satisfaction", value: "98%", icon: TrendingUp },
]

const features = [
  {
    title: "Offline First",
    description: "All processing happens locally in your browser. No data leaves your machine.",
  },
  {
    title: "Lightning Fast",
    description: "Optimized for speed with instant results and real-time feedback.",
  },
  {
    title: "Developer Focused",
    description: "Built by developers, for developers. Clean interface, powerful features.",
  },
  {
    title: "Open Source",
    description: "Transparent, community-driven development with regular updates.",
  },
]

export function JsonToolsHomepage() {
  return (
    <div className="w-full space-y-8">
      {/* Hero Section with Stats */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Developer Utilities</h1>
            <p className="text-xl text-muted-foreground">
              A collection of free, offline-first tools designed to streamline common development tasks, save you time,
              and reduce repetitive work. All processing happens locally in your browser.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Start Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Start</CardTitle>
            <CardDescription>Jump right into your most used tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tools.slice(0, 2).map((tool) => {
              const Icon = tool.icon
              return (
                <Link key={tool.href} href={tool.href}>
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto p-3">
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.title}</div>
                      <div className="text-xs text-muted-foreground">Click to start</div>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Available JSON Tools</h2>
          <Badge variant="secondary" className="text-xs">
            {tools.length} tools available
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.href}
                className="flex flex-col hover:shadow-md transition-all duration-200 border-border hover:border-primary/30 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        {tool.badge && (
                          <Badge variant={tool.badge === "Popular" ? "default" : "secondary"} className="text-xs mt-1">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>

                  {/* Usage indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">{tool.usage}%</span>
                    </div>
                    <Progress value={tool.usage} className="h-1" />
                  </div>
                </CardHeader>

                <CardContent className="mt-auto">
                  <Link href={tool.href}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Why Choose Dev Tools?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-4">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center space-y-4">
          <h3 className="text-lg font-semibold">More Tools Coming Soon</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're constantly adding new utilities based on developer feedback. Have a suggestion? Let us know what tools
            would make your workflow more efficient.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Request Feature</Button>
            <Button>View Roadmap</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
