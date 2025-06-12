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
import { SchemaVisualizationComponent } from "./schema-visualization"
import { BatchValidation } from "./batch-validation"
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
import {
  EnhancedJsonSchemaValidator,
  type ValidationResult,
  type ValidatorOptions,
  type SchemaDraft,
} from "@/lib/schema-validator-enhanced"

export function JsonSchemaValidatorEnhanced() {
  const [jsonInput, setJsonInput] = useState("")
  const [schemaInput, setSchemaInput] = useState("")
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
  const [validator] = useState(() => new EnhancedJsonSchemaValidator(validatorOptions))
  const [activeTab, setActiveTab] = useState("validate")
  const [schemaVisualization, setSchemaVisualization] = useState<any>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  const validateJson = useCallback(async () => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    try {
      const result = await validator.validate(jsonInput, schemaInput, validatorOptions)
      setValidationResult(result)

      try {
        const parsedSchema = validator.parseInput(schemaInput)
        const visualization = validator.generateSchemaVisualization(parsedSchema)
        setSchemaVisualization(visualization)
      } catch (error) {
        console.warn("Could not generate schema visualization:", error)
        setSchemaVisualization(null)
      }
    } catch (error) {
      console.error("Validation error:", error)
    } finally {
      setIsValidating(false)
    }
  }, [jsonInput, schemaInput, validatorOptions, validator])
  useEffect(() => {
    if (!realTimeValidation) return

    const timeoutId = setTimeout(() => {
      validateJson()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [jsonInput, schemaInput, realTimeValidation, validateJson])
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "json" | "schema") => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (type === "json") {
        setJsonInput(content)
        setJsonFileName(file.name)
      } else {
        setSchemaInput(content)
        setSchemaFileName(file.name)
      }
    }
    reader.readAsText(file)
  }
  const clearInputs = () => {
    setJsonInput("")
    setSchemaInput("")
    setJsonFileName("")
    setSchemaFileName("")
    setValidationResult(null)
    setSchemaVisualization(null)
  }
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }
  const downloadReport = () => {
    if (!validationResult) return

    const report = {
      timestamp: new Date().toISOString(),
      validation: validationResult,
      options: validatorOptions,
      files: {
        json: jsonFileName || "untitled.json",
        schema: schemaFileName || "untitled-schema.json",
      },
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    })
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
    const newExpanded = new Set(expandedErrors)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedErrors(newExpanded)
  }
  const getSeverityIcon = (severity: "error" | "warning") => {
    return severity === "error" ? (
      <AlertCircle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    )
  }
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

  return (
    <TooltipProvider>
      <div className="tool-container space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="validate" className="flex items-center gap-2 text-xs sm:text-sm">
              <Shield className="h-4 w-4" /> Validate
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex items-center gap-2 text-xs sm:text-sm">
              <Eye className="h-4 w-4" /> Visualize
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2 text-xs sm:text-sm">
              <Database className="h-4 w-4" /> Batch
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validate" className="space-y-6">
            <Card className="tool-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5" /> Validation Controls
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="real-time" checked={realTimeValidation} onCheckedChange={setRealTimeValidation} />
                      <Label htmlFor="real-time" className="text-xs whitespace-nowrap">
                        Real-time
                      </Label>
                    </div>
                    <Select
                      value={validatorOptions.draft}
                      onValueChange={(value: SchemaDraft) => setValidatorOptions({ ...validatorOptions, draft: value })}
                    >
                      <SelectTrigger className="w-full sm:w-40 h-9 text-xs zinc-input">
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
                      onClick={validateJson}
                      disabled={isValidating}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-9 text-xs"
                    >
                      {isValidating ? (
                        <Zap className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-1" />
                      )}{" "}
                      Validate
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearInputs} className="h-9 text-xs">
                      <Trash2 className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="tool-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileJson className="h-5 w-5" /> JSON Data
                      {jsonFileName && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {jsonFileName}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(jsonInput)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy JSON</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                            <label
                              htmlFor="json-upload"
                              className="cursor-pointer flex items-center justify-center h-full w-full"
                            >
                              <Upload className="h-4 w-4" />
                              <input
                                id="json-upload"
                                type="file"
                                accept=".json,.yaml,.yml"
                                onChange={(e) => handleFileUpload(e, "json")}
                                className="hidden"
                              />
                            </label>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload JSON</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste JSON data..."
                    className="zinc-textarea h-80 font-mono text-sm"
                  />
                </CardContent>
              </Card>
              <Card className="tool-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5" /> JSON Schema
                      {schemaFileName && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {schemaFileName}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(schemaInput)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Schema</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                            <label
                              htmlFor="schema-upload"
                              className="cursor-pointer flex items-center justify-center h-full w-full"
                            >
                              <Upload className="h-4 w-4" />
                              <input
                                id="schema-upload"
                                type="file"
                                accept=".json,.yaml,.yml"
                                onChange={(e) => handleFileUpload(e, "schema")}
                                className="hidden"
                              />
                            </label>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload Schema</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={schemaInput}
                    onChange={(e) => setSchemaInput(e.target.value)}
                    placeholder="Paste JSON Schema..."
                    className="zinc-textarea h-80 font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>

            {validationResult && (
              <div className="space-y-6">
                <Card className="tool-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
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
                          <Download className="h-3.5 w-3.5 mr-1" /> Export Report
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xl font-bold text-red-600">{validationResult.summary.totalErrors}</div>
                        <div className="text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xl font-bold text-yellow-600">
                          {validationResult.summary.totalWarnings}
                        </div>
                        <div className="text-muted-foreground">Warnings</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xl font-bold text-blue-600">
                          {validationResult.summary.validatedProperties}/{validationResult.summary.totalProperties}
                        </div>
                        <div className="text-muted-foreground">Properties</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-xl font-bold text-green-600">
                          {validationResult.summary.requiredProperties}
                        </div>
                        <div className="text-muted-foreground">Required</div>
                      </div>
                    </div>
                    {validationResult.schemaInfo && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs">
                        <h4 className="font-semibold mb-1.5 text-sm">Schema Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {validationResult.schemaInfo.title && (
                            <div>
                              <span className="font-medium">Title:</span> {validationResult.schemaInfo.title}
                            </div>
                          )}
                          {validationResult.schemaInfo.version && (
                            <div>
                              <span className="font-medium">Version:</span> {validationResult.schemaInfo.version}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Properties:</span> {validationResult.schemaInfo.properties}
                          </div>
                          <div>
                            <span className="font-medium">Required Fields:</span>{" "}
                            {validationResult.schemaInfo.requiredFields}
                          </div>
                          <div>
                            <span className="font-medium">External Refs:</span>{" "}
                            {validationResult.schemaInfo.hasExternalRefs ? "Yes" : "No"}
                          </div>
                          <div>
                            <span className="font-medium">Validation Time:</span>{" "}
                            {validationResult.summary.validationTime.toFixed(2)}ms
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                  <Card className="tool-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" /> Issues Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96 zinc-scrollbar">
                        <div className="space-y-2 pr-2">
                          {[...validationResult.errors, ...validationResult.warnings].map((error, index) => (
                            <Collapsible key={index}>
                              <div className="border rounded-md p-3">
                                <CollapsibleTrigger
                                  className="flex items-center justify-between w-full text-left text-xs hover:bg-muted/20 p-1 rounded-sm"
                                  onClick={() => toggleErrorExpansion(index)}
                                >
                                  <div className="flex items-center gap-2 flex-grow min-w-0">
                                    {getSeverityIcon(error.severity)}
                                    <div className="flex-1 truncate">
                                      <div className="font-medium truncate" title={error.message}>
                                        {error.message}
                                      </div>
                                      <div className="text-muted-foreground truncate">
                                        {error.instancePath || "root"} • {error.keyword}
                                      </div>
                                    </div>
                                    <Badge className={`${getCategoryColor(error.category)} text-xs px-1.5 py-0.5`}>
                                      {error.category}
                                    </Badge>
                                  </div>
                                  {expandedErrors.has(index) ? (
                                    <ChevronDown className="h-3.5 w-3.5 ml-1 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 ml-1 flex-shrink-0" />
                                  )}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 pt-2 border-t text-xs">
                                  <div className="space-y-2">
                                    {error.suggestion && (
                                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                        <div className="font-medium text-blue-800 dark:text-blue-200 mb-0.5">
                                          💡 Suggestion
                                        </div>
                                        <div className="text-blue-700 dark:text-blue-300">{error.suggestion}</div>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <div className="font-medium">Data Path:</div>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                          {error.dataLocation || "root"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-medium">Schema Path:</div>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                          {error.schemaLocation || "root"}
                                        </div>
                                      </div>
                                    </div>
                                    {error.lineNumber && (
                                      <div>
                                        <div className="font-medium">Location:</div>
                                        <div className="text-muted-foreground">
                                          Line {error.lineNumber}
                                          {error.columnNumber && `, Col ${error.columnNumber}`}
                                        </div>
                                      </div>
                                    )}
                                    {error.affectedValue !== undefined && (
                                      <div>
                                        <div className="font-medium">Affected Value:</div>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                          {JSON.stringify(error.affectedValue)}
                                        </div>
                                      </div>
                                    )}
                                    {error.expectedValue !== undefined && (
                                      <div>
                                        <div className="font-medium">Expected:</div>
                                        <div className="font-mono text-xs bg-muted p-1.5 rounded break-all">
                                          {JSON.stringify(error.expectedValue)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualize">
            {schemaVisualization ? (
              <SchemaVisualizationComponent schema={schemaVisualization} onPropertySelect={setSelectedProperty} />
            ) : (
              <Card className="tool-card">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Add a JSON schema to visualize its structure.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="batch">
            <BatchValidation validator={validator} schemaInput={schemaInput} validatorOptions={validatorOptions} />
          </TabsContent>
          <TabsContent value="settings">
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
                  <Button onClick={validateJson} className="w-full bg-green-600 hover:bg-green-700 text-xs h-9">
                    <Shield className="h-4 w-4 mr-1" /> Apply Settings & Validate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
