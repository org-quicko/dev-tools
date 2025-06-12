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
    if (windowSize.height === 0) return "600px" // Default for SSR or initial render
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
  const getDisplayName = (fileName: string, fallback: string) => fileName || fallback

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
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => cle
