"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JsonDiffViewer } from "./json-diff-viewer"
import type { JsonComparisonResult } from "@/types/comparison"

interface ComparisonViewProps {
  result: JsonComparisonResult
  json1: string
  json2: string
  highlightedPath?: string | null
}

export function ComparisonView({ result, json1, json2, highlightedPath }: ComparisonViewProps) {
  const { additions, deletions, modifications, unchanged } = result.summary

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{additions}</div>
              <div className="text-sm text-muted-foreground">Additions</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{deletions}</div>
              <div className="text-sm text-muted-foreground">Deletions</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{modifications}</div>
              <div className="text-sm text-muted-foreground">Changes</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{unchanged}</div>
              <div className="text-sm text-muted-foreground">Unchanged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
          <CardTitle>Side-by-Side Comparison</CardTitle>
          {highlightedPath && (
            <Badge variant="outline" className="w-fit">
              Highlighting: {highlightedPath}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <JsonDiffViewer
            json1={json1}
            json2={json2}
            differences={result.differences}
            highlightedPath={highlightedPath}
          />
        </CardContent>
      </Card>
    </div>
  )
}
