"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Sparkles,
  Download,
  RotateCcw,
  Zap,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { JsonInput } from "@/components/json-input"
import { compareJsons, type ComparisonSettings } from "@/lib/json-compare"
import { prettifyJson } from "@/lib/json-utils"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

// Types for our component
interface JsonComparisonResult {
  differences: Array<{
    type: "addition" | "deletion" | "modification"
    path: string
    leftLine?: number
    rightLine?: number
    oldValue?: any
    newValue?: any
    message?: string
  }>
  summary: {
    additions: number
    deletions: number
    modifications: number
    unchanged: number
  }
  areEqual: boolean
  errors?: {
    json1?: string
    json2?: string
  }
}

// Preset examples for users
const PRESET_EXAMPLES = {
  basic: {
    name: "Basic Comparison",
    json1: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "coding"],
  "isActive": true
}`,
    json2: `{
  "name": "Jane Doe",
  "age": 31,
  "city": "New York",
  "hobbies": ["reading", "hiking", "coding"],
  "isActive": false,
  "email": "jane@example.com"
}`,
  },
  arrays: {
    name: "Array Order Test",
    json1: `{
  "fruits": ["apple", "banana", "cherry"],
  "numbers": [1, 2, 3],
  "mixed": [true, "text", 42]
}`,
    json2: `{
  "fruits": ["cherry", "apple", "banana"],
  "numbers": [3, 1, 2],
  "mixed": [42, true, "text"]
}`,
  },
  nested: {
    name: "Nested Objects",
    json1: `{
  "user": {
    "profile": {
      "name": "Alice",
      "settings": {
        "theme": "dark",
        "notifications": true
      }
    },
    "permissions": ["read", "write"]
  }
}`,
    json2: `{
  "user": {
    "profile": {
      "name": "Alice Smith",
      "settings": {
        "theme": "light",
        "notifications": true,
        "language": "en"
      }
    },
    "permissions": ["read", "write", "admin"]
  }
}`,
  },
  fuzzy: {
    name: "Fuzzy Matching Test",
    json1: `{
  "message": "Hello World!",
  "description": "This is a test message",
  "status": "ACTIVE"
}`,
    json2: `{
  "message": "hello world",
  "description": "This is a test message.",
  "status": "active"
}`,
  },
}

export function JsonComparator() {
  // JSON state
  const [json1, setJson1] = useState("")
  const [json1Name, setJson1Name] = useState("JSON 1")
  const [json1Error, setJson1Error] = useState<string | undefined>(undefined)
  const [json1Loading, setJson1Loading] = useState(false)

  const [json2, setJson2] = useState("")
  const [json2Name, setJson2Name] = useState("JSON 2")
  const [json2Error, setJson2Error] = useState<string | undefined>(undefined)
  const [json2Loading, setJson2Loading] = useState(false)

  // Comparison state
  const [comparisonResult, setComparisonResult] = useState<JsonComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [realTimeCompare, setRealTimeCompare] = useState(true)

  // Settings state
  const [settings, setSettings] = useState<ComparisonSettings>({
    indentation: 2,
    sortKeys: false,
    ignoreOrder: false,
    fuzzyMatch: false,
    ignoreCase: false,
  })

  // UI state
  const [expandedDiffs, setExpandedDiffs] = useState<Set<string>>(new Set())
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("compare")

  const debouncedJson1 = useDebounce(json1, 500)
  const debouncedJson2 = useDebounce(json2, 500)

  const performComparison = useCallback(async () => {
    // Handle single JSON input scenarios
    if (!json1.trim() && !json2.trim()) {
      setComparisonResult(null)
      setJson1Error(undefined)
      setJson2Error(undefined)
      return
    }

    if (!json1.trim()) {
      setJson1Error("JSON 1 is required for comparison")
      setComparisonResult(null)
      return
    }

    if (!json2.trim()) {
      setJson2Error("JSON 2 is required for comparison")
      setComparisonResult(null)
      return
    }

    setIsComparing(true)
    await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay for UX

    try {
      const result = await compareJsons(json1, json2, settings)
      setComparisonResult(result)
      setJson1Error(result.errors?.json1)
      setJson2Error(result.errors?.json2)
    } catch (err) {
      console.error("Comparison error:", err)
      const errorMsg = "Error during comparison. Please check JSON syntax."
      setJson1Error(errorMsg)
      setJson2Error(errorMsg)
      setComparisonResult(null)
    } finally {
      setIsComparing(false)
    }
  }, [json1, json2, settings])

  useEffect(() => {
    if (realTimeCompare) {
      performComparison()
    }
  }, [debouncedJson1, debouncedJson2, realTimeCompare, performComparison])

  const handleJson1Change = (value: string, fileName?: string) => {
    setJson1(value)
    if (fileName) setJson1Name(fileName)
    setJson1Error(undefined)
  }

  const handleJson2Change = (value: string, fileName?: string) => {
    setJson2(value)
    if (fileName) setJson2Name(fileName)
    setJson2Error(undefined)
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
      event.target.value = ""
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

  const handleFormatJson = (target: "json1" | "json2") => {
    try {
      const jsonToFormat = target === "json1" ? json1 : json2
      const formatted = prettifyJson(jsonToFormat, settings)
      if (target === "json1") {
        setJson1(formatted)
      } else {
        setJson2(formatted)
      }
    } catch (err) {
      const setError = target === "json1" ? setJson1Error : setJson2Error
      setError("Invalid JSON: Cannot format")
    }
  }

  const handleDownload = (target: "json1" | "json2") => {
    const jsonToDownload = target === "json1" ? json1 : json2
    const fileName = target === "json1" ? json1Name : json2Name
    if (!jsonToDownload) return

    const blob = new Blob([jsonToDownload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadPreset = (presetKey: keyof typeof PRESET_EXAMPLES) => {
    const preset = PRESET_EXAMPLES[presetKey]
    setJson1(preset.json1)
    setJson2(preset.json2)
    setJson1Name(`${preset.name} - JSON 1`)
    setJson2Name(`${preset.name} - JSON 2`)
    setJson1Error(undefined)
    setJson2Error(undefined)
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
    if (!comparisonResult?.summary) return { additions: 0, deletions: 0, modifications: 0, total: 0 }
    const { additions, deletions, modifications } = comparisonResult.summary
    return { additions, deletions, modifications, total: additions + deletions + modifications }
  }, [comparisonResult])

  const jsonInputComparisonResultProp = useMemo(() => {
    if (!comparisonResult) return undefined
    return {
      differences: comparisonResult.differences,
      summary: comparisonResult.summary,
    }
  }, [comparisonResult])

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
            <FileJson className="h-5 w-5 text-muted-foreground" />
            <span className="truncate">{fileName || title}</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleFormatJson(id)}
                  disabled={!value || !!error}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Format JSON</TooltipContent>
            </Tooltip>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDownload(id)}
                  disabled={!value}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
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
      <div className="flex flex-col h-[calc(100vh-120px)] gap-4 p-4 tool-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="shrink-0">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <GitCompare className="h-4 w-4" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Actions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="compare" className="flex-grow flex flex-col gap-4 mt-4">
            {/* Controls Bar */}
            <Card className="tool-card shrink-0">
              <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={performComparison}
                    disabled={isComparing || (!json1.trim() && !json2.trim())}
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
                      <p className="text-sm text-muted-foreground">Input JSON in both panels to compare.</p>
                      <p className="text-xs text-muted-foreground mt-1">Or enable real-time comparison.</p>
                    </div>
                  )}
                  {isComparing && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <GitCompare className="h-12 w-12 text-primary animate-pulse mb-3" />
                      <p className="text-sm text-primary">Comparing JSON objects...</p>
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
                            <span className="font-medium text-sm">{summary.total} differences found.</span>
                          </div>
                        )}
                        <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                          <div className="text-center">
                            <span className="font-bold text-blue-600">{summary.modifications}</span>
                            <div className="text-muted-foreground">Modified</div>
                          </div>
                          <div className="text-center">
                            <span className="font-bold text-green-600">{summary.additions}</span>
                            <div className="text-muted-foreground">Added</div>
                          </div>
                          <div className="text-center">
                            <span className="font-bold text-red-600">{summary.deletions}</span>
                            <div className="text-muted-foreground">Deleted</div>
                          </div>
                          <div className="text-center">
                            <span className="font-bold text-gray-600">{comparisonResult.summary.unchanged}</span>
                            <div className="text-muted-foreground">Unchanged</div>
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
                                          {JSON.stringify(diff.oldValue)}
                                        </pre>
                                      </div>
                                      <div>
                                        <span className="font-semibold">{json2Name}:</span>{" "}
                                        <pre className="inline bg-muted p-0.5 rounded text-xs">
                                          {JSON.stringify(diff.newValue)}
                                        </pre>
                                      </div>
                                    </>
                                  )}
                                  {diff.type === "addition" && (
                                    <div>
                                      <span className="font-semibold">Added in {json2Name}:</span>{" "}
                                      <pre className="inline bg-muted p-0.5 rounded text-xs">
                                        {JSON.stringify(diff.newValue)}
                                      </pre>
                                    </div>
                                  )}
                                  {diff.type === "deletion" && (
                                    <div>
                                      <span className="font-semibold">Removed from {json1Name}:</span>{" "}
                                      <pre className="inline bg-muted p-0.5 rounded text-xs">
                                        {JSON.stringify(diff.oldValue)}
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
          </TabsContent>

          <TabsContent value="settings" className="flex-grow mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="text-lg">Formatting Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="indentation">Indentation</Label>
                    <Select
                      value={settings.indentation.toString()}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, indentation: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 spaces</SelectItem>
                        <SelectItem value="4">4 spaces</SelectItem>
                        <SelectItem value="8">8 spaces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sort-keys">Sort Keys Alphabetically</Label>
                    <Switch
                      id="sort-keys"
                      checked={settings.sortKeys}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, sortKeys: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="text-lg">Comparison Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="ignore-order">Ignore Array Order</Label>
                      <p className="text-sm text-muted-foreground">Compare arrays by content, not position</p>
                    </div>
                    <Switch
                      id="ignore-order"
                      checked={settings.ignoreOrder}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, ignoreOrder: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="fuzzy-match">Fuzzy String Matching</Label>
                      <p className="text-sm text-muted-foreground">Match similar strings with minor differences</p>
                    </div>
                    <Switch
                      id="fuzzy-match"
                      checked={settings.fuzzyMatch}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, fuzzyMatch: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="ignore-case">Ignore Case</Label>
                      <p className="text-sm text-muted-foreground">Case-insensitive string comparison</p>
                    </div>
                    <Switch
                      id="ignore-case"
                      checked={settings.ignoreCase}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, ignoreCase: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4">
              <Button onClick={performComparison} className="w-full">
                <GitCompare className="h-4 w-4 mr-2" /> Apply Settings & Re-compare
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="flex-grow mt-4">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="text-lg">Example Presets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Load predefined JSON examples to test different comparison scenarios.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(PRESET_EXAMPLES).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => loadPreset(key as keyof typeof PRESET_EXAMPLES)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {key === "basic" && "Simple object comparison with basic differences"}
                        {key === "arrays" && "Test array order comparison settings"}
                        {key === "nested" && "Complex nested object structures"}
                        {key === "fuzzy" && "Test fuzzy string matching capabilities"}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="flex-grow mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleFormatJson("json1")}
                    disabled={!json1 || !!json1Error}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Format JSON 1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleFormatJson("json2")}
                    disabled={!json2 || !!json2Error}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Format JSON 2
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setSettings({
                        indentation: 2,
                        sortKeys: false,
                        ignoreOrder: false,
                        fuzzyMatch: false,
                        ignoreCase: false,
                      })
                    }
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="text-lg">Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleDownload("json1")}
                    disabled={!json1}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON 1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleDownload("json2")}
                    disabled={!json2}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download JSON 2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      if (comparisonResult) {
                        const report = JSON.stringify(comparisonResult, null, 2)
                        const blob = new Blob([report], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "comparison-report.json"
                        a.click()
                        URL.revokeObjectURL(url)
                      }
                    }}
                    disabled={!comparisonResult}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Comparison Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

// Helper for diff type icon
function DiffTypeIcon({ type }: { type: "addition" | "deletion" | "modification" }) {
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
