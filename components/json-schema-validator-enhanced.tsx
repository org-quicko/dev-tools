"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Info,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SharedThreeColumnLayout, ColumnEmptyState, ColumnLoadingState } from "./shared-three-column-layout"
import { SharedJsonInput, JsonInputActions } from "./shared-json-input"
import { useDebounce } from "@/hooks/use-debounce"
import {
  EnhancedJsonSchemaValidator,
  type ValidationResult,
  type ValidatorOptions,
  type SchemaDraft,
} from "@/lib/schema-validator-enhanced"

// Example schema for new users
const EXAMPLE_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The user's full name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "The user's email address"
    },
    "age": {
      "type": "integer",
      "minimum": 18,
      "description": "User's age in years"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^\\d{5}(-\\d{4})?$" }
      },
      "required": ["street", "city"]
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["name", "email"]
}`

const EXAMPLE_JSON = `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  },
  "tags": ["user", "premium"]
}`

export function JsonSchemaValidatorEnhanced() {
  // State
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
  const [realTimeValidation, setRealTimeValidation] = useState(true)
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())

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

  const [validator] = useState(() => new EnhancedJsonSchemaValidator(validatorOptions))

  const debouncedJsonInput = useDebounce(jsonInput, 500)
  const debouncedSchemaInput = useDebounce(schemaInput, 500)

  // Validation logic
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
      // Re-initialize validator with current options
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
    if (!realTimeValidation) return
    const timeoutId = setTimeout(() => {
      validateJsonCallback()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [debouncedJsonInput, debouncedSchemaInput, realTimeValidation, validateJsonCallback])

  // Event handlers
  const handleJsonChange = (value: string, fileName?: string) => {
    setJsonInput(value)
    if (fileName) setJsonFileName(fileName)
    setJsonError(undefined)
  }

  const handleSchemaChange = (value: string, fileName?: string) => {
    setSchemaInput(value)
    if (fileName) setSchemaFileName(fileName)
    setSchemaError(undefined)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "json" | "schema") => {
    const file = event.target.files?.[0]
    if (!file) return

    const setLoading = type === "json" ? setJsonLoading : setSchemaLoading
    setLoading(true)

    try {
      const content = await file.text()
      if (type === "json") {
        handleJsonChange(content, file.name)
      } else {
        handleSchemaChange(content, file.name)
      }
    } catch (err) {
      const setError = type === "json" ? setJsonError : setSchemaError
      setError("Failed to read file.")
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  const handleClearAll = () => {
    setJsonInput("")
    setSchemaInput("")
    setJsonFileName("")
    setSchemaFileName("")
    setValidationResult(null)
    setJsonError(undefined)
    setSchemaError(undefined)
    setExpandedErrors(new Set())
  }

  const loadExample = () => {
    setJsonInput(EXAMPLE_JSON)
    setSchemaInput(EXAMPLE_SCHEMA)
    setJsonFileName("example.json")
    setSchemaFileName("example-schema.json")
    setJsonError(undefined)
    setSchemaError(undefined)
  }

  const toggleErrorExpansion = (index: number) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) newSet.delete(index)
      else newSet.add(index)
      return newSet
    })
  }

  // Helper functions
  const getSeverityIcon = (severity: "error" | "warning") =>
    severity === "error" ? (
      <AlertCircle className="h-3 w-3 text-red-500" />
    ) : (
      <AlertTriangle className="h-3 w-3 text-yellow-500" />
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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={validateJsonCallback}
          disabled={isValidating || (!jsonInput.trim() && !schemaInput.trim())}
          className="bg-green-600 hover:bg-green-700"
        >
          <Shield className="h-4 w-4 mr-2" />
          {isValidating ? "Validating..." : "Validate"}
        </Button>
        <div className="flex items-center gap-2">
          <Switch id="real-time" checked={realTimeValidation} onCheckedChange={setRealTimeValidation} />
          <Label htmlFor="real-time" className="text-sm">
            Real-time
          </Label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={validatorOptions.draft}
          onValueChange={(value: SchemaDraft) => setValidatorOptions({ ...validatorOptions, draft: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Schema draft" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="draft-07">Draft 7</SelectItem>
            <SelectItem value="2019-09">2019-09</SelectItem>
            <SelectItem value="2020-12">2020-12</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  )

  // Left column (JSON)
  const leftColumn = {
    id: "json",
    title: jsonFileName || "JSON Data",
    icon: <FileJson className="h-4 w-4" />,
    actions: (
      <JsonInputActions
        onCopy={() => jsonInput && navigator.clipboard.writeText(jsonInput)}
        onUpload={() => document.getElementById("json-upload")?.click()}
        disabled={!jsonInput}
      />
    ),
    content: (
      <SharedJsonInput
        value={jsonInput}
        onValueChange={handleJsonChange}
        placeholder="Paste your JSON data here..."
        error={jsonError}
        isLoading={jsonLoading}
        fileName={jsonFileName}
        onFileUpload={(e) => handleFileUpload(e, "json")}
        uploadId="json-upload"
      />
    ),
  }

  // Middle column (Schema)
  const middleColumn = {
    id: "schema",
    title: schemaFileName || "JSON Schema",
    icon: <Shield className="h-4 w-4" />,
    actions: (
      <JsonInputActions
        onCopy={() => schemaInput && navigator.clipboard.writeText(schemaInput)}
        onUpload={() => document.getElementById("schema-upload")?.click()}
        disabled={!schemaInput}
      />
    ),
    content: (
      <SharedJsonInput
        value={schemaInput}
        onValueChange={handleSchemaChange}
        placeholder="Paste your JSON Schema here..."
        error={schemaError}
        isLoading={schemaLoading}
        fileName={schemaFileName}
        onFileUpload={(e) => handleFileUpload(e, "schema")}
        uploadId="schema-upload"
      />
    ),
  }

  // Right column (Results)
  const rightColumn = {
    id: "results",
    title: "Validation Results",
    icon: <Shield className="h-4 w-4" />,
    content: (
      <div className="h-full">
        {!validationResult && !isValidating && (
          <ColumnEmptyState
            icon={<Info className="h-12 w-12" />}
            title="Ready to Validate"
            description="Input JSON and Schema to validate"
            action={
              <Button variant="outline" onClick={loadExample}>
                <FileJson className="h-4 w-4 mr-2" />
                Load Example
              </Button>
            }
          />
        )}

        {isValidating && <ColumnLoadingState message="Validating JSON against schema..." />}

        {validationResult && !isValidating && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              {validationResult.isValid ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">JSON is valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {validationResult.errors.length} error{validationResult.errors.length !== 1 && "s"} found
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3">
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

              {validationResult.detectedDraft && (
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Detected Schema: </span>
                  <Badge variant="outline" className="ml-1">
                    {getDraftDisplayName(validationResult.detectedDraft)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Validation Options</h4>
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
                  <Label htmlFor="validate-formats" className="text-xs">
                    Validate Formats
                  </Label>
                  <Switch
                    id="validate-formats"
                    checked={validatorOptions.validateFormats}
                    onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, validateFormats: c }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="coerce-types" className="text-xs">
                    Coerce Types
                  </Label>
                  <Switch
                    id="coerce-types"
                    checked={!!validatorOptions.coerceTypes}
                    onCheckedChange={(c) => setValidatorOptions((o) => ({ ...o, coerceTypes: c }))}
                  />
                </div>
              </div>
            </div>

            {/* Errors List */}
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
                      <CollapsibleTrigger className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 flex-grow min-w-0">
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
                          <ChevronDown className="h-3 w-3 ml-1 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3 w-3 ml-1 shrink-0" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 text-xs border border-t-0 rounded-b-md bg-background space-y-1">
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
  }

  return (
    <TooltipProvider>
      <SharedThreeColumnLayout
        toolTitle="JSON Schema Validator"
        toolIcon={<Shield className="h-6 w-6" />}
        toolDescription="Validate JSON data against JSON Schema"
        leftColumn={leftColumn}
        middleColumn={middleColumn}
        rightColumn={rightColumn}
        topControls={topControls}
      />
    </TooltipProvider>
  )
}
