"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  Database,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Trash2,
  Play,
  Pause,
  Clock,
  TrendingUp,
} from "lucide-react"
import type { BatchValidationResult, ValidatorOptions } from "@/lib/schema-validator-enhanced"

interface BatchValidationProps {
  onValidate: (
    files: Array<{ name: string; content: string }>,
    options: ValidatorOptions,
  ) => Promise<BatchValidationResult[]>
  schema: string
  options: ValidatorOptions
}

interface FileItem {
  id: string
  name: string
  content: string
  size: number
  status: "pending" | "validating" | "completed" | "error"
  result?: BatchValidationResult
}

export function BatchValidation({ onValidate, schema, options }: BatchValidationProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<BatchValidationResult[]>([])
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])

    const newFiles: FileItem[] = await Promise.all(
      uploadedFiles.map(async (file) => {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error("Failed to read file"))
          reader.readAsText(file)
        })

        return {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          content,
          size: file.size,
          status: "pending" as const,
        }
      }),
    )

    setFiles((prev) => [...prev, ...newFiles])
    event.target.value = ""
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }, [])

  const clearAllFiles = useCallback(() => {
    setFiles([])
    setResults([])
    setProgress(0)
  }, [])

  const startValidation = useCallback(async () => {
    if (!schema.trim() || files.length === 0) return

    setIsValidating(true)
    setProgress(0)
    setActiveTab("results")

    try {
      const fileData = files.map((file) => ({
        name: file.name,
        content: file.content,
      }))

      // Update file statuses to validating
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "validating" as const,
        })),
      )

      const validationResults = await onValidate(fileData, options)
      setResults(validationResults)

      // Update file statuses based on results
      setFiles((prev) =>
        prev.map((file) => {
          const result = validationResults.find((r) => r.fileName === file.name)
          return {
            ...file,
            status: result ? "completed" : "error",
            result,
          }
        }),
      )

      setProgress(100)
    } catch (error) {
      console.error("Batch validation failed:", error)
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "error" as const,
        })),
      )
    } finally {
      setIsValidating(false)
    }
  }, [schema, files, options, onValidate])

  const exportResults = useCallback(() => {
    if (results.length === 0) return

    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      validFiles: results.filter((r) => r.result.isValid).length,
      invalidFiles: results.filter((r) => !r.result.isValid).length,
      totalErrors: results.reduce((sum, r) => sum + r.result.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.result.warnings.length, 0),
      averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
      results: results,
      options,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `batch-validation-report-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results, options])

  const getStatusIcon = (status: FileItem["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "validating":
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: FileItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      case "validating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    }
  }

  const validFiles = results.filter((r) => r.result.isValid).length
  const invalidFiles = results.filter((r) => !r.result.isValid).length
  const totalErrors = results.reduce((sum, r) => sum + r.result.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.result.warnings.length, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Batch Validation
            {files.length > 0 && (
              <Badge variant="outline">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="queue">Validation Queue</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload JSON/YAML Files</p>
                  <p className="text-sm text-muted-foreground">
                    Select multiple files to validate against the same schema
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => document.getElementById("batch-file-upload")?.click()}
                    disabled={!schema.trim()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  {!schema.trim() && <p className="text-sm text-red-500 mt-2">Please add a schema first</p>}
                </div>
                <input
                  id="batch-file-upload"
                  type="file"
                  multiple
                  accept=".json,.yaml,.yml,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                    <Button variant="outline" size="sm" onClick={clearAllFiles}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={isValidating}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Validation Queue</h4>
                <div className="flex items-center gap-2">
                  <Button onClick={startValidation} disabled={!schema.trim() || files.length === 0 || isValidating}>
                    {isValidating ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Validation
                      </>
                    )}
                  </Button>
                  {results.length > 0 && (
                    <Button variant="outline" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  )}
                </div>
              </div>

              {isValidating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Validation Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                        {file.result && (
                          <Badge variant={file.result.result.isValid ? "default" : "destructive"}>
                            {file.result.result.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No validation results yet</p>
                  <p className="text-sm text-muted-foreground">Upload files and run validation to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Batch Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{validFiles}</div>
                          <div className="text-sm text-muted-foreground">Valid Files</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{invalidFiles}</div>
                          <div className="text-sm text-muted-foreground">Invalid Files</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalErrors}</div>
                          <div className="text-sm text-muted-foreground">Total Errors</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalWarnings}</div>
                          <div className="text-sm text-muted-foreground">Total Warnings</div>
                        </div>
                      </div>

                      {results.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            Average processing time:{" "}
                            <span className="font-medium">
                              {(results.reduce((sum, r) => sum + r.processingTime, 0) / results.length).toFixed(1)}ms
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-4">
                          {results.map((result, index) => (
                            <Card key={index} className="border-l-4 border-l-muted">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {result.result.isValid ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <AlertTriangle className="h-5 w-5 text-red-500" />
                                    )}
                                    <span className="font-medium">{result.fileName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={result.result.isValid ? "default" : "destructive"}>
                                      {result.result.isValid ? "Valid" : "Invalid"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {result.processingTime.toFixed(1)}ms
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                {result.result.isValid ? (
                                  <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription className="text-green-700 dark:text-green-300">
                                      File is valid against the schema
                                    </AlertDescription>
                                  </Alert>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                      <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded">
                                        <div className="font-bold text-red-600 dark:text-red-400">
                                          {result.result.errors.length}
                                        </div>
                                        <div className="text-muted-foreground">Errors</div>
                                      </div>
                                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                                        <div className="font-bold text-yellow-600 dark:text-yellow-400">
                                          {result.result.warnings.length}
                                        </div>
                                        <div className="text-muted-foreground">Warnings</div>
                                      </div>
                                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                                        <div className="font-bold text-blue-600 dark:text-blue-400">
                                          {result.result.summary.validationTime.toFixed(1)}ms
                                        </div>
                                        <div className="text-muted-foreground">Time</div>
                                      </div>
                                    </div>

                                    {result.result.errors.length > 0 && (
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-red-600 dark:text-red-400">Top Errors:</h5>
                                        {result.result.errors.slice(0, 3).map((error, errorIndex) => (
                                          <div
                                            key={errorIndex}
                                            className="p-2 bg-red-50 dark:bg-red-950/30 rounded text-sm"
                                          >
                                            <div className="font-medium">{error.message}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Path: {error.dataLocation || "root"}
                                            </div>
                                          </div>
                                        ))}
                                        {result.result.errors.length > 3 && (
                                          <div className="text-xs text-muted-foreground">
                                            +{result.result.errors.length - 3} more errors
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
