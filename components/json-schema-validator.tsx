"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "./theme-toggle"
import {
  Upload,
  Shield,
  CheckCircle,
  AlertTriangle,
  Home,
  Trash2,
  FileText,
  ExternalLink,
  Info,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import {
  JsonSchemaValidator as LibJsonSchemaValidator,
  type ValidationResult,
  type ValidatorOptions,
} from "@/lib/schema-validator"

export function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState("")
  const [schemaInput, setSchemaInput] = useState("")
  const [jsonFileName, setJsonFileName] = useState("")
  const [schemaFileName, setSchemaFileName] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validatorOptions, setValidatorOptions] = useState<ValidatorOptions>({
    strict: false,
    allErrors: true,
    verbose: true,
    removeAdditional: false,
    useDefaults: false,
    coerceTypes: false,
  })
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set())

  const validateJson = useCallback(async () => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)

    try {
      const validator = new LibJsonSchemaValidator(validatorOptions)
      const result = await validator.validate(jsonInput, schemaInput)
      setValidationResult(result)
    } catch (error) {
      console.error("Validation failed:", error)
      setValidationResult({
        isValid: false,
        errors: [
          {
            instancePath: "",
            schemaPath: "",
            keyword: "validation",
            params: {},
            message: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            severity: "error",
            category: "custom",
            suggestion: "Please check both JSON data and schema for syntax errors",
          },
        ],
        warnings: [],
        summary: {
          totalErrors: 1,
          totalWarnings: 0,
          errorsByCategory: { custom: 1 },
        },
      })
    } finally {
      setIsValidating(false)
    }
  }, [jsonInput, schemaInput, validatorOptions])

  const handleJsonFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })

      setJsonFileName(file.name)
      setJsonInput(content)
    } catch (err) {
      console.error("Failed to read JSON file:", err)
    }

    event.target.value = ""
  }

  const handleSchemaFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })

      setSchemaFileName(file.name)
      setSchemaInput(content)
    } catch (err) {
      console.error("Failed to read schema file:", err)
    }

    event.target.value = ""
  }

  const handleClear = () => {
    setJsonInput("")
    setSchemaInput("")
    setJsonFileName("")
    setSchemaFileName("")
    setValidationResult(null)
    setExpandedErrors(new Set())
  }

  const insertExampleJson = () => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding"],
  "isActive": true,
  "birthDate": "1994-01-15",
  "phone": "+1234567890"
}`
    setJsonInput(example)
  }

  const insertExampleSchema = () => {
    const example = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "address": {
      "type": "object",
      "required": ["street", "city"],
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { 
          "type": "string",
          "format": "postal-code"
        }
      }
    },
    "hobbies": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1
    },
    "isActive": {
      "type": "boolean"
    },
    "birthDate": {
      "type": "string",
      "format": "date"
    },
    "phone": {
      "type": "string",
      "format": "phone"
    }
  },
  "additionalProperties": false
}`
    setSchemaInput(example)
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
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-yellow-500" />
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      required: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      type: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      format: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      pattern: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      enum: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      constraint: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      reference: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      custom: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.custom
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const exportValidationReport = () => {
    if (!validationResult) return

    const report = {
      timestamp: new Date().toISOString(),
      isValid: validationResult.isValid,
      summary: validationResult.summary,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "validation-report.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    JSON Tools
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">JSON Schema Validator</h1>
                    <p className="text-sm text-muted-foreground">Advanced schema validation with detailed reporting</p>
                  </div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="validate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="validate">Validate</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="validate" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* JSON Input */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        JSON Data
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {jsonFileName && (
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                            {jsonFileName}
                          </span>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("json-upload")?.click()}
                            >
                              <Upload className="h-4 w-4" />
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
                      placeholder="Paste your JSON data here..."
                      className="w-full h-80 p-3 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />

                    {!jsonInput && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={insertExampleJson}>
                          <FileText className="h-4 w-4 mr-2" />
                          Insert Example JSON
                        </Button>
                      </div>
                    )}

                    <input
                      id="json-upload"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleJsonFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Schema Input */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        JSON Schema
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {schemaFileName && (
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                            {schemaFileName}
                          </span>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("schema-upload")?.click()}
                            >
                              <Upload className="h-4 w-4" />
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
                      placeholder="Paste your JSON schema here..."
                      className="w-full h-80 p-3 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />

                    {!schemaInput && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={insertExampleSchema}>
                          <Shield className="h-4 w-4 mr-2" />
                          Insert Example Schema
                        </Button>
                      </div>
                    )}

                    <input
                      id="schema-upload"
                      type="file"
                      accept=".json,application/json"
                      onChange={handleSchemaFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Validation Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={validateJson}
                  disabled={!jsonInput.trim() || !schemaInput.trim() || isValidating}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isValidating ? "Validating..." : "Validate JSON"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                {validationResult && (
                  <Button variant="outline" onClick={exportValidationReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                )}
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {validationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        Validation Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {validationResult.isValid ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-700 dark:text-green-300">
                            ✅ JSON is valid against the provided schema!
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Found {validationResult.summary.totalErrors} error
                              {validationResult.summary.totalErrors !== 1 ? "s" : ""}
                              {validationResult.summary.totalWarnings > 0 &&
                                ` and ${validationResult.summary.totalWarnings} warning${
                                  validationResult.summary.totalWarnings !== 1 ? "s" : ""
                                }`}
                            </AlertDescription>
                          </Alert>

                          {/* Error Categories */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(validationResult.summary.errorsByCategory).map(([category, count]) => (
                              <div key={category} className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold">{count}</div>
                                <div className="text-sm text-muted-foreground capitalize">{category}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Errors */}
                  {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Issues</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[...validationResult.errors, ...validationResult.warnings].map((error, index) => (
                            <Collapsible key={index}>
                              <Card className="border-l-4 border-l-red-500">
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-3">
                                        {getSeverityIcon(error.severity)}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getCategoryColor(error.category)}>{error.keyword}</Badge>
                                            {error.lineNumber && (
                                              <Badge variant="outline">Line {error.lineNumber}</Badge>
                                            )}
                                            <Badge variant={error.severity === "error" ? "destructive" : "secondary"}>
                                              {error.severity}
                                            </Badge>
                                          </div>
                                          <p className="text-sm font-medium">{error.message}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Path: {error.instancePath || "root"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            copyToClipboard(error.message)
                                          }}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                        {expandedErrors.has(index) ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </div>
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    <div className="space-y-4 text-sm">
                                      {error.suggestion && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                          <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                                            💡 Suggestion:
                                          </h5>
                                          <p className="text-blue-700 dark:text-blue-300">{error.suggestion}</p>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {error.affectedValue !== undefined && (
                                          <div>
                                            <h5 className="font-medium mb-2">Current Value:</h5>
                                            <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                                              {JSON.stringify(error.affectedValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}

                                        {error.expectedValue !== undefined && (
                                          <div>
                                            <h5 className="font-medium mb-2">Expected:</h5>
                                            <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                                              {JSON.stringify(error.expectedValue, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>

                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <p>
                                          <strong>Schema Path:</strong> {error.schemaPath}
                                        </p>
                                        {error.params && Object.keys(error.params).length > 0 && (
                                          <p>
                                            <strong>Parameters:</strong> {JSON.stringify(error.params)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Card>
                            </Collapsible>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Validation Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="strict-mode">Strict Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable strict schema validation with no unknown keywords
                        </p>
                      </div>
                      <Switch
                        id="strict-mode"
                        checked={validatorOptions.strict}
                        onCheckedChange={(checked) => setValidatorOptions((prev) => ({ ...prev, strict: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="all-errors">Show All Errors</Label>
                        <p className="text-sm text-muted-foreground">
                          Continue validation after first error to show all issues
                        </p>
                      </div>
                      <Switch
                        id="all-errors"
                        checked={validatorOptions.allErrors}
                        onCheckedChange={(checked) => setValidatorOptions((prev) => ({ ...prev, allErrors: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="verbose">Verbose Output</Label>
                        <p className="text-sm text-muted-foreground">Include detailed error information and context</p>
                      </div>
                      <Switch
                        id="verbose"
                        checked={validatorOptions.verbose}
                        onCheckedChange={(checked) => setValidatorOptions((prev) => ({ ...prev, verbose: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="use-defaults">Use Default Values</Label>
                        <p className="text-sm text-muted-foreground">
                          Apply default values from schema during validation
                        </p>
                      </div>
                      <Switch
                        id="use-defaults"
                        checked={validatorOptions.useDefaults}
                        onCheckedChange={(checked) =>
                          setValidatorOptions((prev) => ({ ...prev, useDefaults: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="coerce-types">Type Coercion</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically convert types when possible (e.g., "123" to 123)
                        </p>
                      </div>
                      <Switch
                        id="coerce-types"
                        checked={!!validatorOptions.coerceTypes}
                        onCheckedChange={(checked) =>
                          setValidatorOptions((prev) => ({ ...prev, coerceTypes: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="remove-additional">Remove Additional Properties</Label>
                        <p className="text-sm text-muted-foreground">Remove properties not defined in the schema</p>
                      </div>
                      <Switch
                        id="remove-additional"
                        checked={!!validatorOptions.removeAdditional}
                        onCheckedChange={(checked) =>
                          setValidatorOptions((prev) => ({ ...prev, removeAdditional: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="help" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    JSON Schema Validation Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                      <h4 className="font-semibold mb-3">Supported Features:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• JSON Schema Draft 7, 2019-09, and 2020-12</li>
                        <li>• Type validation (string, number, object, array, boolean, null)</li>
                        <li>• Format validation (email, date, uri, uuid, ipv4, ipv6, etc.)</li>
                        <li>• Custom formats (phone, credit-card, postal-code)</li>
                        <li>• Required properties and dependencies</li>
                        <li>• Min/max constraints for length, value, items, properties</li>
                        <li>• Pattern matching with regular expressions</li>
                        <li>• Enum validation with predefined values</li>
                        <li>• Conditional schemas (if/then/else)</li>
                        <li>• Schema composition (allOf, anyOf, oneOf, not)</li>
                        <li>• Reference resolution ($ref)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Error Categories:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>
                          <strong>Required:</strong> Missing required properties
                        </li>
                        <li>
                          <strong>Type:</strong> Data type mismatches
                        </li>
                        <li>
                          <strong>Format:</strong> Invalid format patterns
                        </li>
                        <li>
                          <strong>Pattern:</strong> Regular expression mismatches
                        </li>
                        <li>
                          <strong>Enum:</strong> Value not in allowed list
                        </li>
                        <li>
                          <strong>Constraint:</strong> Min/max violations
                        </li>
                        <li>
                          <strong>Reference:</strong> Schema reference issues
                        </li>
                        <li>
                          <strong>Custom:</strong> Other validation errors
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Quick Tips:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• Use example buttons to get started quickly</li>
                        <li>• Upload files directly or paste JSON content</li>
                        <li>• Error messages include line numbers when possible</li>
                        <li>• Click on errors to see detailed information</li>
                      </ul>
                      <ul className="space-y-1">
                        <li>• All validation happens client-side for privacy</li>
                        <li>• Export validation reports for documentation</li>
                        <li>• Adjust settings for different validation modes</li>
                        <li>• Copy error messages for easy sharing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Learn more about JSON Schema at{" "}
                      <a
                        href="https://json-schema.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        json-schema.org
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
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
