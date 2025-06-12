"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  GitCompare,
  Upload,
  Copy,
  Trash2,
  Settings2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Info,
  Search,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { JsonInput } from "@/components/json-input"
import {
  compareJsons,
  type JsonComparisonResult as LibComparisonResult,
  type Difference as LibDifference,
  type ComparisonOptions as LibComparisonOptions,
} from "@/lib/json-compare"
import { useDebounce } from "@/hooks/use-debounce"
import type {
  JsonComparisonResult as TypesComparisonResult,
  JsonDifference as TypesJsonDifference,
} from "@/types/comparison" // For JsonInput prop

// Helper to adapt LibDifference to TypesJsonDifference for JsonInput's comparisonResult prop
const adaptDifferencesForJsonInput = (libDiffs: LibDifference[]): TypesJsonDifference[] => {
  return libDiffs.map((diff) => ({
    type: diff.type === "none" ? "modification" : diff.type, // JsonInput might not handle 'none' type for color
    path: diff.path,
    leftLine: diff.leftLine,
    rightLine: diff.rightLine,
    oldValue: diff.leftValue,
    newValue: diff.rightValue,
  }))
}

export function JsonComparator() {
  const [json1, setJson1] = useState("")
  const [json1Name, setJson1Name] = useState("JSON 1")
  const [json1Error, setJson1Error] = useState<string | undefined>(undefined)
  const [json1Loading, setJson1Loading] = useState(false)

  const [json2, setJson2] = useState("")
  const [json2Name, setJson2Name] = useState("JSON 2")
  const [json2Error, setJson2Error] = useState<string | undefined>(undefined)
  const [json2Loading, setJson2Loading] = useState(false)

  const [comparisonResult, setComparisonResult] = useState<LibComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [realTimeCompare, setRealTimeCompare] = useState(true)
  const [comparisonOptions, setComparisonOptions] = useState<LibComparisonOptions>({
    ignoreArrayOrder: false,
    ignoreCase: false,
    // Add other options from lib/json-compare as needed
  })
  const [expandedDiffs, setExpandedDiffs] = useState<Set<string>>(new Set()) // Use path for key
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null)

  const debouncedJson1 = useDebounce(json1, 500)
  const debouncedJson2 = useDebounce(json2, 500)

  const performComparison = useCallback(async () => {
    if (!json1.trim() && !json2.trim()) {
      setComparisonResult(null)
      setJson1Error(undefined)
      setJson2Error(undefined)
      return
    }
    setIsComparing(true)
    // Simulate async for loading state if compareJsons is synchronous
    await new Promise((resolve) => setTimeout(resolve, 50))
    try {
      const result = compareJsons(json1, json2, comparisonOptions)
      setComparisonResult(result)
      setJson1Error(result.errors.json1)
      setJson2Error(result.errors.json2)
    } catch (err) {
      console.error("Comparison error:", err)
      const errorMsg = "Error during comparison. Check JSON syntax or tool console."
      setJson1Error(errorMsg)
      setJson2Error(errorMsg)
      setComparisonResult(null)
    } finally {
      setIsComparing(false)
    }
  }, [json1, json2, comparisonOptions])

  useEffect(() => {
    if (realTimeCompare) {
      performComparison()
    }
  }, [debouncedJson1, debouncedJson2, realTimeCompare, performComparison]) // Use debounced values

  const handleJson1Change = (value: string, fileName?: string) => {
    setJson1(value)
    if (fileName) setJson1Name(fileName)
    setJson1Error(undefined) // Clear error on change
  }

  const handleJson2Change = (value: string, fileName?: string) => {
    setJson2(value)
    if (fileName) setJson2Name(fileName)
    setJson2Error(undefined) // Clear error on change
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: "json1" | "json2") => {
    const file = event.target.files?.[0]
    if (!file) return

    const setLoading = target === "json1" ? setJson1Loading : setJson2Loading
    setLoading(true)

    try {
      const content = await file.text()
      if (target === "json1") {
        handleJson1Change(content, file.name)
      } else {
        handleJson2Change(content, file.name)
      }
    } catch (err) {
      const setError = target === "json1" ? setJson1Error : setJson2Error
      setError("Failed to read file.")
    } finally {
      setLoading(false)
      event.target.value = "" // Reset file input
    }
  }

  const handleClearAll = () => {
    setJson1("")
    setJson2("")
    setJson1Name("JSON 1")
    setJson2Name("JSON 2")
    setJson1Error(undefined)
    setJson2Error(undefined)
    setComparisonResult(null)
    setExpandedDiffs(new Set())
    setHighlightedPath(null)
  }

  const toggleDiffExpansion = (path: string) => {
    setExpandedDiffs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) newSet.delete(path)
      else newSet.add(path)
      return newSet
    })
    setHighlightedPath(path)
  }

  const summary = useMemo(() => {
    if (!comparisonResult || !comparisonResult.differences)
      return { additions: 0, deletions: 0, modifications: 0, total: 0 }
    const additions = comparisonResult.differences.filter((d) => d.type === "addition").length
    const deletions = comparisonResult.differences.filter((d) => d.type === "deletion").length
    const modifications = comparisonResult.differences.filter((d) => d.type === "modification").length
    return { additions, deletions, modifications, total: additions + deletions + modifications }
  }, [comparisonResult])

  const jsonInputComparisonResultProp = useMemo((): TypesComparisonResult | undefined => {
    if (!comparisonResult) return undefined
    return {
      differences: adaptDifferencesForJsonInput(comparisonResult.differences),
      summary: {
        // This summary is for the JsonInput prop, if it uses it.
        additions: summary.additions,
        deletions: summary.deletions,
        modifications: summary.modifications,
        unchanged: 0, // Calculate if needed, or remove if JsonInput doesn't use summary
      },
    }
  }, [comparisonResult, summary])

  const renderJsonInputCard = (
    id: "json1" | "json2",
    title: string,
    value: string,
    onChange: (val: string, fName?: string) => void,
    error?: string,
    isLoading?: boolean,
    fileName?: string,
  ) => (
    <Card className="flex flex-col h-full tool-card">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileJson className="h-5 w-5 text-muted-foreground" /> {fileName || title}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigator.clipboard.writeText(value)}
                  disabled={!value}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Label
                    htmlFor={`${id}-file-upload`}
                    className="cursor-pointer inline-flex items-center justify-center"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Label>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload</TooltipContent>
            </Tooltip>
            <input
              type="file"
              id={`${id}-file-upload`}
              accept=".json"
              className="hidden"
              onChange={(e) => handleFileUpload(e, id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow relative">
        <JsonInput
          value={value}
          onValueChange={onChange}
          errorText={error}
          isLoading={isLoading}
          placeholder={`Paste ${title} here or drop a file...`}
          showLineNumbers={true}
          comparisonResult={jsonInputComparisonResultProp}
          side={id === "json1" ? "left" : "right"}
          highlightedPath={highlightedPath}
          responsiveHeight="100%"
          className="h-full"
          textAreaClassName="p-3"
        />
      </CardContent>
    </Card>
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-2rem)] gap-4 p-4 tool-container">
        {" "}
        {/* Adjust header height var */}
        {/* Controls Bar */}
        <Card className="tool-card shrink-0">
          <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={performComparison}
                disabled={isComparing || !!json1Error || !!json2Error}
                className="bg-primary hover:bg-primary/90 h-9"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                {isComparing ? "Comparing..." : "Compare"}
              </Button>
              <div className="flex items-center gap-2">
                <Switch id="realtime-compare" checked={realTimeCompare} onCheckedChange={setRealTimeCompare} />
                <Label htmlFor="realtime-compare" className="text-sm">
                  Real-time
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DialogSettings options={comparisonOptions} onOptionsChange={setComparisonOptions} />
              <Button variant="outline" onClick={handleClearAll} className="h-9">
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
          {renderJsonInputCard("json1", "JSON 1", json1, handleJson1Change, json1Error, json1Loading, json1Name)}
          {renderJsonInputCard("json2", "JSON 2", json2, handleJson2Change, json2Error, json2Loading, json2Name)}

          {/* Results Panel */}
          <Card className="tool-card flex flex-col h-full">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" /> Comparison Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-grow overflow-hidden">
              {!comparisonResult && !isComparing && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Info className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Input JSON in both panels and click "Compare".</p>
                  <p className="text-xs text-muted-foreground mt-1">Or enable real-time comparison.</p>
                </div>
              )}
              {isComparing && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <GitCompare className="h-12 w-12 text-primary animate-pulse mb-3" />
                  <p className="text-sm text-primary">Comparing...</p>
                </div>
              )}
              {comparisonResult && !isComparing && (
                <div className="h-full flex flex-col">
                  <div className="shrink-0 mb-3 p-3 bg-muted/50 rounded-md">
                    {comparisonResult.areEqual ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">JSON objects are identical.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">Differences found.</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="text-center">
                        <span className="font-bold">{summary.modifications}</span> Mod.
                      </div>
                      <div className="text-center">
                        <span className="font-bold">{summary.additions}</span> Add.
                      </div>
                      <div className="text-center">
                        <span className="font-bold">{summary.deletions}</span> Del.
                      </div>
                    </div>
                  </div>
                  {summary.total > 0 ? (
                    <ScrollArea className="flex-grow zinc-scrollbar pr-1">
                      <div className="space-y-1.5">
                        {comparisonResult.differences.map((diff, index) => (
                          <Collapsible
                            key={`${diff.path}-${index}`}
                            open={expandedDiffs.has(diff.path)}
                            onOpenChange={() => toggleDiffExpansion(diff.path)}
                          >
                            <CollapsibleTrigger
                              className={cn(
                                "w-full text-left p-2 rounded-md hover:bg-accent transition-colors border flex items-center justify-between",
                                highlightedPath === diff.path && "bg-accent ring-1 ring-primary",
                              )}
                            >
                              <div className="flex items-center gap-2 text-xs truncate">
                                <DiffTypeIcon type={diff.type} />
                                <span className="font-mono truncate" title={diff.path || "Root"}>
                                  {diff.path || "Root"}
                                </span>
                              </div>
                              {expandedDiffs.has(diff.path) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-2.5 text-xs border border-t-0 rounded-b-md bg-background">
                              <p className="font-medium mb-1 capitalize">
                                {diff.type} at <span className="font-mono">{diff.path || "Root"}</span>
                              </p>
                              {diff.message && <p className="text-muted-foreground mb-1.5">{diff.message}</p>}
                              {diff.type === "modification" && (
                                <>
                                  <div className="mb-1">
                                    <span className="font-semibold">{json1Name}:</span>{" "}
                                    <pre className="inline bg-muted p-0.5 rounded text-xs">
                                      {JSON.stringify(diff.leftValue)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="font-semibold">{json2Name}:</span>{" "}
                                    <pre className="inline bg-muted p-0.5 rounded text-xs">
                                      {JSON.stringify(diff.rightValue)}
                                    </pre>
                                  </div>
                                </>
                              )}
                              {diff.type === "addition" && (
                                <div>
                                  <span className="font-semibold">Added in {json2Name}:</span>{" "}
                                  <pre className="inline bg-muted p-0.5 rounded text-xs">
                                    {JSON.stringify(diff.rightValue)}
                                  </pre>
                                </div>
                              )}
                              {diff.type === "deletion" && (
                                <div>
                                  <span className="font-semibold">Removed from {json1Name}:</span>{" "}
                                  <pre className="inline bg-muted p-0.5 rounded text-xs">
                                    {JSON.stringify(diff.leftValue)}
                                  </pre>
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Helper component for settings dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

function DialogSettings({
  options,
  onOptionsChange,
}: { options: LibComparisonOptions; onOptionsChange: (opts: LibComparisonOptions) => void }) {
  const [currentOptions, setCurrentOptions] = useState(options)

  useEffect(() => {
    setCurrentOptions(options)
  }, [options])

  const handleChange = (optionKey: keyof LibComparisonOptions, value: boolean) => {
    setCurrentOptions((prev) => ({ ...prev, [optionKey]: value }))
  }

  const handleApply = () => {
    onOptionsChange(currentOptions)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9">
          <Settings2 className="h-4 w-4 mr-2" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comparison Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ignoreArrayOrder" className="text-sm">
              Ignore Array Order
            </Label>
            <Switch
              id="ignoreArrayOrder"
              checked={currentOptions.ignoreArrayOrder}
              onCheckedChange={(c) => handleChange("ignoreArrayOrder", c)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="ignoreCase" className="text-sm">
              Ignore Case (for string values)
            </Label>
            <Switch
              id="ignoreCase"
              checked={currentOptions.ignoreCase}
              onCheckedChange={(c) => handleChange("ignoreCase", c)}
            />
          </div>
          {/* Add more options from LibComparisonOptions here */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleApply}>
              Apply
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper for diff type icon
function DiffTypeIcon({ type }: { type: LibDifference["type"] }) {
  switch (type) {
    case "addition":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "deletion":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "modification":
      return <GitCompare className="h-4 w-4 text-blue-500" />
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />
  }
}

import { cn } from "@/lib/utils"
