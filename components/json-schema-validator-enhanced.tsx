"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Download,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FlexibleToolLayout, ColumnEmptyState, ColumnLoadingState } from "./flexible-tool-layout"
import { SharedJsonInput, JsonInputActions } from "./shared-json-input"
import {
  EnhancedJsonSchemaValidator,
  type ValidationResult,
  type ValidatorOptions,
  type SchemaDraft,
} from "@/lib/schema-validator-enhanced"
import { prettifyJson } from "@/lib/json-utils" // Import prettifyJson

export function JsonSchemaValidatorEnhanced() {
  const [jsonInput, setJsonInput] = useState("")
  const [jsonError, setJsonError] = useState<string | undefined>(undefined)
  const [jsonLoading, setJsonLoading] = useState(false)
  const [jsonFileName, setJsonFileName] = useState("")

  const [schemaInput, setSchemaInput] = useState("")
  const [schemaError, setSchemaError] = useState<string | undefined>(undefined)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaFileName, setSchemaFileName] = useState("")

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
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
      const currentValidator = new EnhancedJsonSchemaValidator(validatorOptions)
      const result = await currentValidator.validate(jsonInput, schemaInput, validatorOptions)
      setValidationResult(result)
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
  }, [jsonInput, schemaInput, validatorOptions])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateJsonCallback()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [jsonInput, schemaInput, validateJsonCallback]) // Removed realTimeValidation from dependencies

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "json" | "schema") => {
    const file = event.target.files?.[0]
    if (!file) return

    const setLoading = type === "json" ? setJsonLoading : setSchemaLoading
    setLoading(true)

    try {
      const content = await file.text()
      const formattedContent = prettifyJson(content, { indentation: 2, sortKeys: false }) // Auto-format on upload
      if (type === "json") {
        setJsonInput(formattedContent)
        setJsonFileName(file.name)
        setJsonError(undefined)
      } else {
        setSchemaInput(formattedContent)
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
    setJsonError(undefined)
    setSchemaError(undefined)
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

  // Top controls
  const topControls = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Select
          value={validatorOptions.draft}
          onValueChange={(value: SchemaDraft) => setValidatorOptions((o) => ({ ...o, draft: value }))}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Schema draft" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="draft-07">Draft 7</SelectItem>
            <SelectItem value="2019-09">2019-09</SelectItem>
            <SelectItem value="2020-12">2020-12</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={clearInputs}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )

  // Define columns
  const columns = [
    {
      id: "json",
      title: jsonFileName || "JSON Data",
      icon: <FileJson className="h-4 w-4" />,
      actions: (
        <JsonInputActions
          onCopy={() => jsonInput && navigator.clipboard.writeText(jsonInput)}
          onDownload={() => {
            if (!jsonInput) return
            const fileName = jsonFileName || "data.json"
            const blob = new Blob([jsonInput], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          onUpload={() => document.getElementById("json-upload")?.click()}
          disabled={!jsonInput || !!jsonError}
        />
      ),
      content: (
        <SharedJsonInput
          value={jsonInput}
          onValueChange={(val, fName) => {
            try {
              const formatted = prettifyJson(val, { indentation: 2, sortKeys: false }) // Auto-format on change
              setJsonInput(formatted)
              setJsonError(undefined)
            } catch (err) {
              setJsonInput(val) // Keep original if invalid
              setJsonError("Invalid JSON: Cannot format")
            }
            if (fName) setJsonFileName(fName)
          }}
          placeholder="Paste JSON data here..."
          error={jsonError}
          isLoading={jsonLoading}
          fileName={jsonFileName}
          onFileUpload={(e) => handleFileUpload(e, "json")}
          uploadId="json-upload"
        />
      ),
    },
    {
      id: "schema",
      title: schemaFileName || "JSON Schema",
      icon: <Shield className="h-4 w-4" />,
      actions: (
        <JsonInputActions
          onCopy={() => schemaInput && navigator.clipboard.writeText(schemaInput)}
          onDownload={() => {
            if (!schemaInput) return
            const fileName = schemaFileName || "schema.json"
            const blob = new Blob([schemaInput], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          onUpload={() => document.getElementById("schema-upload")?.click()}
          disabled={!schemaInput || !!schemaError}
        />
      ),
      content: (
        <SharedJsonInput
          value={schemaInput}
          onValueChange={(val, fName) => {
            try {
              const formatted = prettifyJson(val, { indentation: 2, sortKeys: false }) // Auto-format on change
              setSchemaInput(formatted)
              setSchemaError(undefined)
            } catch (err) {
              setSchemaInput(val) // Keep original if invalid
              setSchemaError("Invalid JSON: Cannot format")
            }
            if (fName) setSchemaFileName(fName)
          }}
          placeholder="Paste JSON Schema here..."
          error={schemaError}
          isLoading={schemaLoading}
          fileName={schemaFileName}
          onFileUpload={(e) => handleFileUpload(e, "schema")}
          uploadId="schema-upload"
        />
      ),
    },
    {
      id: "results",
      title: "Validation Results",
      icon: <Shield className="h-4 w-4" />,
      actions: validationResult && (
        <Button variant="ghost" size="icon" onClick={downloadReport} className="h-7 w-7">
          <Download className="h-3.5 w-3.5" />
        </Button>
      ),
      content: (
        <div className="h-full w-full">
          {!validationResult && !isValidating && (
            <ColumnEmptyState
              icon={<Shield className="h-12 w-12" />}
              title="Ready to Validate"
              description="Provide JSON data and schema to validate"
            />
          )}

          {isValidating && <ColumnLoadingState message="Validating JSON against schema..." />}

          {validationResult && !isValidating && (
            <div className="space-y-4 w-full">
              {/* Summary */}
              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  {validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge
                    variant={validationResult.isValid ? "default" : "destructive"}
                    className={`text-xs ${validationResult.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {validationResult.isValid ? "Valid" : "Invalid"}
                  </Badge>
                  {validationResult.detectedDraft && (
                    <Badge variant="outline" className="text-xs">
                      {getDraftDisplayName(validationResult.detectedDraft)}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-red-600">{validationResult.summary.totalErrors}</div>
                    <div className="text-xs text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-yellow-600">{validationResult.summary.totalWarnings}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {validationResult.summary.validatedProperties}/{validationResult.summary.totalProperties}
                    </div>
                    <div className="text-xs text-muted-foreground">Properties</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="text-lg font-bold text-green-600">
                      {validationResult.summary.validationTime.toFixed(1)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">Time</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Validation Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="strict-mode" className="text-xs">
                      Strict Mode
                    </Label>
                    <Switch
                      id="strict-mode"
                      checked={validatorOptions.strict}
                      onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, strict: c }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="all-errors" className="text-xs">
                      Show All Errors
                    </Label>
                    <Switch
                      id="all-errors"
                      checked={validatorOptions.allErrors}
                      onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, allErrors: c }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validate-formats" className="text-xs">
                      Validate Formats
                    </Label>
                    <Switch
                      id="validate-formats"
                      checked={validatorOptions.validateFormats}
                      onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, validateFormats: c }))}
                    />
                  </div>
                </div>
              </div>

              {/* Errors and Warnings */}
              {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    Issues ({validationResult.errors.length + validationResult.warnings.length})
                  </h4>
                  <div className="space-y-1">
                    {[...validationResult.errors, ...validationResult.warnings].map((error, index) => (
                      <Collapsible
                        key={index}
                        open={expandedErrors.has(index)}
                        onOpenChange={() => toggleErrorExpansion(index)}
                      >
                        <CollapsibleTrigger className="w-full text-left p-2 rounded hover:bg-accent transition-colors border flex items-start justify-between text-xs">
                          <div className="flex items-start gap-2 flex-grow min-w-0">
                            {getSeverityIcon(error.severity)}
                            <div className="flex-1 truncate">
                              <span className="font-medium truncate" title={error.message}>
                                {error.message}
                              </span>{" "}
                              <span className="text-muted-foreground truncate">
                                ({error.instancePath || "root"} - {error.keyword})
                              </span>
                            </div>
                            <Badge className={`${getCategoryColor(error.category)} text-xs px-1 py-0.5 shrink-0`}>
                              {error.category}
                            </Badge>
                          </div>
                          {expandedErrors.has(index) ? (
                            <ChevronDown className="h-3 w-3 ml-1 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 ml-1 shrink-0" />
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
                            <code className="bg-muted p-0.5 rounded break-all">{error.schemaLocation || "root"}</code>
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
