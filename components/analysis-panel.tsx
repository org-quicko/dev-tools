"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Edit, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JsonComparisonResult } from "@/types/comparison"

interface AnalysisPanelProps {
  result: JsonComparisonResult
  onHighlightPath?: (path: string | null) => void
  highlightedPath?: string | null
  onDiffSelect?: (index: number) => void
  currentDiffIndex?: number
  fullView?: boolean
  compact?: boolean
  showExport?: boolean
  json1?: string
  json2?: string
  onNavigateNext?: () => void
  onNavigatePrev?: () => void
  responsiveHeight?: string
  className?: string
  json1Name?: string
  json2Name?: string
}

export function AnalysisPanel({
  result,
  onHighlightPath,
  highlightedPath,
  onDiffSelect,
  currentDiffIndex = 0,
  fullView = false,
  compact = false,
  showExport = false,
  json1 = "",
  json2 = "",
  onNavigateNext,
  onNavigatePrev,
  responsiveHeight = "500px",
  className,
  json1Name = "",
  json2Name = "",
}: AnalysisPanelProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["addition", "deletion", "modification"])
  const contentRef = useRef<HTMLDivElement>(null)

  const additions = result.differences.filter((d) => d.type === "addition")
  const deletions = result.differences.filter((d) => d.type === "deletion")
  const modifications = result.differences.filter((d) => d.type === "modification")

  const filteredDifferences = result.differences.filter((diff) => activeFilters.includes(diff.type))

  const handleDiffClick = (diff: any, index: number) => {
    const globalIndex = result.differences.findIndex((d) => d === diff)

    if (onDiffSelect) {
      onDiffSelect(globalIndex)
    }

    if (onHighlightPath) {
      onHighlightPath(diff.path)
    }
  }

  const toggleFilter = (type: string) => {
    setActiveFilters((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const getDiffTypeIcon = (type: string) => {
    switch (type) {
      case "addition":
        return <Plus className="h-3 w-3" />
      case "deletion":
        return <Minus className="h-3 w-3" />
      case "modification":
        return <Edit className="h-3 w-3" />
      default:
        return null
    }
  }

  const getDiffTypeLabel = (type: string) => {
    switch (type) {
      case "addition":
        return "Missing property"
      case "deletion":
        return "Removed property"
      case "modification":
        return "Modified property"
      default:
        return type
    }
  }

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll into view when selected
  useEffect(() => {
    if (currentDiffIndex !== undefined && itemRefs.current[currentDiffIndex]) {
      itemRefs.current[currentDiffIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      })
    }
  }, [currentDiffIndex])

  // Get display names for JSON files
  const getDisplayName = (fileName: string, fallback: string) => {
    if (!fileName) return fallback
    return fileName.replace(/\.[^/.]+$/, "")
  }

  const json1DisplayName = getDisplayName(json1Name, "JSON 1")
  const json2DisplayName = getDisplayName(json2Name, "JSON 2")

  const renderDifferenceItem = (diff: any, index: number) => {
    const globalIndex = result.differences.findIndex((d) => d === diff)
    const isSelected = globalIndex === currentDiffIndex
    const isHighlighted = highlightedPath === diff.path

    return (
      <div
        ref={(el) => (itemRefs.current[globalIndex] = el)}
        key={`${diff.path}-${index}`}
        className={cn(
          "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md mb-2 relative",
          isSelected || isHighlighted
            ? "ring-2 ring-primary bg-primary/5 border-primary shadow-lg"
            : "hover:bg-muted/30 hover:border-primary/50",
        )}
        onClick={() => handleDiffClick(diff, index)}
      >
        {/* Difference number badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              isSelected || isHighlighted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            #{globalIndex + 1}
          </span>
        </div>

        <div className="flex items-start gap-2 pr-12">
          <div
            className={cn(
              "flex-shrink-0 mt-0.5 p-1 rounded",
              diff.type === "addition" && "bg-green-100 dark:bg-green-900/50 text-green-600",
              diff.type === "deletion" && "bg-red-100 dark:bg-red-900/50 text-red-600",
              diff.type === "modification" && "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
            )}
          >
            {getDiffTypeIcon(diff.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{getDiffTypeLabel(diff.type)}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              <code
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono analysis-code",
                  isHighlighted ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200" : "bg-muted",
                )}
              >
                {diff.path}
              </code>
            </div>

            {/* Vertical layout for all difference types with JSON 1/JSON 2 labels */}
            <div className="space-y-2 analysis-content-wrap">
              {diff.type === "addition" && (
                <>
                  {diff.newValue !== undefined && (
                    <div className="space-y-1">
                      <div className="font-medium text-green-700 dark:text-green-300 text-xs">
                        {json2DisplayName} ({diff.rightLine || diff.leftLine}):
                      </div>
                      <code className="block bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-green-700 dark:text-green-300 text-xs analysis-code">
                        {JSON.stringify(diff.newValue)}
                      </code>
                    </div>
                  )}
                </>
              )}

              {diff.type === "deletion" && (
                <>
                  {diff.oldValue !== undefined && (
                    <div className="space-y-1">
                      <div className="font-medium text-red-700 dark:text-red-300 text-xs">
                        {json1DisplayName} ({diff.leftLine || diff.rightLine}):
                      </div>
                      <code className="block bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-700 dark:text-red-300 text-xs analysis-code">
                        {JSON.stringify(diff.oldValue)}
                      </code>
                    </div>
                  )}
                </>
              )}

              {diff.type === "modification" && (
                <>
                  {diff.oldValue !== undefined && (
                    <div className="space-y-1">
                      <div className="font-medium text-red-700 dark:text-red-300 text-xs">
                        {json1DisplayName} ({diff.leftLine}):
                      </div>
                      <code className="block bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-red-700 dark:text-red-300 text-xs analysis-code">
                        {JSON.stringify(diff.oldValue)}
                      </code>
                    </div>
                  )}
                  {diff.newValue !== undefined && (
                    <div className="space-y-1">
                      <div className="font-medium text-green-700 dark:text-green-300 text-xs">
                        {json2DisplayName} ({diff.rightLine}):
                      </div>
                      <code className="block bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-green-700 dark:text-green-300 text-xs analysis-code">
                        {JSON.stringify(diff.newValue)}
                      </code>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analysis-panel-wrapper">
      <Card className={cn("panel tool-card", className)}>
        <CardHeader className="analysis-panel-header pb-3 border-b">
          {/* Combined Statistics and Filters - No heading text */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={cn(
                "text-center p-2 rounded cursor-pointer transition-all",
                activeFilters.includes("addition")
                  ? "bg-green-100 dark:bg-green-950/50 ring-1 ring-green-500"
                  : "bg-green-50 dark:bg-green-950/30 opacity-50",
              )}
              onClick={() => toggleFilter("addition")}
              title="Click to toggle Added differences"
            >
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{additions.length}</div>
              <div className="text-xs text-muted-foreground">Added</div>
            </div>
            <div
              className={cn(
                "text-center p-2 rounded cursor-pointer transition-all",
                activeFilters.includes("deletion")
                  ? "bg-red-100 dark:bg-red-950/50 ring-1 ring-red-500"
                  : "bg-red-50 dark:bg-red-950/30 opacity-50",
              )}
              onClick={() => toggleFilter("deletion")}
              title="Click to toggle Removed differences"
            >
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{deletions.length}</div>
              <div className="text-xs text-muted-foreground">Removed</div>
            </div>
            <div
              className={cn(
                "text-center p-2 rounded cursor-pointer transition-all",
                activeFilters.includes("modification")
                  ? "bg-blue-100 dark:bg-blue-950/50 ring-1 ring-blue-500"
                  : "bg-blue-50 dark:bg-blue-950/30 opacity-50",
              )}
              onClick={() => toggleFilter("modification")}
              title="Click to toggle Modified differences"
            >
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{modifications.length}</div>
              <div className="text-xs text-muted-foreground">Modified</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="panel-content modern-scrollbar" ref={contentRef}>
          {filteredDifferences.length > 0 ? (
            filteredDifferences.map((diff, index) => renderDifferenceItem(diff, index))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No differences match the current filters</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setActiveFilters(["addition", "deletion", "modification"])}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
