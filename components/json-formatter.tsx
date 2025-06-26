"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy, Upload, FileText, Settings, CheckCircle, AlertTriangle, Trash2, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { prettifyJson } from "@/lib/json-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JsonSyntaxHighlighter } from "@/components/json-syntax-highlighter"

interface FormatterSettings {
  indentation: number
  sortKeys: boolean
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

  // Removed useRef and useEffect for auto-resizing as scrolling is now handled by main window

  const validateAndFormat = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setFormattedJson("")
        setError(null)
        setIsValid(false)
        return
      }
      try {
        const formatted = prettifyJson(input, settings)
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

  const handleInputChange = (value: string) => {
    setJsonInput(value)
    validateAndFormat(value)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setFileName("example.json")
  }

  // Get display names for headers
  const inputDisplayName = fileName || "JSON Input"
  const outputDisplayName = fileName ? fileName.replace(/\.[^/.]+$/, "-formatted.json") : "Formatted JSON"

  return (
    <TooltipProvider>
      <div className="tool-container">
        {/* Settings Button */}
        <div className="flex justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Formatting Options
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Formatting Options</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
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
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* JSON Statistics */}
        <Card className="tool-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg">JSON Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {isValid && formattedJson ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">{formattedJson.length.toLocaleString()}</div>
                  <div className="text-muted-foreground">Characters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">
                    {formattedJson.split("\n").length.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Lines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold">
                    {(new Blob([formattedJson]).size / 1024).toFixed(2)} KB
                  </div>
                  <div className="text-muted-foreground">Size</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Statistics will appear when JSON is formatted.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* JSON Input */}
          <Card className="tool-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{inputDisplayName}</span>
                  {isValid && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Valid</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="h-7 w-7"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload JSON file</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleClear} className="h-7 w-7">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col p-4 pt-0">
              <div className="relative flex-1">
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste your JSON here or upload a file..."
                  className="zinc-textarea w-full font-mono text-sm resize-none border rounded-lg p-3 bg-background text-foreground min-h-[400px]"
                  // Removed overflowY: "auto" and overflowY: "hidden"
                />
                {!jsonInput && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground pointer-events-none">
                    <Button variant="outline" onClick={insertExample} className="pointer-events-auto">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Insert Example JSON
                    </Button>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              {error && (
                <Alert variant="destructive" className="mt-4 zinc-alert zinc-alert-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Formatted JSON */}
          <Card className="tool-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{outputDisplayName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        disabled={!formattedJson}
                        className="h-7 w-7"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy to clipboard</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        disabled={!formattedJson}
                        className="h-7 w-7"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download formatted JSON</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col p-4 pt-0">
              {formattedJson ? (
                <JsonSyntaxHighlighter
                  json={formattedJson}
                  className="w-full font-mono text-sm border rounded-lg p-3 min-h-[400px] overflow-x-auto"
                  // Removed overflowY: "auto" and maxHeight
                />
              ) : (
                <div
                  className="w-full p-3 font-mono text-sm border rounded-lg bg-background text-muted-foreground flex items-center justify-center min-h-[400px]"
                  // Removed overflowY: "auto"
                >
                  Formatted JSON will appear here...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
