"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Removed ThemeToggle import as it's in AppHeaderNav
import { Download, Copy, Upload, FileText, Settings, CheckCircle, AlertTriangle, Trash2, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link" // Keep for internal links if any, like to comparator

interface FormatterSettings {
  indentation: number
  sortKeys: boolean
  // removeComments and removeWhitespace were not used in the UI, keeping for potential future use
}

export function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState("")
  const [formattedJson, setFormattedJson] = useState("")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [settings, setSettings] = useState<FormatterSettings>({
    indentation: 2,
    sortKeys: false,
  })

  const validateAndFormat = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setFormattedJson("")
        setError(null)
        setIsValid(false)
        return
      }
      try {
        const parsed = JSON.parse(input)
        let processedData = parsed
        if (settings.sortKeys) {
          processedData = sortObjectKeys(parsed)
        }
        const formatted = JSON.stringify(processedData, null, settings.indentation)
        setFormattedJson(formatted)
        setError(null)
        setIsValid(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON format")
        setFormattedJson("")
        setIsValid(false)
      }
    },
    [settings],
  )

  const sortObjectKeys = (obj: any): any => {
    // Implementation remains the same
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj !== null && typeof obj === "object") {
      const sorted: any = {}
      Object.keys(obj)
        .sort()
        .forEach((key) => {
          sorted[key] = sortObjectKeys(obj[key])
        })
      return sorted
    }
    return obj
  }

  const handleInputChange = (value: string) => {
    setJsonInput(value)
    validateAndFormat(value)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation remains the same
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })
      setFileName(file.name)
      setJsonInput(content)
      validateAndFormat(content)
    } catch (err) {
      setError("Failed to read file. Please try again.")
    }
    event.target.value = ""
  }

  const handleDownload = () => {
    if (!formattedJson) return

    const blob = new Blob([formattedJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName ? fileName.replace(/\.[^/.]+$/, "-formatted.json") : "formatted.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!formattedJson) return

    try {
      await navigator.clipboard.writeText(formattedJson)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const handleClear = () => {
    setJsonInput("")
    setFormattedJson("")
    setFileName("")
    setError(null)
    setIsValid(false)
  }

  const insertExample = () => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "isActive": true,
  "metadata": {
    "created": "2024-01-01T00:00:00Z",
    "updated": "2024-01-15T10:30:00Z"
  }
}`
    setJsonInput(example)
    validateAndFormat(example)
  }

  return (
    <TooltipProvider>
      {/* Removed the tool-specific header. AppLayout provides the header. */}
      <div className="tool-container">
        {" "}
        {/* Use consistent container class */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="tool-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {" "}
                    {/* Adjusted size */}
                    <Upload className="h-5 w-5" />
                    JSON Input
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {fileName && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{fileName}</span>
                    )}
                    {isValid && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Valid JSON</span>
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon" // Changed to icon for compactness
                          onClick={() => document.getElementById("file-upload")?.click()}
                          className="h-8 w-8"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Upload JSON file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleClear} className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear all</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste your JSON here or upload a file..."
                  className="zinc-textarea h-96 font-mono text-sm" // Applied zinc-textarea
                />
                {!jsonInput && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={insertExample}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Insert Example JSON
                    </Button>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive" className="mt-4 zinc-alert zinc-alert-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="tool-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Formatted JSON
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopy}
                          disabled={!formattedJson}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleDownload}
                          disabled={!formattedJson}
                          className="h-8 w-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download formatted JSON</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="zinc-scrollbar w-full h-96 p-3 font-mono text-sm border rounded-lg overflow-auto bg-muted/30">
                  {formattedJson || "Formatted JSON will appear here..."}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Formatting Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="indentation">Indentation</Label>
                  <Select
                    value={settings.indentation.toString()}
                    onValueChange={(value) => {
                      const newSettings = { ...settings, indentation: Number.parseInt(value) }
                      setSettings(newSettings)
                      if (jsonInput) validateAndFormat(jsonInput)
                    }}
                  >
                    <SelectTrigger className="zinc-input">
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
                  <div className="space-y-1">
                    <Label htmlFor="sort-keys">Sort Keys Alphabetically</Label>
                    <p className="text-xs text-muted-foreground">Organize object properties in alphabetical order.</p>
                  </div>
                  <Switch
                    id="sort-keys"
                    checked={settings.sortKeys}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, sortKeys: checked }
                      setSettings(newSettings)
                      if (jsonInput) validateAndFormat(jsonInput)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="text-lg">JSON Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isValid && formattedJson ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Characters:</span>
                      <span className="font-mono">{formattedJson.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lines:</span>
                      <span className="font-mono">{formattedJson.split("\n").length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-mono">{(new Blob([formattedJson]).size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Statistics will appear when JSON is formatted.</p>
                )}
              </CardContent>
            </Card>
            <Card className="tool-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={insertExample}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Insert Example
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                <Link href="/comparator" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" /> {/* Consider GitCompare icon */}
                    Compare JSON
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
