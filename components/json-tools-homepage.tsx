"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"
import {
  FileText,
  GitCompare,
  Shield,
  Zap,
  Code,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react"

const tools = [
  {
    title: "JSON Formatter",
    description: "Format, beautify, and validate JSON with customizable indentation and sorting options.",
    href: "/formatter",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    features: ["Auto-formatting", "Syntax validation", "Key sorting", "Minification"],
    status: "stable",
  },
  {
    title: "JSON Comparator",
    description: "Compare JSON files with intelligent diff detection, side-by-side view, and export capabilities.",
    href: "/comparator",
    icon: GitCompare,
    color: "from-green-500 to-green-600",
    features: ["Smart diffing", "Export reports", "Line-by-line comparison", "Semantic analysis"],
    status: "stable",
  },
  {
    title: "Schema Validator",
    description: "Validate JSON against schemas with comprehensive error reporting and multiple draft support.",
    href: "/validator",
    icon: Shield,
    color: "from-purple-500 to-purple-600",
    features: ["Multi-draft support", "Detailed errors", "Custom formats", "Batch validation"],
    status: "stable",
  },
]

const upcomingTools = [
  { name: "Hash Generator", icon: Code, description: "Generate MD5, SHA-1, SHA-256 hashes" },
  { name: "Base64 Encoder", icon: Zap, description: "Encode/decode Base64 strings" },
  { name: "Regex Tester", icon: Settings, description: "Test and debug regular expressions" },
]

const stats = [
  { label: "Tools Available", value: "3", icon: CheckCircle },
  { label: "Always Offline", value: "100%", icon: Clock },
  { label: "Open Source", value: "MIT", icon: Users },
]

export function JsonToolsHomepage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="tool-header">
        <div className="tool-header-content">
          <div className="flex items-center gap-3">
            <div className="tool-icon">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <h1 className="tool-title">Dev Tools</h1>
              <p className="tool-description">Fast, offline-first developer utilities</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="tool-container">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4" />
              Built with ShadCN UI & Zinc Theme
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Developer Tools
              <span className="block text-muted-foreground text-2xl md:text-3xl font-normal mt-2">That Just Work</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Fast, offline-first utilities for JSON processing, validation, and comparison. No signups, no tracking,
              just tools that work instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formatter">
                <Button size="lg" className="zinc-button-primary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/comparator">
                <Button variant="outline" size="lg" className="zinc-button-outline">
                  Compare JSON
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="tool-card text-center zinc-transition">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tools Grid */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Available Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade JSON tools designed for developers who value speed and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Link key={index} href={tool.href} className="group">
                <Card className="tool-card h-full zinc-transition hover:shadow-zinc-lg group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}
                      >
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="zinc-badge-secondary text-xs">{tool.status}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-foreground group-hover:text-primary zinc-transition">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center text-sm text-primary group-hover:text-primary/80 zinc-transition">
                        Open Tool
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 zinc-transition" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Tools */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">More developer utilities in development</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {upcomingTools.map((tool, index) => (
              <Card key={index} className="tool-card zinc-transition opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <tool.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{tool.name}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="zinc-badge-outline text-xs">
                    In Development
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <Card className="tool-card max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Why Choose Dev Tools?</CardTitle>
              <CardDescription>Built for developers who need reliable, fast tools without the bloat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Offline First</h4>
                      <p className="text-sm text-muted-foreground">
                        All processing happens locally. No data leaves your browser.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                      <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Lightning Fast</h4>
                      <p className="text-sm text-muted-foreground">
                        Optimized for speed with instant loading and real-time processing.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                      <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Privacy Focused</h4>
                      <p className="text-sm text-muted-foreground">
                        No tracking, no analytics, no data collection. Just tools.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mt-0.5">
                      <Code className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Open Source</h4>
                      <p className="text-sm text-muted-foreground">Built in the open with modern web technologies.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="tool-container">
          <div className="flex flex-col md:flex-row items-center justify-between py-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="tool-icon">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-foreground">Dev Tools</div>
                <div className="text-sm text-muted-foreground">Built with ShadCN UI</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">© 2024 Dev Tools. Open source and privacy-focused.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
