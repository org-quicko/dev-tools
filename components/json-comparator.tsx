"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  GitCompare,
  Upload,
  Copy,
  Download,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Sparkles,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { JsonInput } from "@/components/json-input"
import { useJsonContext } from "@/contexts/json-context"
import { compareJsons, type JsonComparisonResult, type Difference } from "@/lib/json-compare" // Corrected import
import { formatJsonError, validateJson } from "@/lib/json-validation"
import { useDebounce } from "@/hooks/use-debounce"

export function JsonComparator() {
  const { state, setJson, setError, clearAll } = useJsonContext()
  const [comparisonResult, setComparisonResult] = useState<JsonComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [realTimeCompare, setRealTimeCompare] = useState(true)
  const [comparisonOptions, setComparisonOptions] = useState({
    ignoreOrder: false,
    ignoreWhitespace: false,
    ignoreCase: false,
    ignoreValues: false,
  })
  const [activeTab, setActiveTab] = useState("compare")
  const [expandedDiffs, setExpandedDiffs] = new Set<number>(new Set())
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null)

  const debouncedJson1 = useDebounce(state.json1, 500)
  const debouncedJson2 = useDebounce(state.json2, 500)

  const performComparison = useCallback(() => {
    if (!debouncedJson1.trim() && !debouncedJson2.trim()) {
      setComparisonResult(null)
      return
    }

    setIsComparing(true)
    try {
      const result = compareJsons(debouncedJson1, debouncedJson2, comparisonOptions) // Corrected function call
      setComparisonResult(result)
      setError("json1", result.errors.json1 || undefined)
      setError("json2", result.errors.json2 || undefined)
    } catch (err) {
      console.error("Comparison error:", err)
      setError("json1", "Error during comparison. Please check JSON syntax.")
      setError("json2", "Error during comparison. Please check JSON syntax.")
      setComparisonResult(null)
    } finally {
      setIsComparing(false)
    }
  }, [debouncedJson1, debouncedJson2, comparisonOptions, setError])

  useEffect(() => {
    if (realTimeCompare) {
      performComparison()
    }
  }, [debouncedJson1, debouncedJson2, realTimeCompare, performComparison])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 1 | 2) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })

      const validationResult = validateJson(content)
      if (!validationResult.isValid && validationResult.error) {
        const formattedError = formatJsonError(
          validationResult.error,
          validationResult.lineNumber,
          validationResult.columnNumber,
        )
        setError(target === 1 ? "json1" : "json2", formattedError)
      } else {
        setError(target === 1 ? "json1" : "json2", undefined)
      }

      setJson(target, content, file.name)
    } catch (err) {
      setError(target === 1 ? "json1" : "json2", "Failed to read file. Please try again.")
    }
    event.target.value = ""
  }

  const handleClear = () => {
    clearAll()
    setComparisonResult(null)
    setExpandedDiffs(new Set())
    setHighlightedPath(null)
  }

  const handleCopy = (target: 1 | 2) => {
    const textToCopy = target === 1 ? state.json1 : state.json2
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
    }
  }

  const handleDownload = (target: 1 | 2) => {
    const jsonToDownload = target === 1 ? state.json1 : state.json2
    const fileName = target === 1 ? state.json1Name : state.json2Name
    if (!jsonToDownload) return

    const blob = new Blob([jsonToDownload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName || `json-${target}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleDiffExpansion = (index: number) => {
    setExpandedDiffs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleDiffClick = (diff: Difference) => {
    setHighlightedPath(diff.path)
    // Optionally scroll to the diff in the input panels
  }

  const insertExample = (target: 1 | 2) => {
    const example1 = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "coding"],
  "isActive": true
}`
    const example2 = `{
  "name": "Jane Doe",
  "age": 31,
  "city": "New York",
  "hobbies": ["reading", "hiking", "coding"],
  "isActive": false,
  "email": "jane@example.com"
}`
    setJson(target, target === 1 ? example1 : example2, `example-${target}.json`)
  }

  return (
    <TooltipProvider>
      <div className="tool-container space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="compare" className="flex items-center gap-2 text-xs sm:text-sm">
              <GitCompare className="h-4 w-4" /> Compare
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" /> Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compare" className="space-y-6">
            <Card className="tool-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GitCompare className="h-5 w-5" /> Comparison Controls
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="real-time-compare" checked={realTimeCompare} onCheckedChange={setRealTimeCompare} />
                      <Label htmlFor="real-time-compare" className="text-xs whitespace-nowrap">
                        Real-time
                      </Label>
                    </div>
                    <Button onClick={performComparison} disabled={isComparing} size="sm" className="h-9 text-xs">
                      {isComparing ? (
                        <GitCompare className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <GitCompare className="h-4 w-4 mr-1" />
                      )}{" "}
                      Compare Now
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClear} className="h-9 text-xs">
                      <Trash2 className="h-4 w-4 mr-1" /> Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card className="tool-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileJson className="h-5 w-5" /> JSON 1
                        {state.json1Name && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {state.json1Name}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(1)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy JSON 1</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownload(1)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download JSON 1</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                              <label
                                htmlFor="json1-upload"
                                className="cursor-pointer flex items-center justify-center h-full w-full"
                              >
                                <Upload className="h-4 w-4" />
                                <input
                                  id="json1-upload"
                                  type="file"
                                  accept=".json"
                                  onChange={(e) => handleFileUpload(e, 1)}
                                  className="hidden"
                                />
                              </label>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Upload JSON 1</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <JsonInput
                      target={1}
                      placeholder="Paste your first JSON here..."
                      showLineNumbers={true}
                      comparisonResult={comparisonResult}
                      side="left"
                      responsiveHeight="auto"
                    />
                    {!state.json1 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => insertExample(1)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Insert Example JSON 1
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="tool-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileJson className="h-5 w-5" /> JSON 2
                        {state.json2Name && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {state.json2Name}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(2)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy JSON 2</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDownload(2)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download JSON 2</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                              <label
                                htmlFor="json2-upload"
                                className="cursor-pointer flex items-center justify-center h-full w-full"
                              >
                                <Upload className="h-4 w-4" />
                                <input
                                  id="json2-upload"
                                  type="file"
                                  accept=".json"
                                  onChange={(e) => handleFileUpload(e, 2)}
                                  className="hidden"
                                />
                              </label>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Upload JSON 2</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <JsonInput
                      target={2}
                      placeholder="Paste your second JSON here..."
                      showLineNumbers={true}
                      comparisonResult={comparisonResult}
                      side="right"
                      responsiveHeight="auto"
                    />
                    {!state.json2 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => insertExample(2)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Insert Example JSON 2
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {comparisonResult && (
              <Card className="tool-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {comparisonResult.areEqual ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      Comparison Results
                    </CardTitle>
                    <Badge
                      variant={comparisonResult.areEqual ? "default" : "destructive"}
                      className={`text-xs ${comparisonResult.areEqual ? "zinc-status-success" : "zinc-status-error"}`}
                    >
                      {comparisonResult.areEqual ? "Identical" : "Differences Found"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="text-xl font-bold text-blue-600">
                        {comparisonResult.differences.filter((d) => d.type === "modification").length}
                      </div>
                      <div className="text-muted-foreground">Modifications</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="text-xl font-bold text-green-600">
                        {comparisonResult.differences.filter((d) => d.type === "addition").length}
                      </div>
                      <div className="text-muted-foreground">Additions</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="text-xl font-bold text-red-600">
                        {comparisonResult.differences.filter((d) => d.type === "deletion").length}
                      </div>
                      <div className="text-muted-foreground">Deletions</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-md">
                      <div className="text-xl font-bold">{comparisonResult.differences.length}</div>
                      <div className="text-muted-foreground">Total Differences</div>
                    </div>
                  </div>

                  {comparisonResult.differences.length > 0 ? (
                    <ScrollArea className="h-96 zinc-scrollbar">
                      <div className="space-y-2 pr-2">
                        {comparisonResult.differences.map((diff, index) => (
                          <Collapsible key={index}>
                            <div
                              className={`border rounded-md p-3 ${
                                highlightedPath === diff.path ? "ring-2 ring-yellow-500" : ""
                              }`}
                            >
                              <CollapsibleTrigger
                                className="flex items-center justify-between w-full text-left text-xs hover:bg-muted/20 p-1 rounded-sm"
                                onClick={() => toggleDiffExpansion(index)}
                              >
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                  {diff.type === "addition" && (
                                    <span className="text-green-500">
                                      <CheckCircle className="h-4 w-4" />
                                    </span>
                                  )}
                                  {diff.type === "deletion" && (
                                    <span className="text-red-500">
                                      <AlertCircle className="h-4 w-4" />
                                    </span>
                                  )}
                                  {diff.type === "modification" && (
                                    <span className="text-blue-500">
                                      <GitCompare className="h-4 w-4" />
                                    </span>
                                  )}
                                  <div className="flex-1 truncate">
                                    <div className="font-medium truncate" title={diff.path}>
                                      {diff.path || "Root"}
                                    </div>
                                    <div className="text-muted-foreground truncate">{diff.message}</div>
                                  </div>
                                  <Badge
                                    className={`text-xs px-1.5 py-0.5 ${
                                      diff.type === "addition"
                                        ? "zinc-status-success"
                                        : diff.type === "deletion"
                                          ? "zinc-status-error"
                                          : "zinc-status-info"
                                    }`}
                                  >
                                    {diff.type.charAt(0).toUpperCase() + diff.type.slice(1)}
                                  </Badge>
                                </div>
                                {expandedDiffs.has(index) ? (
                                  <ChevronDown className="h-3.5 w-3.5 ml-1 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 ml-1 flex-shrink-0" />
                                )}
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 pt-2 border-t text-xs">
                                <div className="space-y-2">
                                  {diff.leftValue !== undefined && (
                                    <div>
                                      <div className="font-medium">JSON 1 Value:</div>
                                      <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                        {JSON.stringify(diff.leftValue)}
                                      </div>
                                    </div>
                                  )}
                                  {diff.rightValue !== undefined && (
                                    <div>
                                      <div className="font-medium">JSON 2 Value:</div>
                                      <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                        {JSON.stringify(diff.rightValue)}
                                      </div>
                                    </div>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => handleDiffClick(diff)}
                                  >
                                    Highlight in Inputs
                                  </Button>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No differences found. The JSON objects are identical.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" /> Comparison Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-order">Ignore Array Order</Label>
                    <Switch
                      id="ignore-order"
                      checked={comparisonOptions.ignoreOrder}
                      onCheckedChange={(c) => setComparisonOptions((o) => ({ ...o, ignoreOrder: c }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-whitespace">Ignore Whitespace</Label>
                    <Switch
                      id="ignore-whitespace"
                      checked={comparisonOptions.ignoreWhitespace}
                      onCheckedChange={(c) => setComparisonOptions((o) => ({ ...o, ignoreWhitespace: c }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-case">Ignore Case</Label>
                    <Switch
                      id="ignore-case"
                      checked={comparisonOptions.ignoreCase}
                      onCheckedChange={(c) => setComparisonOptions((o) => ({ ...o, ignoreCase: c }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-values">Ignore Values (Compare Structure Only)</Label>
                    <Switch
                      id="ignore-values"
                      checked={comparisonOptions.ignoreValues}
                      onCheckedChange={(c) => setComparisonOptions((o) => ({ ...o, ignoreValues: c }))}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button onClick={performComparison} className="w-full h-9 text-xs">
                    <GitCompare className="h-4 w-4 mr-1" /> Apply Settings & Re-compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => insertExample(1)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Insert Example JSON 1
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => insertExample(2)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Insert Example JSON 2
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
