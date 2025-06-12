"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { FileText, GitCompare, Shield, ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"

export function JsonToolsHomepage() {
  const tools = [
    {
      id: "formatter",
      title: "JSON Formatter",
      description: "Format your JSON for better readability.",
      longDescription:
        "Beautify and format your JSON data with customizable indentation, property sorting, and validation. Perfect for cleaning up minified JSON or organizing data structures.",
      icon: <FileText className="h-8 w-8" />,
      href: "/formatter",
      features: ["Custom indentation", "Property sorting", "Syntax validation", "Download formatted JSON"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "comparator",
      title: "JSON Comparator",
      description: "Compare two JSON files side-by-side.",
      longDescription:
        "Advanced JSON comparison tool with intelligent difference detection, side-by-side visualization, and detailed analysis. Supports complex nested structures and arrays.",
      icon: <GitCompare className="h-8 w-8" />,
      href: "/comparator",
      features: [
        "Side-by-side comparison",
        "Intelligent diff detection",
        "Export comparison reports",
        "Real-time analysis",
      ],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: "validator",
      title: "JSON Schema Validator",
      description: "Validate your JSON against a JSON schema.",
      longDescription:
        "Comprehensive JSON schema validation with detailed error reporting, line-by-line analysis, and actionable feedback. Supports JSON Schema Draft 7 and later.",
      icon: <Shield className="h-8 w-8" />,
      href: "/validator",
      features: ["Schema validation", "Detailed error reports", "Line-by-line analysis", "Multiple schema formats"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">JSON Tools</h1>
                <p className="text-sm text-muted-foreground">Professional JSON processing utilities</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful JSON Tools for Developers</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Format, compare, and validate JSON data with our comprehensive suite of professional tools. Built for
            developers who need reliable, fast, and accurate JSON processing.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No data stored</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Real-time processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Client-side validation</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardHeader className="pb-4">
                <div
                  className={`w-16 h-16 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={tool.iconColor}>{tool.icon}</div>
                </div>
                <CardTitle className="text-xl font-semibold">{tool.title}</CardTitle>
                <p className="text-muted-foreground">{tool.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{tool.longDescription}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={tool.href}>
                  <Button className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 transition-opacity group`}>
                    <span>Open {tool.title}</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Our JSON Tools?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern web technologies and designed for professional developers who need reliable, fast, and
              secure JSON processing capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold mb-2">Lightning Fast</h4>
              <p className="text-sm text-muted-foreground">
                Client-side processing ensures instant results without server delays
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold mb-2">Secure & Private</h4>
              <p className="text-sm text-muted-foreground">
                Your data never leaves your browser, ensuring complete privacy
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold mb-2">Professional Grade</h4>
              <p className="text-sm text-muted-foreground">
                Enterprise-level features designed for complex JSON workflows
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mx-auto mb-3">
                <GitCompare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold mb-2">Advanced Analysis</h4>
              <p className="text-sm text-muted-foreground">Intelligent algorithms for deep JSON structure analysis</p>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Get Started in Seconds</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            No registration required. Simply choose your tool and start processing JSON data immediately. All tools work
            offline and respect your privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/formatter">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <FileText className="h-4 w-4 mr-2" />
                Try JSON Formatter
              </Button>
            </Link>
            <Link href="/comparator">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <GitCompare className="h-4 w-4 mr-2" />
                Try JSON Comparator
              </Button>
            </Link>
            <Link href="/validator">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <Shield className="h-4 w-4 mr-2" />
                Try Schema Validator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 JSON Tools. Built with Next.js and TypeScript.</p>
            <p className="mt-2">All processing happens in your browser. No data is stored or transmitted.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
