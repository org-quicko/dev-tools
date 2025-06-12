"use client"

import type React from "react"

import { useState } from "react"

import { useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { JsonInput } from "./json-input"
import { AnalysisPanel } from "./analysis-panel"
import { SettingsPanel } from "./settings-panel"
import { ThemeToggle } from "./theme-toggle"
import { compareJsons } from "@/lib/json-compare"
import {
  Settings,
  Trash2,
  Play,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
  HelpCircle,
  Home,
  GitCompare,
} from "lucide-react"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useDebounce } from "@/hooks/use-debounce"
import { useJsonContext } from "@/contexts/json-context"
import { ExportPanel } from "./export-panel"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

export function JsonComparator() {
  const {
    state,
    setComparisonResult,
    setHighlightedPath,
    setCurrentDiffIndex,
    setSettings,
    setComparing,
    setError,
    clearAll,
    setJson,
    clearJson,
    setLoading,
  } = useJsonContext()

  const {
    json1,
    json2,
    json1Name,
    json2Name,
    comparisonResult,
    highlightedPath,
    currentDiffIndex,
    settings,
    isComparing,
    errors,
  } = state

  const [expandedPanel, setExpandedPanel] = useState<"json1" | "json2" | "analysis" | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showExample1, setShowExample1] = useState(false)
  const [showExample2, setShowExample2] = useState(false)

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate responsive heights
  const getResponsiveHeight = () => {
    if (windowSize.height === 0) return "600px"

    const headerHeight = 160
    const padding = 100
    const availableHeight = windowSize.height - headerHeight - padding

    if (windowSize.width < 1024) {
      return "auto"
    }

    return `${Math.max(400, Math.min(800, availableHeight))}px`
  }

  const handleCompare = useCallback(async () => {
    if (!json1.trim() || !json2.trim()) {
      setError("comparison", "Please provide both JSON inputs before comparing.")
      return
    }

    // Clear any previous comparison errors
    setError("comparison", undefined)
    setComparing(true)
    setHighlightedPath(null)

    try {
      const result = await compareJsons(json1, json2, settings)
      setComparisonResult(result)

      if (result.differences.length > 0) {
        setTimeout(() => {
          setHighlightedPath(result.differences[0].path)
        }, 200)
      }
    } catch (error) {
      console.error("Comparison failed:", error)
      setError("comparison", `Comparison failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setComparisonResult(null)
    } finally {
      setComparing(false)
    }
  }, [json1, json2, settings, setComparing, setHighlightedPath, setComparisonResult, setError])

  // Debounced comparison for auto-compare
  const debouncedCompare = useDebounce(handleCompare, 1000)

  // Auto-compare when both JSONs are valid and not empty
  useEffect(() => {
    if (json1.trim() && json2.trim() && !errors.json1 && !errors.json2) {
      debouncedCompare()
    }
  }, [json1, json2, errors.json1, errors.json2, debouncedCompare])

  useKeyboardShortcuts({
    onCompare: handleCompare,
    onClear: clearAll,
  })

  const handleDiffNavigation = (index: number) => {
    if (comparisonResult && comparisonResult.differences[index]) {
      setCurrentDiffIndex(index)
      const targetDiff = comparisonResult.differences[index]
      setHighlightedPath(targetDiff.path)

      setTimeout(() => {
        setHighlightedPath(targetDiff.path)
      }, 50)
    }
  }

  const navigateNext = () => {
    if (comparisonResult && currentDiffIndex < comparisonResult.differences.length - 1) {
      handleDiffNavigation(currentDiffIndex + 1)
    }
  }

  const navigatePrev = () => {
    if (currentDiffIndex > 0) {
      handleDiffNavigation(currentDiffIndex - 1)
    }
  }

  const getDisplayName = (fileName: string, fallback: string) => {
    if (!fileName) return fallback
    return fileName.replace(/\.[^/.]+$/, "")
  }

  const json1DisplayName = getDisplayName(json1Name, "First JSON")
  const json2DisplayName = getDisplayName(json2Name, "Second JSON")

  const responsiveHeight = getResponsiveHeight()
  const isMobile = windowSize.width < 1024

  // File upload handlers
  const handleFileUpload = async (target: 1 | 2, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(target === 1 ? "json1" : "json2", true)

    try {
      if (file.size > 10 * 1024 * 1024) {
        setError(target === 1 ? "json1" : "json2", "File size too large. Please select a file smaller than 10MB.")
        return
      }

      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })

      try {
        const parsed = JSON.parse(content)
        const formatted = JSON.stringify(parsed, null, 2)
        setJson(target, formatted, file.name)
      } catch {
        setJson(target, content, file.name)
      }
    } catch (err) {
      setError(target === 1 ? "json1" : "json2", "Failed to read file. Please try again.")
    } finally {
      setLoading(target === 1 ? "json1" : "json2", false)
      event.target.value = ""
    }
  }

  const insertExample = (target: 1 | 2) => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "isActive": true
}`
    setJson(target, example, "example.json")
    if (target === 1) setShowExample1(false)
    if (target === 2) setShowExample2(false)
  }

  return (
    <TooltipProvider>
      <div className="app-wrapper">
        {/* Header */}
        <div className="tool-header">
          <div className="tool-header-content">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  JSON Tools
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="tool-icon bg-gradient-to-br from-green-500 to-green-600">
                  <GitCompare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="tool-title">JSON Comparator</h1>
                  <p className="tool-description">Compare and analyze JSON differences</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="tool-container">
          {/* Error Display */}
          {errors.comparison && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.comparison}</AlertDescription>
            </Alert>
          )}

          {/* Controls Row */}
          <div className={`grid gap-2 sm:gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"} mb-4`}>
            {/* JSON 1 Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload-1")?.click()}
                      disabled={state.isLoading.json1}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload JSON file</TooltipContent>
                </Tooltip>

                {json1.trim() && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearJson(1)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear content</TooltipContent>
                  </Tooltip>
                )}

                {(!json1.trim() || errors.json1) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowExample1(!showExample1)}>
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show example JSON</TooltipContent>
                  </Tooltip>
                )}

                <h3 className="font-medium text-sm text-center flex-1">{json1DisplayName}</h3>

                {json1.trim() && !errors.json1 && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Valid
                  </Badge>
                )}

                <Dialog
                  open={expandedPanel === "json1"}
                  onOpenChange={(open) => setExpandedPanel(open ? "json1" : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{json1DisplayName} - Full View</DialogTitle>
                    </DialogHeader>
                    <div className="h-[70vh]">
                      <JsonInput
                        target={1}
                        highlightedPath={highlightedPath}
                        showLineNumbers={true}
                        comparisonResult={comparisonResult}
                        side="left"
                        responsiveHeight={responsiveHeight}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {showExample1 && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm">Need help? Try our example JSON format.</span>
                    <Button variant="outline" size="sm" onClick={() => insertExample(1)}>
                      Insert Example
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <input
                id="file-upload-1"
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileUpload(1, e)}
                className="hidden"
              />
            </div>

            {/* JSON 2 Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload-2")?.click()}
                      disabled={state.isLoading.json2}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload JSON file</TooltipContent>
                </Tooltip>

                {json2.trim() && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearJson(2)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear content</TooltipContent>
                  </Tooltip>
                )}

                {(!json2.trim() || errors.json2) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowExample2(!showExample2)}>
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show example JSON</TooltipContent>
                  </Tooltip>
                )}

                <h3 className="font-medium text-sm text-center flex-1">{json2DisplayName}</h3>

                {json2.trim() && !errors.json2 && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Valid
                  </Badge>
                )}

                <Dialog
                  open={expandedPanel === "json2"}
                  onOpenChange={(open) => setExpandedPanel(open ? "json2" : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>{json2DisplayName} - Full View</DialogTitle>
                    </DialogHeader>
                    <div className="h-[70vh]">
                      <JsonInput
                        target={2}
                        highlightedPath={highlightedPath}
                        showLineNumbers={true}
                        comparisonResult={comparisonResult}
                        side="right"
                        responsiveHeight={responsiveHeight}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {showExample2 && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm">Need help? Try our example JSON format.</span>
                    <Button variant="outline" size="sm" onClick={() => insertExample(2)}>
                      Insert Example
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <input
                id="file-upload-2"
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleFileUpload(2, e)}
                className="hidden"
              />
            </div>

            {/* Analysis Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCompare}
                  disabled={!json1.trim() || !json2.trim() || isComparing || !!errors.json1 || !!errors.json2}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {isComparing ? "Comparing..." : "Compare"}
                </Button>

                {/* Navigation Controls */}
                {comparisonResult && comparisonResult.differences.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigatePrev}
                      disabled={currentDiffIndex === 0}
                      className="h-7 w-7 p-0"
                      aria-label="Previous difference"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1 bg-muted/20 rounded px-2 py-1">
                      <input
                        type="number"
                        min="1"
                        max={comparisonResult.differences.length}
                        value={currentDiffIndex + 1}
                        onChange={(e) => {
                          const newIndex = Number.parseInt(e.target.value) - 1
                          if (newIndex >= 0 && newIndex < comparisonResult.differences.length) {
                            handleDiffNavigation(newIndex)
                          }
                        }}
                        className="w-8 text-xs text-center bg-transparent border-0 focus:outline-none focus:ring-0"
                      />
                      <span className="text-xs text-muted-foreground">/{comparisonResult.differences.length}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigateNext}
                      disabled={currentDiffIndex === comparisonResult.differences.length - 1}
                      className="h-7 w-7 p-0"
                      aria-label="Next difference"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <h3 className="font-medium text-sm text-center flex-1">Analysis</h3>

                {comparisonResult && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Export Analysis</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                        <ExportPanel
                          result={comparisonResult}
                          json1={json1}
                          json2={json2}
                          json1Name={json1Name}
                          json2Name={json2Name}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-3 w-3" />
                </Button>

                <Dialog
                  open={expandedPanel === "analysis"}
                  onOpenChange={(open) => setExpandedPanel(open ? "analysis" : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Analysis - Full View</DialogTitle>
                    </DialogHeader>
                    <div className="h-[70vh]">
                      {comparisonResult ? (
                        <AnalysisPanel
                          result={comparisonResult}
                          onHighlightPath={setHighlightedPath}
                          highlightedPath={highlightedPath}
                          onDiffSelect={handleDiffNavigation}
                          currentDiffIndex={currentDiffIndex}
                          fullView={true}
                          json1={json1}
                          json2={json2}
                          onNavigateNext={navigateNext}
                          onNavigatePrev={navigatePrev}
                          responsiveHeight={responsiveHeight}
                          json1Name={json1Name}
                          json2Name={json2Name}
                        />
                      ) : (
                        <Card className="h-full flex items-center justify-center">
                          <div className="text-center p-8">
                            <p className="text-muted-foreground">Compare JSONs to see analysis</p>
                          </div>
                        </Card>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Settings Dialog */}
          <div className="mb-4 flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Comparison Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Comparison Settings</DialogTitle>
                </DialogHeader>
                <SettingsPanel settings={settings} onSettingsChange={setSettings} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content with Uniform Heights */}
          <div className="uniform-panel-container">
            {/* JSON 1 Panel */}
            <JsonInput
              target={1}
              highlightedPath={highlightedPath}
              showLineNumbers={true}
              comparisonResult={comparisonResult}
              side="left"
              responsiveHeight="100%"
              className="h-full"
              hideControls={true}
            />

            {/* JSON 2 Panel */}
            <JsonInput
              target={2}
              highlightedPath={highlightedPath}
              showLineNumbers={true}
              comparisonResult={comparisonResult}
              side="right"
              responsiveHeight="100%"
              className="h-full"
              hideControls={true}
            />

            {/* Analysis Panel */}
            {comparisonResult ? (
              <AnalysisPanel
                result={comparisonResult}
                onHighlightPath={setHighlightedPath}
                highlightedPath={highlightedPath}
                onDiffSelect={handleDiffNavigation}
                currentDiffIndex={currentDiffIndex}
                compact={true}
                json1={json1}
                json2={json2}
                onNavigateNext={navigateNext}
                onNavigatePrev={navigatePrev}
                responsiveHeight="100%"
                className="h-full"
                json1Name={json1Name}
                json2Name={json2Name}
              />
            ) : (
              <Card className="panel h-full flex items-center justify-center tool-card">
                <div className="text-center p-8">
                  <div className="h-12 w-12 mx-auto text-muted-foreground mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                    <Play className="h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground">Compare JSONs to see analysis</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
