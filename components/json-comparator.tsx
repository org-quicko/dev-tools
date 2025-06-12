"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  GitCompare,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Info,
  Sparkles,
  Download,
  Trash2,
  Search,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FlexibleToolLayout, ColumnEmptyState, ColumnLoadingState } from "./flexible-tool-layout"
import { SharedJsonInput, JsonInputActions } from "./shared-json-input"
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
  "numbers": [1, 2, 3]
}`,
    json2: `{
  "fruits": ["cherry", "apple", "banana"],
  "numbers": [3, 1, 2]
}`,
  },
}

export function JsonComparator() {
  // State
  const [json1, setJson1] = useState(`{
  "ITR": {
    "ITR1": {
      "CreationInfo": {
        "Digest": "ABC123",
        "IntermediaryCity": "Mumbai"
      },
      "ITR1_IncomeDeductions": {
        "UsrDeductUndChapVIA": {
          "Section80C": {
            "Sec80CCDEmployeeOrSE": 150000,
            "Sec80CCC": 0,
            "Sec80CCDEmployer": 50000
          },
          "Section80D": {
            "Sec80DHealthInsPremium": {
              "SeniorCitizenFlag": "N",
              "SelfAndFamily": 25000,
              "ParentsU60": 0,
              "ParentsO60": 0
            }
          }
        },
        "AllwncExemptUs10": {
          "SalaryExemptUs10": {
            "ExemptSalaryUs10": {
              "NatureOfAllowance": "HRA",
              "ExemptAmount": 120000
            }
          }
        }
      }
    }
  }
}`)

  const [json2, setJson2] = useState(`{
  "ITR": {
    "ITR1": {
      "CreationInfo": {
        "Digest": "XYZ789",
        "IntermediaryCity": "Delhi"
      },
      "ITR1_IncomeDeductions": {
        "UsrDeductUndChapVIA": {
          "Section80C": {
            "Sec80CCDEmployeeOrSE": 100000,
            "Sec80CCC": 25000,
            "Sec80CCDEmployer": 50000
          },
          "Section80D": {
            "Sec80DHealthInsPremium": {
              "SeniorCitizenFlag": "Y",
              "SelfAndFamily": 50000,
              "ParentsU60": 25000,
              "ParentsO60": 50000
            }
          }
        },
        "AllwncExemptUs10": {
          "SalaryExemptUs10": {
            "ExemptSalaryUs10": {
              "NatureOfAllowance": "Transport",
              "ExemptAmount": 19200
            }
          }
        }
      }
    }
  }
}`)
  const [json1Name, setJson1Name] = useState("")
  const [json1Error, setJson1Error] = useState<string | undefined>(undefined)
  const [json1Loading, setJson1Loading] = useState(false)

  const [json2Name, setJson2Name] = useState("")
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
    setJson1Name("")
    setJson2Name("")
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
    const fileName = (target === "json1" ? json1Name : json2Name) || `${target}.json`
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

  // Top controls
  const topControls = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Select
          value={settings.indentation.toString()}
          onValueChange={(value) => setSettings((prev) => ({ ...prev, indentation: Number.parseInt(value) }))}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="8">8 spaces</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  )

  // Define columns
  const columns = [
    {
      id: "json1",
      title: json1Name || "JSON 1",
      icon: <FileJson className="h-4 w-4" />,
      actions: (
        <JsonInputActions
          onFormat={() => handleFormatJson("json1")}
          onCopy={() => json1 && navigator.clipboard.writeText(json1)}
          onDownload={() => handleDownload("json1")}
          onUpload={() => document.getElementById("json1-upload")?.click()}
          disabled={!json1 || !!json1Error}
        />
      ),
      content: (
        <SharedJsonInput
          value={json1}
          onValueChange={handleJson1Change}
          placeholder="Paste your first JSON here..."
          error={json1Error}
          isLoading={json1Loading}
          fileName={json1Name}
          comparisonResult={jsonInputComparisonResultProp}
          side="left"
          highlightedPath={highlightedPath}
          onFileUpload={(e) => handleFileUpload(e, "json1")}
          uploadId="json1-upload"
        />
      ),
    },
    {
      id: "json2",
      title: json2Name || "JSON 2",
      icon: <FileJson className="h-4 w-4" />,
      actions: (
        <JsonInputActions
          onFormat={() => handleFormatJson("json2")}
          onCopy={() => json2 && navigator.clipboard.writeText(json2)}
          onDownload={() => handleDownload("json2")}
          onUpload={() => document.getElementById("json2-upload")?.click()}
          disabled={!json2 || !!json2Error}
        />
      ),
      content: (
        <SharedJsonInput
          value={json2}
          onValueChange={handleJson2Change}
          placeholder="Paste your second JSON here..."
          error={json2Error}
          isLoading={json2Loading}
          fileName={json2Name}
          comparisonResult={jsonInputComparisonResultProp}
          side="right"
          highlightedPath={highlightedPath}
          onFileUpload={(e) => handleFileUpload(e, "json2")}
          uploadId="json2-upload"
        />
      ),
    },
    {
      id: "results",
      title: "Comparison Results",
      icon: <Search className="h-4 w-4" />,
      actions: comparisonResult && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const report = JSON.stringify(comparisonResult, null, 2)
            const blob = new Blob([report], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "comparison-report.json"
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="h-7 w-7"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      ),
      content: (
        <div className="h-full w-full">
          {!comparisonResult && !isComparing && (
            <ColumnEmptyState
              icon={<Info className="h-12 w-12" />}
              title="Ready to Compare"
              description="Input JSON in both panels to see differences"
              action={
                <div className="space-y-2 w-full max-w-xs">
                  <Button variant="outline" onClick={() => loadPreset("basic")} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Load Basic Example
                  </Button>
                  <Button variant="outline" onClick={() => loadPreset("arrays")} className="w-full">
                    <FileJson className="h-4 w-4 mr-2" />
                    Load Array Example
                  </Button>
                </div>
              }
            />
          )}

          {isComparing && <ColumnLoadingState message="Comparing JSON objects..." />}

          {comparisonResult && !isComparing && (
            <div className="space-y-4 w-full">
              {/* Summary */}
              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border">
                {comparisonResult.areEqual ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">JSON objects are identical</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">{summary.total} differences found</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-blue-600">{summary.modifications}</div>
                    <div className="text-xs text-muted-foreground">Modified</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-green-600">{summary.additions}</div>
                    <div className="text-xs text-muted-foreground">Added</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-red-600">{summary.deletions}</div>
                    <div className="text-xs text-muted-foreground">Deleted</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-gray-600">{summary.unchanged}</div>
                    <div className="text-xs text-muted-foreground">Unchanged</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Comparison Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sort-keys" className="text-xs">
                      Sort Keys
                    </Label>
                    <Switch
                      id="sort-keys"
                      checked={settings.sortKeys}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, sortKeys: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-order" className="text-xs">
                      Ignore Array Order
                    </Label>
                    <Switch
                      id="ignore-order"
                      checked={settings.ignoreOrder}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, ignoreOrder: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuzzy-match" className="text-xs">
                      Fuzzy Matching
                    </Label>
                    <Switch
                      id="fuzzy-match"
                      checked={settings.fuzzyMatch}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, fuzzyMatch: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ignore-case" className="text-xs">
                      Ignore Case
                    </Label>
                    <Switch
                      id="ignore-case"
                      checked={settings.ignoreCase}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, ignoreCase: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Differences List */}
              {summary.total > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Differences ({summary.total})</h4>
                  <div className="space-y-1">
                    {comparisonResult.differences.map((diff, index) => (
                      <Collapsible
                        key={`${diff.path}-${index}`}
                        open={expandedDiffs.has(diff.path)}
                        onOpenChange={() => toggleDiffExpansion(diff.path)}
                      >
                        <CollapsibleTrigger
                          className={cn(
                            "w-full text-left p-2 rounded-md hover:bg-accent transition-colors border flex items-start justify-between text-xs gap-2",
                            highlightedPath === diff.path && "bg-accent ring-1 ring-primary",
                          )}
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <DiffTypeIcon type={diff.type} className="shrink-0 mt-0.5" />
                            <span className="font-mono break-all text-left leading-tight" title={diff.path || "Root"}>
                              {diff.path || "Root"}
                            </span>
                          </div>
                          {expandedDiffs.has(diff.path) ? (
                            <ChevronDown className="h-3 w-3 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 shrink-0" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2 text-xs border border-t-0 rounded-b-md bg-background">
                          <div className="space-y-1">
                            <p className="font-medium capitalize">
                              {diff.type} at <span className="font-mono break-all">{diff.path || "Root"}</span>
                            </p>
                            {diff.message && <p className="text-muted-foreground">{diff.message}</p>}
                            {diff.type === "modification" && (
                              <div className="space-y-1">
                                <div>
                                  <Badge variant="outline" className="text-xs mr-1">
                                    Before
                                  </Badge>
                                  <code className="bg-muted p-1 rounded text-xs break-all">
                                    {JSON.stringify(diff.oldValue)}
                                  </code>
                                </div>
                                <div>
                                  <Badge variant="outline" className="text-xs mr-1">
                                    After
                                  </Badge>
                                  <code className="bg-muted p-1 rounded text-xs break-all">
                                    {JSON.stringify(diff.newValue)}
                                  </code>
                                </div>
                              </div>
                            )}
                            {diff.type === "addition" && (
                              <div>
                                <Badge variant="outline" className="text-xs mr-1">
                                  Added
                                </Badge>
                                <code className="bg-muted p-1 rounded text-xs break-all">
                                  {JSON.stringify(diff.newValue)}
                                </code>
                              </div>
                            )}
                            {diff.type === "deletion" && (
                              <div>
                                <Badge variant="outline" className="text-xs mr-1">
                                  Removed
                                </Badge>
                                <code className="bg-muted p-1 rounded text-xs break-all">
                                  {JSON.stringify(diff.oldValue)}
                                </code>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <TooltipProvider>
      <FlexibleToolLayout columns={columns} topControls={topControls} className="w-full" />
    </TooltipProvider>
  )
}

// Helper component for diff type icons
function DiffTypeIcon({ type, className }: { type: "addition" | "deletion" | "modification"; className?: string }) {
  const iconClass = cn("h-3 w-3", className)
  switch (type) {
    case "addition":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />
    case "deletion":
      return <AlertCircle className={cn(iconClass, "text-red-500")} />
    case "modification":
      return <GitCompare className={cn(iconClass, "text-blue-500")} />
    default:
      return <Info className={cn(iconClass, "text-muted-foreground")} />
  }
}
