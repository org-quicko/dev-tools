"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  GitCompare,
  Settings2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Info,
  Sparkles,
  Download,
  RotateCcw,
  Zap,
  Trash2,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToolLayoutShell, ToolGrid, ToolEmptyState, StickyResultsPanel } from "./tool-layout-shell"
import { ToolJsonInput } from "./tool-json-input"
import { compareJsons, type ComparisonSettings } from "@/lib/json-compare"
import { prettifyJson } from "@/lib/json-utils"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

// Types
interface JsonDifference {
  type: "addition" | "deletion" | "modification"
  path: string
  leftLine?: number
  rightLine?: number
  oldValue?: any
  newValue?: any
  message?: string
}

interface JsonComparisonResult {
  differences: JsonDifference[]
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

// Preset examples
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
  // State
  const [json1, setJson1] = useState("")
  const [json1Name, setJson1Name] = useState("JSON 1")
  const [json1Error, setJson1Error] = useState<string | undefined>(undefined)
  const [json1Loading, setJson1Loading] = useState(false)

  const [json2, setJson2] = useState("")
  const [json2Name, setJson2Name] = useState("JSON 2")
  const [json2Error, setJson2Error] = useState<string | undefined>(undefined)
  const [json2Loading, setJson2Loading] = useState(false)

  const [comparisonResult, setComparisonResult] = useState<JsonComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [realTimeCompare, setRealTimeCompare] = useState(true)

  const [settings, setSettings] = useState<ComparisonSettings>({
    indentation: 2,
    sortKeys: false,
    ignoreOrder: false,
    fuzzyMatch: false,
    ignoreCase: false,
  })

  const [expandedDiffs, setExpandedDiffs] = useState<Set<string>>(new Set())
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("compare")

  const debouncedJson1 = useDebounce(json1, 500)
  const debouncedJson2 = useDebounce(json2, 500)

  // Comparison logic
  const performComparison = useCallback(async () => {
    if (!json1.trim() && !json2.trim()) {
      setComparisonResult(null)
      setJson1Error(undefined)
      setJson2Error(undefined)
      return
    }

    if (!json1.trim()) {
      setJson1Error("JSON 1 is required for comparison.")
      setComparisonResult(null)
      return
    }

    if (!json2.trim()) {
      setJson2Error("JSON 2 is required for comparison.")
      setComparisonResult(null)
      return
    }

    setIsComparing(true)
    await new Promise((resolve) => setTimeout(resolve, 50))

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

  // Event handlers
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
    setActiveTab("compare")
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

  // Computed values
  const summary = useMemo(() => {
    if (!comparisonResult?.summary) return { additions: 0, deletions: 0, modifications: 0, total: 0, unchanged: 0 }
    const { additions, deletions, modifications, unchanged } = comparisonResult.summary
    return { additions, deletions, modifications, total: additions + deletions + modifications, unchanged }
  }, [comparisonResult])

  const jsonInputComparisonResultProp = useMemo(() => {
    if (!comparisonResult) return undefined
    return {
      differences: comparisonResult.differences,
      summary: comparisonResult.summary,
    }
  }, [comparisonResult])

  // Sticky controls
  const stickyControls = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={performComparison}
          disabled={isComparing || (!json1.trim() && !json2.trim())}
          className="bg-primary hover:bg-primary/90"
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
        <Button variant="outline" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4 mr-2" /> Clear All
        </Button>
      </div>
    </div>
  )

  // Tab content
  const compareContent = (
    <ToolGrid className="grid-cols-1 lg:grid-cols-3">
      <ToolJsonInput
        title="JSON 1"
        icon={<FileJson className="h-5 w-5" />}
        value={json1}
        onValueChange={handleJson1Change}
        fileName={json1Name}
        error={json1Error}
        isLoading={json1Loading}
        placeholder="Paste your first JSON here..."
        showLineNumbers={true}
        comparisonResult={jsonInputComparisonResultProp}
        side="left"
        highlightedPath={highlightedPath}
        onFormat={() => handleFormatJson("json1")}
        onDownload={() => handleDownload("json1")}
        onFileUpload={(e) => handleFileUpload(e, "json1")}
        uploadId="json1-upload"
      />

      <ToolJsonInput
        title="JSON 2"
        icon={<FileJson className="h-5 w-5" />}
        value={json2}
        onValueChange={handleJson2Change}
        fileName={json2Name}
        error={json2Error}
        isLoading={json2Loading}
        placeholder="Paste your second JSON here..."
        showLineNumbers={true}
        comparisonResult={jsonInputComparisonResultProp}
        side="right"
        highlightedPath={highlightedPath}
        onFormat={() => handleFormatJson("json2")}
        onDownload={() => handleDownload("json2")}
        onFileUpload={(e) => handleFileUpload(e, "json2")}
        uploadId="json2-upload"
      />

      {/* Results Panel */}
      <div className="flex flex-col h-full min-h-0">
        {!comparisonResult && !isComparing && (
          <ToolEmptyState
            icon={<Info className="h-12 w-12" />}
            title="Ready to Compare"
            description="Input JSON in both panels to see differences"
            action={
              <Button variant="outline" onClick={() => loadPreset("basic")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Load Example
              </Button>
            }
          />
        )}

        {isComparing && (
          <ToolEmptyState
            icon={<GitCompare className="h-12 w-12 animate-pulse" />}
            title="Comparing..."
            description="Analyzing JSON differences"
          />
        )}

        {comparisonResult && !isComparing && (
          <StickyResultsPanel
            summary={
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {comparisonResult.areEqual ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-sm text-green-600 dark:text-green-400">
                        JSON objects are identical
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                        {summary.total} differences found
                      </span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold text-blue-600">{summary.modifications}</div>
                    <div className="text-muted-foreground">Modified</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold text-green-600">{summary.additions}</div>
                    <div className="text-muted-foreground">Added</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold text-red-600">{summary.deletions}</div>
                    <div className="text-muted-foreground">Deleted</div>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="font-bold text-gray-600">{summary.unchanged}</div>
                    <div className="text-muted-foreground">Unchanged</div>
                  </div>
                </div>
              </div>
            }
          >
            <div className="p-4 space-y-2">
              {summary.total > 0 ? (
                comparisonResult.differences.map((diff, index) => (
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
                            <pre className="inline bg-muted p-0.5 rounded text-xs">{JSON.stringify(diff.oldValue)}</pre>
                          </div>
                          <div>
                            <span className="font-semibold">{json2Name}:</span>{" "}
                            <pre className="inline bg-muted p-0.5 rounded text-xs">{JSON.stringify(diff.newValue)}</pre>
                          </div>
                        </>
                      )}
                      {diff.type === "addition" && (
                        <div>
                          <span className="font-semibold">Added in {json2Name}:</span>{" "}
                          <pre className="inline bg-muted p-0.5 rounded text-xs">{JSON.stringify(diff.newValue)}</pre>
                        </div>
                      )}
                      {diff.type === "deletion" && (
                        <div>
                          <span className="font-semibold">Removed from {json1Name}:</span>{" "}
                          <pre className="inline bg-muted p-0.5 rounded text-xs">{JSON.stringify(diff.oldValue)}</pre>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No differences found. The JSON objects are identical.
                </p>
              )}
            </div>
          </StickyResultsPanel>
        )}
      </div>
    </ToolGrid>
  )

  const settingsContent = (
    <ToolGrid className="grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Formatting Options</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="indentation">Indentation</Label>
              <Select
                value={settings.indentation.toString()}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, indentation: Number.parseInt(value) }))}
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
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Comparison Options</h3>
          <div className="space-y-4">
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
          </div>
        </div>
      </div>

      <div className="md:col-span-2 pt-6 border-t">
        <Button onClick={performComparison} className="w-full">
          <GitCompare className="h-4 w-4 mr-2" /> Apply Settings & Re-compare
        </Button>
      </div>
    </ToolGrid>
  )

  const presetsContent = (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Example Presets</h3>
        <p className="text-sm text-muted-foreground">
          Load predefined JSON examples to test different comparison scenarios.
        </p>
      </div>
      <div className="grid gap-3">
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
      </div>
    </div>
  )

  const actionsContent = (
    <ToolGrid className="grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleFormatJson("json1")}
            disabled={!json1 || !!json1Error}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Format JSON 1
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleFormatJson("json2")}
            disabled={!json2 || !!json2Error}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Format JSON 2
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button
            variant="outline"
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
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Export Options</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleDownload("json1")}
            disabled={!json1}
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON 1
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleDownload("json2")}
            disabled={!json2}
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON 2
          </Button>
          <Button
            variant="outline"
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
        </div>
      </div>
    </ToolGrid>
  )

  const tabs = [
    {
      id: "compare",
      label: "Compare",
      icon: <GitCompare className="h-4 w-4" />,
      content: compareContent,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings2 className="h-4 w-4" />,
      content: settingsContent,
    },
    {
      id: "presets",
      label: "Presets",
      icon: <Sparkles className="h-4 w-4" />,
      content: presetsContent,
    },
    {
      id: "actions",
      label: "Actions",
      icon: <Zap className="h-4 w-4" />,
      content: actionsContent,
    },
  ]

  return (
    <TooltipProvider>
      <ToolLayoutShell
        title="JSON Comparator"
        icon={<GitCompare className="h-6 w-6" />}
        description="Compare JSON objects and identify differences"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stickyControls={stickyControls}
        className="h-[100vh]"
      />
    </TooltipProvider>
  )
}

// Helper component for diff type icons
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
