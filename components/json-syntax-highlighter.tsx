"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { highlight } from "sugar-high"

interface JsonSyntaxHighlighterProps extends React.HTMLAttributes<HTMLPreElement> {
  json: string
}

export function JsonSyntaxHighlighter({ json, className, style, ...props }: JsonSyntaxHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState("")

  useEffect(() => {
    try {
      // Ensure JSON is valid before highlighting
      const parsedJson = JSON.parse(json)
      setHighlightedCode(highlight(JSON.stringify(parsedJson, null, 2)))
    } catch (e) {
      // If JSON is invalid, display it as plain text without highlighting
      setHighlightedCode(json)
    }
  }, [json])

  return (
    <pre
      className={cn(
        "w-full h-full p-3 font-mono text-sm", // Removed overflow-auto and zinc-scrollbar
        className,
      )}
      style={style}
      {...props}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  )
}
