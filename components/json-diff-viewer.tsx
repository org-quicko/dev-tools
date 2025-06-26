"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { JsonSyntaxHighlighter } from "./json-syntax-highlighter"
import type { JsonDifference } from "@/types/comparison"

interface JsonDiffViewerProps {
  json1: string
  json2: string
  differences: JsonDifference[]
  highlightedPath?: string | null
}

export function JsonDiffViewer({ json1, json2, differences, highlightedPath }: JsonDiffViewerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[600px] border rounded-lg overflow-hidden">
      <div className="border-r">
        <div className="bg-muted/50 px-4 py-3 border-b">
          <h3 className="font-medium text-primary">JSON 1</h3>
        </div>
        <ScrollArea className="h-[550px]">
          <JsonSyntaxHighlighter
            json={json1}
            highlightedPath={highlightedPath}
            className="h-full border-0 rounded-none bg-transparent"
          />
        </ScrollArea>
      </div>

      <div>
        <div className="bg-muted/50 px-4 py-3 border-b">
          <h3 className="font-medium text-primary">JSON 2</h3>
        </div>
        <ScrollArea className="h-[550px]">
          <JsonSyntaxHighlighter
            json={json2}
            highlightedPath={highlightedPath}
            className="h-full border-0 rounded-none bg-transparent"
          />
        </ScrollArea>
      </div>
    </div>
  )
}
