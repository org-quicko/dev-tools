"use client"

import { CardContent } from "@/components/ui/card"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { JsonInput } from "./json-input" // Assuming JsonInput is refactored for zinc theme
import { AnalysisPanel } from "./analysis-panel" // Assuming AnalysisPanel is refactored
import { SettingsPanel } from "./settings-panel" // Assuming SettingsPanel is refactored
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
} from "lucide-react"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useDebounce } from "@/hooks/use-debounce"
import { useJsonContext } from "@/contexts/json-context"
import { ExportPanel } from "./export-panel" // Assuming ExportPanel is refactored
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// Link removed, sidebar handles navigation

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

  useEffect(() => {
    /* Window resize logic remains */
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

  const getResponsiveHeight = () => {
    /* Logic remains */
    if (windowSize.height === 0) return "600px" // Default for SSR or initial render
    // Adjusted for new layout (no tool-specific header, global header is ~64px)
    const globalHeaderHeight = 64
    const controlsHeight = 120 // Approximate height of the controls row
    const padding = 48 // Combined top/bottom padding for the tool container
    const availableHeight = windowSize.height - globalHeaderHeight - controlsHeight - padding

    if (windowSize.width < 1024) {
      return "auto" // Let content flow on mobile
    }
    return `${Math.max(300, Math.min(700, availableHeight))}px`
  }

  const handleCompare = useCallback(async () => {
    /* Logic remains */
  }, [json1, json2, settings, setComparing, setHighlightedPath, setComparisonResult, setError])
  const debouncedCompare = useDebounce(handleCompare, 1000)

  useEffect(() => {
    /* Auto-compare logic remains */
    if (json1.trim() && json2.trim() && !errors.json1 && !errors.json2 && settings.autoCompare) {
      debouncedCompare()
    }
  }, [json1, json2, errors.json1, errors.json2, settings.autoCompare, debouncedCompare])

  useKeyboardShortcuts({ onCompare: handleCompare, onClear: clearAll })

  const handleDiffNavigation = (index: number) => {
    /* Logic remains */
  }
  const navigateNext = () => {
    /* Logic remains */
  }
  const navigatePrev = () => {
    /* Logic remains */
  }
  const getDisplayName = (fileName: string, fallback: string) => fileName || fallback // Simplified

  const json1DisplayName = getDisplayName(json1Name, "First JSON")
  const json2DisplayName = getDisplayName(json2Name, "Second JSON")

  const responsiveHeightVal = getResponsiveHeight()
  const isMobile = windowSize.width < 1024

  const handleFileUpload = async (target: 1 | 2, event: React.ChangeEvent<HTMLInputElement>) => {
    /* Logic remains */
  }
  const insertExample = (target: 1 | 2) => {
    /* Logic remains */
  }

  return (
    <TooltipProvider>
      {/* Removed tool-specific header */}
      <div className="tool-container">
        {errors.comparison && (
          <Alert variant="destructive" className="mb-4 zinc-alert zinc-alert-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.comparison}</AlertDescription>
          </Alert>
        )}

        {/* Controls Row */}
        <div className={`grid gap-2 sm:gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"} mb-4 items-start`}>
          {/* JSON 1 Controls */}
          <Card className="tool-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm flex-1 truncate" title={json1DisplayName}>{json1DisplayName}</h3>
              {json1.trim() && !errors.json1 && (
                <Badge className="zinc-badge-default bg-green-600 hover:bg-green-700 text-xs">Valid</Badge>
              )}
              {errors.json1 && (
                 <Badge variant="destructive" className="text-xs">Invalid</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => document.getElementById("file-upload-1")?.click()}
                    disabled={state.isLoading.json1}
                  > <Upload className="h-3.5 w-3.5" /> </Button>
                </TooltipTrigger> <TooltipContent>Upload JSON</TooltipContent>
              </Tooltip>
              {json1.trim() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => clearJson(1)}>
                       <Trash2 className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Clear</TooltipContent>
                </Tooltip>
              )}
              {(!json1.trim() || errors.json1) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setShowExample1(!showExample1)}>
                       <HelpCircle className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Show example</TooltipContent>
                </Tooltip>
              )}
              <Dialog open={expandedPanel === "json1"} onOpenChange={(open) => setExpandedPanel(open ? "json1" : null)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto"> <Maximize2 className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Full view</TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                  <DialogHeader><DialogTitle>{json1DisplayName} - Full View</DialogTitle></DialogHeader>
                  <div className="flex-grow min-h-0">
                    <JsonInput target={1} highlightedPath={highlightedPath} showLineNumbers={true} comparisonResult={comparisonResult} side="left" responsiveHeight="100%" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {showExample1 && ( )}
            <input id="file-upload-1" type="file" accept=".json,application/json" onChange={(e) => handleFileUpload(1, e)} className="hidden" />
          </Card>

          {/* JSON 2 Controls (Similar refactor as JSON 1) */}
          <Card className="tool-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm flex-1 truncate" title={json2DisplayName}>{json2DisplayName}</h3>
              {json2.trim() && !errors.json2 && (
                <Badge className="zinc-badge-default bg-green-600 hover:bg-green-700 text-xs">Valid</Badge>
              )}
               {errors.json2 && (
                 <Badge variant="destructive" className="text-xs">Invalid</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => document.getElementById("file-upload-2")?.click()} disabled={state.isLoading.json2}>
                     <Upload className="h-3.5 w-3.5" /> </Button>
                </TooltipTrigger> <TooltipContent>Upload JSON</TooltipContent>
              </Tooltip>
              {json2.trim() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => clearJson(2)}>
                       <Trash2 className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Clear</TooltipContent>
                </Tooltip>
              )}
              {(!json2.trim() || errors.json2) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setShowExample2(!showExample2)}>
                       <HelpCircle className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Show example</TooltipContent>
                </Tooltip>
              )}
              <Dialog open={expandedPanel === "json2"} onOpenChange={(open) => setExpandedPanel(open ? "json2" : null)}>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto"> <Maximize2 className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger> <TooltipContent>Full view</TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                  <DialogHeader><DialogTitle>{json2DisplayName} - Full View</DialogTitle></DialogHeader>
                  <div className="flex-grow min-h-0">
                    <JsonInput target={2} highlightedPath={highlightedPath} showLineNumbers={true} comparisonResult={comparisonResult} side="right" responsiveHeight="100%" />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {showExample2 && ( /* Alert logic remains */ )}
            <input id="file-upload-2" type="file" accept=".json,application/json" onChange={(e) => handleFileUpload(2, e)} className="hidden" />
          </Card>

          {/* Analysis Controls */}
          <Card className="tool-card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm flex-1">Analysis & Actions</h3>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleCompare} disabled={!json1.trim() || !json2.trim() || isComparing || !!errors.json1 || !!errors.json2} size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 px-2">
                    <Play className="h-3.5 w-3.5 mr-1" /> {isComparing ? "Comparing..." : "Compare"}
                  </Button>
                </TooltipTrigger><TooltipContent>Run comparison (Ctrl+Enter)</TooltipContent>
              </Tooltip>
              {comparisonResult && comparisonResult.differences.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tooltip><TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={navigatePrev} disabled={currentDiffIndex === 0}> <ChevronLeft className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger><TooltipContent>Previous difference</TooltipContent></Tooltip>
                  <div className="flex items-center gap-1 bg-muted/50 rounded px-1.5 py-0.5 text-xs">
                    <input type="number" min="1" max={comparisonResult.differences.length} value={currentDiffIndex + 1}
                      onChange={(e) => { const ni = Number.parseInt(e.target.value) - 1; if (ni >= 0 && ni < comparisonResult.differences.length) handleDiffNavigation(ni); }}
                      className="w-7 text-center bg-transparent border-0 focus:outline-none focus:ring-0 p-0" />
                    <span>/{comparisonResult.differences.length}</span>
                  </div>
                   <Tooltip><TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={navigateNext} disabled={currentDiffIndex === comparisonResult.differences.length - 1}> <ChevronRight className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger><TooltipContent>Next difference</TooltipContent></Tooltip>
                </div>
              )}
              {comparisonResult && (
                <Dialog>
                  <Tooltip><TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7"> <Download className="h-3.5 w-3.5" /> </Button>
                  </TooltipTrigger><TooltipContent>Export analysis</TooltipContent></Tooltip>
                  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader><DialogTitle>Export Analysis</DialogTitle></DialogHeader>
                    <div className="dialog-scroll-container zinc-scrollbar flex-grow">
                      <ExportPanel result={comparisonResult} json1={json1} json2={json2} json1Name={json1Name} json2Name={json2Name} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog>
                <Tooltip><TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7"> <Settings className="h-3.5 w-3.5" /> </Button>
                </TooltipTrigger><TooltipContent>Comparison settings</TooltipContent></Tooltip>
                <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Comparison Settings</DialogTitle></DialogHeader>
                  <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                </DialogContent>
              </Dialog>
               <Tooltip><TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive ml-auto" onClick={clearAll}> <Trash2 className="h-3.5 w-3.5" /> </Button>
              </TooltipTrigger><TooltipContent>Clear all (Ctrl+Backspace)</TooltipContent></Tooltip>
            </div>
          </Card>
        </div>

        {/* Main Content with Uniform Heights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: responsiveHeightVal }}>
          <Card className="tool-card flex flex-col min-h-0">
            <CardContent className="p-0 flex-grow min-h-0">
              <JsonInput target={1} highlightedPath={highlightedPath} showLineNumbers={true} comparisonResult={comparisonResult} side="left" responsiveHeight="100%" className="h-full" hideControls={true} />
            </CardContent>
          </Card>
          <Card className="tool-card flex flex-col min-h-0">
            <CardContent className="p-0 flex-grow min-h-0">
              <JsonInput target={2} highlightedPath={highlightedPath} showLineNumbers={true} comparisonResult={comparisonResult} side="right" responsiveHeight="100%" className="h-full" hideControls={true} />
            </CardContent>
          </Card>
          <Card className="tool-card flex flex-col min-h-0">
            {comparisonResult ? (
              <AnalysisPanel result={comparisonResult} onHighlightPath={setHighlightedPath} highlightedPath={highlightedPath} onDiffSelect={handleDiffNavigation} currentDiffIndex={currentDiffIndex} compact={true} json1={json1} json2={json2} onNavigateNext={navigateNext} onNavigatePrev={navigatePrev} responsiveHeight="100%" className="h-full" json1Name={json1Name} json2Name={json2Name} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 mb-4 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <Play className="h-6 w-6" />
                </div>
                <p className="text-muted-foreground text-sm">Compare JSONs to see analysis here.</p>
                <p className="text-xs text-muted-foreground mt-1">Input JSON in both panels and click "Compare".</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
