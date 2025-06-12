"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface JsonSyntaxHighlighterProps {
  json: string
  highlightedPath?: string | null
  className?: string
}

export function JsonSyntaxHighlighter({ json, highlightedPath, className }: JsonSyntaxHighlighterProps) {
  const highlightedJson = useMemo(() => {
    if (!json.trim()) return ""

    try {
      const parsed = JSON.parse(json)
      return syntaxHighlight(JSON.stringify(parsed, null, 2), highlightedPath)
    } catch {
      return json
    }
  }, [json, highlightedPath])

  return (
    <pre
      className={cn(
        "font-mono text-sm whitespace-pre-wrap break-words p-4 rounded-lg",
        "bg-muted/30 border overflow-auto max-h-[500px]",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        "selection:bg-primary/20",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: highlightedJson }}
      tabIndex={0}
      role="textbox"
      aria-label="JSON content with syntax highlighting"
    />
  )
}

function syntaxHighlight(json: string, highlightPath?: string | null): string {
  if (!json) return ""

  // Replace special characters and add syntax highlighting
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = ""

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // JSON key - Blue with better contrast
          cls = "text-blue-700 dark:text-blue-300 font-semibold"
        } else {
          // String value - Green with better contrast
          cls = "text-green-700 dark:text-green-300"
        }
      } else if (/true|false/.test(match)) {
        // Boolean - Orange with better contrast
        cls = "text-orange-700 dark:text-orange-300 font-medium"
      } else if (/null/.test(match)) {
        // Null - Gray with better contrast
        cls = "text-gray-600 dark:text-gray-400 font-medium italic"
      } else {
        // Number - Purple with better contrast
        cls = "text-purple-700 dark:text-purple-300 font-medium"
      }

      // Add highlighting for specific path if provided
      const isHighlighted = highlightPath && match.includes(highlightPath.split(".").pop() || "")
      const highlightClass = isHighlighted
        ? " bg-yellow-300 dark:bg-yellow-800 px-1 rounded shadow-sm ring-2 ring-yellow-400 dark:ring-yellow-600"
        : ""

      return `<span class="${cls}${highlightClass}">${match}</span>`
    },
  )
}
