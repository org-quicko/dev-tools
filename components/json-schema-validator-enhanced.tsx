"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SchemaVisualizationComponent } from "./schema-visualization" // Assuming this component is well-behaved
import { BatchValidation } from "./batch-validation" // Assuming this component is well-behaved
import {
  Upload,
  Shield,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Zap,
  Database,
  FileJson,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JsonInput } from "./json-input" // Using the refactored JsonInput
import {
  EnhancedJsonSchemaValidator,
  type ValidationResult,
  type ValidatorOptions,
  type SchemaDraft,
} from "@/lib/schema-validator-enhanced"

export function JsonSchemaValidatorEnhanced() {
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState<string | undefined>(undefined)
  const [jsonLoading, setJsonLoading] = useState(false)

  const [schemaInput, setSchemaInput] = useState("")
  const [schemaError, setSchemaError] = useState<string | undefined>(undefined)
  const [schemaLoading, setSchemaLoading] = useState(false)

  const [jsonFileName, setJsonFileName] = useState("")
  const [schemaFileName, setSchemaFileName] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [realTimeValidation, setRealTimeValidation] = useState(true)
  const [validatorOptions, setValidatorOptions] = useState<ValidatorOptions>({
    draft: "auto",
    strict: false,
    allErrors: true,
    verbose: true,
    removeAdditional: false,
    useDefaults: false,
    coerceTypes: false,
    validateFormats: true,
    resolveExternalRefs: false,
    timeout: 5000,
  })
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())
  const [validator] = useState(() => new EnhancedJsonSchemaValidator(validatorOptions)) // Options passed here might need to be dynamic
  const [activeTab, setActiveTab] = useState("validate")
  const [schemaVisualization, setSchemaVisualization] = useState<any>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null) // For visualization interaction

  const validateJsonCallback = useCallback(async () => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setValidationResult(null)
      if (!jsonInput.trim()) setJsonError("JSON data is required.")
      else setJsonError(undefined)
      if (!schemaInput.trim()) setSchemaError("JSON Schema is required.")
      else setSchemaError(undefined)
      return
    }
    setJsonError(undefined)
    setSchemaError(undefined)

    setIsValidating(true)
    try {
      // Re-initialize validator with current options if they can change
      const currentValidator = new EnhancedJsonSchemaValidator(validatorOptions)
      const result = await currentValidator.validate(jsonInput, schemaInput, validatorOptions) // Pass options again if validate method uses them directly
      setValidationResult(result)

      if (result.isValid || result.errors.length === 0) {
        // Generate visualization even if only warnings
        try {
          const parsedSchema = currentValidator.parseInput(schemaInput)
          const visualization = currentValidator.generateSchemaVisualization(parsedSchema)
          setSchemaVisualization(visualization)
        } catch (error) {
          console.warn("Could not generate schema visualization:", error)
          setSchemaVisualization(null)
        }
      } else {
        setSchemaVisualization(null) // Clear visualization if schema is invalid
      }
    } catch (error: any) {
      console.error("Validation error:", error)
      setValidationResult({
        isValid: false,
        errors: [
          {
            message: error.message || "An unexpected error occurred during validation.",
            instancePath: "root",
            keyword: "validator",
            severity: "error",
            category: "custom",
          },
        ],
        warnings: [],
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          validatedProperties: 0,
          totalProperties: 0,
          requiredProperties: 0,
          validationTime: 0,
        },
      })
    } finally {
      setIsValidating(false)
    }
  }, [jsonInput, schemaInput, validatorOptions]) // Removed validator from deps as it's re-created with options

  useEffect(() => {
    if (!realTimeValidation) return
    const timeoutId = setTimeout(() => {
      validateJsonCallback()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [jsonInput, schemaInput, realTimeValidation, validateJsonCallback])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "json" | "schema") => {
    const file = event.target.files?.[0]
    if (!file) return

    const setLoading = type === "json" ? setJsonLoading : setSchemaLoading
    setLoading(true)

    try {
      const content = await file.text()
      if (type === "json") {
        setJsonInput(content)
        setJsonFileName(file.name)
        setJsonError(undefined)
      } else {
        setSchemaInput(content)
        setSchemaFileName(file.name)
        setSchemaError(undefined)
      }
    } catch (err) {
      const setError = type === "json" ? setJsonError : setSchemaError
      setError("Failed to read file.")
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  const clearInputs = () => {
    setJsonInput("")
    setSchemaInput("")
    setJsonFileName("")
    setSchemaFileName("")
    setValidationResult(null)
    setSchemaVisualization(null)
    setJsonError(undefined)
    setSchemaError(undefined)
  }

  const copyToClipboard = (text: string) => {
    if (text) navigator.clipboard.writeText(text)
  }

  const downloadReport = () => {
    if (!validationResult) return
    const report = {
      timestamp: new Date().toISOString(),
      validation: validationResult,
      options: validatorOptions,
      files: { json: jsonFileName || "untitled.json", schema: schemaFileName || "untitled-schema.json" },
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `validation-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleErrorExpansion = (index: number) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }
  const getSeverityIcon = (severity: "error" | "warning") =>
    severity === "error" ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    )
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      required: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      type: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      format: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      pattern: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      enum: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      constraint: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      reference: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }
    return colors[category] || colors.custom
  }
  const getDraftDisplayName = (draft: SchemaDraft) => {
    const names: Record<SchemaDraft, string> = {
      "draft-03": "Draft 3 (2010)",
      "draft-04": "Draft 4 (2013)",
      "draft-06": "Draft 6 (2017)",
      "draft-07": "Draft 7 (2019)",
      "2019-09": "Draft 2019-09",
      "2020-12": "Draft 2020-12",
      auto: "Auto-detect",
    }
    return names[draft] || draft
  }

  const renderJsonInputSection = (
    type: "json" | "schema",
    value: string,
    onChange: (val: string, fileName?: string) => void,
    fileName: string,
    error?: string,
    isLoading?: boolean,
    placeholder: string,
  ) => (
    <Card className="tool-card flex flex-col h-full">
      {" "}
      {/* Ensure card takes full height of its grid cell */}
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {type === "json" ? (
              <FileJson className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="truncate">{fileName || (type === "json" ? "JSON Data" : "JSON Schema")}</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(value)}
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
                  <Label htmlFor={`${type}-upload`} className="cursor-pointer inline-flex items-center justify-center">
                    <Upload className="h-3.5 w-3.5" />
                  </Label>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload</TooltipContent>
            </Tooltip>
            <input
              type="file"
              id={`${type}-upload`}
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={(e) => handleFileUpload(e, type)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow relative min-h-0">
        <JsonInput
          value={value}
          onValueChange={onChange}
          errorText={error}
          isLoading={isLoading}
          placeholder={placeholder}
          responsiveHeight="100%"
          className="h-full"
          textAreaClassName="p-3 text-sm font-mono"
          showLineNumbers={false} // Can be enabled if desired
        />
      </CardContent>
    </Card>
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-var(--app-header-height,60px)-var(--page-padding,16px))] p-4 gap-4 tool-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow min-h-0">
          <div className="shrink-0">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="validate" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Validate
              </TabsTrigger>
              <TabsTrigger value="visualize" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualize
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Batch
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-grow mt-4 overflow-hidden">
            {" "}
            {/* Container for TabsContent */}
            <TabsContent value="validate" className="h-full flex flex-col gap-4">
              <Card className="tool-card shrink-0">
                <CardHeader className="py-3 px-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">Validation Controls</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="real-time" checked={realTimeValidation} onCheckedChange={setRealTimeValidation} />
                        <Label htmlFor="real-time" className="text-xs whitespace-nowrap">
                          Real-time
                        </Label>
                      </div>
                      <Select
                        value={validatorOptions.draft}
                        onValueChange={(value: SchemaDraft) =>
                          setValidatorOptions({ ...validatorOptions, draft: value })
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36 h-8 text-xs zinc-input">
                          <SelectValue placeholder="Schema draft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="draft-07">Draft 7</SelectItem>
                          <SelectItem value="2019-09">2019-09</SelectItem>
                          <SelectItem value="2020-12">2020-12</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={validateJsonCallback}
                        disabled={isValidating || !jsonInput.trim() || !schemaInput.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        {isValidating ? (
                          <Zap className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4 mr-1" />
                        )}
                        Validate
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearInputs} className="h-8 text-xs">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow min-h-0">
                {renderJsonInputSection(
                  "json",
                  jsonInput,
                  (val, fName) => {
                    setJsonInput(val)
                    if (fName) setJsonFileName(fName)
                    setJsonError(undefined)
                  },
                  jsonFileName,
                  jsonError,
                  jsonLoading,
                  "Paste JSON data...",
                )}
                {renderJsonInputSection(
                  "schema",
                  schemaInput,
                  (val, fName) => {
                    setSchemaInput(val)
                    if (fName) setSchemaFileName(fName)
                    setJsonError(undefined)
                  },
                  schemaFileName,
                  schemaError,
                  schemaLoading,
                  "Paste JSON Schema...",
                )}
              </div>

              {validationResult && (
                <Card className="tool-card shrink-0 mt-4">
                  {" "}
                  {/* Results card, shrink to content */}
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {validationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        Validation Results
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={validationResult.isValid ? "default" : "destructive"}
                          className={`text-xs ${validationResult.isValid ? "zinc-status-success" : "zinc-status-error"}`}
                        >
                          {validationResult.isValid ? "Valid" : "Invalid"}
                        </Badge>
                        {validationResult.detectedDraft && (
                          <Badge variant="outline" className="text-xs">
                            {getDraftDisplayName(validationResult.detectedDraft)}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={downloadReport} className="h-8 text-xs">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 text-xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {/* Summary items */}
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-red-600">{validationResult.summary.totalErrors}</div>
                        <div className="text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-yellow-600">
                          {validationResult.summary.totalWarnings}
                        </div>
                        <div className="text-muted-foreground">Warnings</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {validationResult.summary.validatedProperties}/{validationResult.summary.totalProperties}
                        </div>
                        <div className="text-muted-foreground">Properties</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {validationResult.summary.validationTime.toFixed(1)}ms
                        </div>
                        <div className="text-muted-foreground">Time</div>
                      </div>
                    </div>
                    {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                      <ScrollArea className="h-48 max-h-64 zinc-scrollbar pr-1">
                        {" "}
                        {/* Max height for error list */}
                        <div className="space-y-1.5">
                          {[...validationResult.errors, ...validationResult.warnings].map((error, index) => (
                            <Collapsible
                              key={index}
                              open={expandedErrors.has(index)}
                              onOpenChange={() => toggleErrorExpansion(index)}
                            >
                              <CollapsibleTrigger className="w-full text-left p-1.5 rounded hover:bg-accent transition-colors border flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 flex-grow min-w-0">
                                  {getSeverityIcon(error.severity)}
                                  <div className="flex-1 truncate">
                                    <span className="font-medium truncate" title={error.message}>
                                      {error.message}
                                    </span>{" "}
                                    <span className="text-muted-foreground truncate">
                                      ({error.instancePath || "root"} - {error.keyword})
                                    </span>
                                  </div>
                                  <Badge className={`${getCategoryColor(error.category)} text-xs px-1 py-0.5`}>
                                    {error.category}
                                  </Badge>
                                </div>
                                {expandedErrors.has(index) ? (
                                  <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 ml-1 shrink-0" />
                                )}
                              </CollapsibleTrigger>
                              <CollapsibleContent className="p-2 text-xs border border-t-0 rounded-b bg-background space-y-1">
                                {error.suggestion && (
                                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded">
                                    <span className="font-medium text-blue-700 dark:text-blue-300">💡 Suggestion:</span>{" "}
                                    {error.suggestion}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Data Path:</span>{" "}
                                  <code className="bg-muted p-0.5 rounded break-all">
                                    {error.dataLocation || error.instancePath || "root"}
                                  </code>
                                </div>
                                <div>
                                  <span className="font-medium">Schema Path:</span>{" "}
                                  <code className="bg-muted p-0.5 rounded break-all">
                                    {error.schemaLocation || "root"}
                                  </code>
                                </div>
                                {error.lineNumber && (
                                  <div>
                                    <span className="font-medium">Location:</span> Line {error.lineNumber}
                                    {error.columnNumber && `, Col ${error.columnNumber}`}
                                  </div>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="visualize" className="h-full overflow-y-auto zinc-scrollbar p-1">
              {schemaVisualization ? (
                <SchemaVisualizationComponent schema={schemaVisualization} onPropertySelect={setSelectedProperty} />
              ) : (
                <Card className="tool-card h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Provide a valid JSON schema to visualize its structure.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="batch" className="h-full overflow-y-auto zinc-scrollbar p-1">
              <BatchValidation validator={validator} schemaInput={schemaInput} validatorOptions={validatorOptions} />
            </TabsContent>
            <TabsContent value="settings" className="h-full overflow-y-auto zinc-scrollbar p-1">
              <Card className="tool-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" /> Validation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Schema Options</h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="strict-mode">Strict Mode</Label>
                          <Switch
                            id="strict-mode"
                            checked={validatorOptions.strict}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, strict: c }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="all-errors">Show All Errors</Label>
                          <Switch
                            id="all-errors"
                            checked={validatorOptions.allErrors}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, allErrors: c }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="verbose">Verbose Output</Label>
                          <Switch
                            id="verbose"
                            checked={validatorOptions.verbose}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, verbose: c }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="validate-formats">Validate Formats</Label>
                          <Switch
                            id="validate-formats"
                            checked={validatorOptions.validateFormats}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, validateFormats: c }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Data Processing</h3>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="use-defaults">Use Default Values</Label>
                          <Switch
                            id="use-defaults"
                            checked={validatorOptions.useDefaults}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, useDefaults: c }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="coerce-types">Coerce Types</Label>
                          <Switch
                            id="coerce-types"
                            checked={!!validatorOptions.coerceTypes}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, coerceTypes: c }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="resolve-refs">Resolve External Refs</Label>
                          <Switch
                            id="resolve-refs"
                            checked={validatorOptions.resolveExternalRefs}
                            onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, resolveExternalRefs: c }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Additional Properties</h3>
                    <Select
                      value={String(validatorOptions.removeAdditional)}
                      onValueChange={(v) =>
                        setValidatorOptions((o) => ({
                          ...o,
                          removeAdditional: v === "true" ? true : v === "false" ? false : (v as any),
                        }))
                      }
                    >
                      <SelectTrigger className="zinc-input text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Keep additional</SelectItem>
                        <SelectItem value="true">Remove additional</SelectItem>
                        <SelectItem value="all">Remove all additional</SelectItem>
                        <SelectItem value="failing">Remove failing additional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 border-t">
                    <Button
                      onClick={validateJsonCallback}
                      className="w-full bg-green-600 hover:bg-green-700 text-xs h-9"
                    >
                      <Shield className="h-4 w-4 mr-1" /> Apply Settings & Validate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
