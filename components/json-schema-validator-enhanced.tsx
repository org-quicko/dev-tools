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
import { ThemeToggle } from "./theme-toggle"
import { SchemaVisualizationComponent } from "./schema-visualization"
import { BatchValidation } from "./batch-validation"
import {
  Upload,
  Shield,
  CheckCircle,
  AlertTriangle,
  Home,
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
import Link from "next/link"
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

      // Generate schema visualization
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

  // Real-time validation with debouncing
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

  const formatJsonWithLineNumbers = (json: string) => {
    try {
      const formatted = JSON.stringify(JSON.parse(json), null, 2)
      return formatted.split("\n").map((line, index) => (
        <div key={index} className="flex">
          <span className="text-muted-foreground text-xs w-8 text-right mr-2 select-none">{index + 1}</span>
          <span className="flex-1">{line}</span>
        </div>
      ))
    } catch {
      return json.split("\n").map((line, index) => (
        <div key={index} className="flex">
          <span className="text-muted-foreground text-xs w-8 text-right mr-2 select-none">{index + 1}</span>
          <span className="flex-1">{line}</span>
        </div>
      ))
    }
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
                <span className="text-sm">JS</span>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Universal JSON Schema Validator</h1>
                  <p className="text-muted-foreground">
                    Validate JSON data against schemas with comprehensive error reporting
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
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

            <TabsContent value="validate" className="space-y-6">
              {/* Controls */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Validation Controls
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="real-time" checked={realTimeValidation} onCheckedChange={setRealTimeValidation} />
                        <Label htmlFor="real-time" className="text-sm">
                          Real-time validation
                        </Label>
                      </div>
                      <Select
                        value={validatorOptions.draft}
                        onValueChange={(value: SchemaDraft) =>
                          setValidatorOptions({ ...validatorOptions, draft: value })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select schema draft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="draft-03">Draft 3 (2010)</SelectItem>
                          <SelectItem value="draft-04">Draft 4 (2013)</SelectItem>
                          <SelectItem value="draft-06">Draft 6 (2017)</SelectItem>
                          <SelectItem value="draft-07">Draft 7 (2019)</SelectItem>
                          <SelectItem value="2019-09">Draft 2019-09</SelectItem>
                          <SelectItem value="2020-12">Draft 2020-12</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={validateJson}
                        disabled={isValidating}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isValidating ? (
                          <>
                            <Zap className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Validate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={clearInputs}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Input Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Data Input */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileJson className="h-5 w-5" />
                        JSON Data
                        {jsonFileName && (
                          <Badge variant="secondary" className="ml-2">
                            {jsonFileName}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(jsonInput)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy JSON data</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" asChild>
                              <label htmlFor="json-upload" className="cursor-pointer">
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
                          <TooltipContent>Upload JSON file</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder="Paste your JSON data here or upload a file..."
                      className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </CardContent>
                </Card>

                {/* JSON Schema Input */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        JSON Schema
                        {schemaFileName && (
                          <Badge variant="secondary" className="ml-2">
                            {schemaFileName}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(schemaInput)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy schema</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" asChild>
                              <label htmlFor="schema-upload" className="cursor-pointer">
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
                          <TooltipContent>Upload schema file</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={schemaInput}
                      onChange={(e) => setSchemaInput(e.target.value)}
                      placeholder="Paste your JSON Schema here or upload a file..."
                      className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
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
                            className={
                              validationResult.isValid
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ""
                            }
                          >
                            {validationResult.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          {validationResult.detectedDraft && (
                            <Badge variant="outline">{getDraftDisplayName(validationResult.detectedDraft)}</Badge>
                          )}
                          <Button variant="outline" size="sm" onClick={downloadReport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{validationResult.summary.totalErrors}</div>
                          <div className="text-sm text-muted-foreground">Errors</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {validationResult.summary.totalWarnings}
                          </div>
                          <div className="text-sm text-muted-foreground">Warnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {validationResult.summary.validatedProperties}/{validationResult.summary.totalProperties}
                          </div>
                          <div className="text-sm text-muted-foreground">Properties</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {validationResult.summary.requiredProperties}
                          </div>
                          <div className="text-sm text-muted-foreground">Required</div>
                        </div>
                      </div>

                      {validationResult.schemaInfo && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <h4 className="font-semibold mb-2">Schema Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
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
                              <span className="font-medium">External References:</span>{" "}
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

                  {/* Errors and Warnings */}
                  {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Issues Found
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {[...validationResult.errors, ...validationResult.warnings].map((error, index) => (
                              <Collapsible key={index}>
                                <div className="border rounded-lg p-4">
                                  <CollapsibleTrigger
                                    className="flex items-center justify-between w-full text-left"
                                    onClick={() => toggleErrorExpansion(index)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {getSeverityIcon(error.severity)}
                                      <div className="flex-1">
                                        <div className="font-medium">{error.message}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {error.instancePath || "root"} • {error.keyword}
                                        </div>
                                      </div>
                                      <Badge className={getCategoryColor(error.category)}>{error.category}</Badge>
                                    </div>
                                    {expandedErrors.has(index) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3 pt-3 border-t">
                                    <div className="space-y-3 text-sm">
                                      {error.suggestion && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                            💡 Suggestion
                                          </div>
                                          <div className="text-blue-700 dark:text-blue-300">{error.suggestion}</div>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <div className="font-medium">Data Path:</div>
                                          <div className="font-mono text-xs bg-muted p-2 rounded">
                                            {error.dataLocation || "root"}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="font-medium">Schema Path:</div>
                                          <div className="font-mono text-xs bg-muted p-2 rounded">
                                            {error.schemaLocation || "root"}
                                          </div>
                                        </div>
                                      </div>
                                      {error.lineNumber && (
                                        <div>
                                          <div className="font-medium">Location:</div>
                                          <div className="text-muted-foreground">
                                            Line {error.lineNumber}
                                            {error.columnNumber && `, Column ${error.columnNumber}`}
                                          </div>
                                        </div>
                                      )}
                                      {error.affectedValue !== undefined && (
                                        <div>
                                          <div className="font-medium">Affected Value:</div>
                                          <div className="font-mono text-xs bg-muted p-2 rounded">
                                            {JSON.stringify(error.affectedValue)}
                                          </div>
                                        </div>
                                      )}
                                      {error.expectedValue !== undefined && (
                                        <div>
                                          <div className="font-medium">Expected:</div>
                                          <div className="font-mono text-xs bg-muted p-2 rounded">
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
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Add a JSON schema to visualize its structure</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="batch">
              <BatchValidation validator={validator} schemaInput={schemaInput} validatorOptions={validatorOptions} />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Validation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Schema Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="strict-mode">Strict Mode</Label>
                          <Switch
                            id="strict-mode"
                            checked={validatorOptions.strict}
                            onCheckedChange={(checked) => setValidatorOptions({ ...validatorOptions, strict: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="all-errors">Show All Errors</Label>
                          <Switch
                            id="all-errors"
                            checked={validatorOptions.allErrors}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, allErrors: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="verbose">Verbose Output</Label>
                          <Switch
                            id="verbose"
                            checked={validatorOptions.verbose}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, verbose: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="validate-formats">Validate Formats</Label>
                          <Switch
                            id="validate-formats"
                            checked={validatorOptions.validateFormats}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, validateFormats: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Data Processing</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="use-defaults">Use Default Values</Label>
                          <Switch
                            id="use-defaults"
                            checked={validatorOptions.useDefaults}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, useDefaults: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="coerce-types">Coerce Types</Label>
                          <Switch
                            id="coerce-types"
                            checked={!!validatorOptions.coerceTypes}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, coerceTypes: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="resolve-refs">Resolve External References</Label>
                          <Switch
                            id="resolve-refs"
                            checked={validatorOptions.resolveExternalRefs}
                            onCheckedChange={(checked) =>
                              setValidatorOptions({ ...validatorOptions, resolveExternalRefs: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Additional Properties</h3>
                    <Select
                      value={String(validatorOptions.removeAdditional)}
                      onValueChange={(value) =>
                        setValidatorOptions({
                          ...validatorOptions,
                          removeAdditional: value === "true" ? true : value === "false" ? false : (value as any),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Keep additional properties</SelectItem>
                        <SelectItem value="true">Remove additional properties</SelectItem>
                        <SelectItem value="all">Remove all additional properties</SelectItem>
                        <SelectItem value="failing">Remove failing additional properties</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={validateJson} className="w-full bg-green-600 hover:bg-green-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Apply Settings & Validate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
