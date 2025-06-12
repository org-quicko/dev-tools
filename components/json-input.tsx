"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateJson, formatJsonError, type ValidationResult } from "@/lib/json-validation"
import { useJsonContext } from "@/contexts/json-context"
import type { JsonComparisonResult } from "@/types/comparison"

interface JsonInputProps {
  target: 1 | 2
  placeholder?: string
  highlightedPath?: string | null
  showLineNumbers?: boolean
  comparisonResult?: JsonComparisonResult | null
  side?: "left" | "right"
  responsiveHeight?: string
  className?: string
  hideControls?: boolean
}

export function JsonInput({
  target,
  placeholder,
  highlightedPath,
  showLineNumbers = false,
  comparisonResult,
  side,
  responsiveHeight = "500px",
  className,
  hideControls = false,
}: JsonInputProps) {
  const { state, setJson, setError, setLoading } = useJsonContext()
  const [isDragOver, setIsDragOver] = useState(false)
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const value = target === 1 ? state.json1 : state.json2
  const fileName = target === 1 ? state.json1Name : state.json2Name
  const error = target === 1 ? state.errors.json1 : state.errors.json2
  const isLoading = target === 1 ? state.isLoading.json1 : state.isLoading.json2

  const handleValidation = (jsonText: string) => {
    const result = validateJson(jsonText)
    setValidation(result)

    if (!result.isValid && result.error) {
      const formattedError = formatJsonError(result.error, result.lineNumber, result.columnNumber)
      setError(target === 1 ? "json1" : "json2", formattedError)
    } else {
      setError(target === 1 ? "json1" : "json2", undefined)
    }
  }

  const handleChange = (newValue: string) => {
    setJson(target, newValue, fileName)
    handleValidation(newValue)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setLoading(target === 1 ? "json1" : "json2", true)

    try {
      const files = Array.from(e.dataTransfer.files)
      const jsonFile = files.find(
        (file) => file.type === "application/json" || file.name.toLowerCase().endsWith(".json"),
      )

      if (!jsonFile) {
        setError(target === 1 ? "json1" : "json2", "Please drop a valid JSON file.")
        return
      }

      if (jsonFile.size > 10 * 1024 * 1024) {
        setError(target === 1 ? "json1" : "json2", "File size too large. Please select a file smaller than 10MB.")
        return
      }

      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(jsonFile)
      })

      try {
        const parsed = JSON.parse(content)
        const formatted = JSON.stringify(parsed, null, 2)
        setJson(target, formatted, jsonFile.name)
        handleValidation(formatted)
      } catch {
        setJson(target, content, jsonFile.name)
        handleValidation(content)
      }
    } catch (err) {
      setError(target === 1 ? "json1" : "json2", "Failed to process dropped file. Please try again.")
    } finally {
      setLoading(target === 1 ? "json1" : "json2", false)
    }
  }

  useEffect(() => {
    if (highlightedPath && comparisonResult && showLineNumbers) {
      const targetDiff = comparisonResult.differences.find((diff) => diff.path === highlightedPath)
      if (targetDiff) {
        const lineNumber = side === "left" ? targetDiff.leftLine : targetDiff.rightLine
        if (lineNumber && lineRefs.current[lineNumber]) {
          setTimeout(() => {
            lineRefs.current[lineNumber]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            })
          }, 100)
        }
      }
    }
  }, [highlightedPath, comparisonResult, side, showLineNumbers])

  const renderJsonWithLineNumbers = () => {
    if (!value.trim()) return null

    const lines = value.split("\n")
    const differences = comparisonResult?.differences || []

    return (
      <div className="json-content-container zinc-scrollbar" ref={scrollAreaRef}>
        <div className="json-synchronized-scroll">
          <div className="json-line-numbers-column">
            {lines.map((_, index) => (
              <div key={index} className="json-line-number-sync">
                {index + 1}
              </div>
            ))}
          </div>

          <div className="json-content-column">
            {lines.map((line, index) => {
              const lineNumber = index + 1
              const lineDiff = differences.find(
                (diff) =>
                  (side === "left" && diff.leftLine === lineNumber) ||
                  (side === "right" && diff.rightLine === lineNumber),
              )

              let bgClass = ""
              if (lineDiff) {
                switch (lineDiff.type) {
                  case "addition":
                    bgClass = "bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500"
                    break
                  case "deletion":
                    bgClass = "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500"
                    break
                  case "modification":
                    bgClass = "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                    break
                }
              }

              if (highlightedPath && lineDiff?.path === highlightedPath) {
                bgClass += " !bg-yellow-200 dark:!bg-yellow-800/50 ring-1 ring-yellow-500"
              }

              return (
                <div
                  key={index}
                  ref={(el) => {
                    lineRefs.current[lineNumber] = el
                  }}
                  className={`json-content-line-sync ${bgClass}`}
                >
                  <span dangerouslySetInnerHTML={{ __html: syntaxHighlight(line) }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const contentHeight = responsiveHeight === "auto" ? "300px" : responsiveHeight

  return (
    <Card className={cn("panel tool-card", className)}>
      <CardContent className="p-0 panel-content">
        <div
          className={cn(
            "relative h-full border-2 border-dashed transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-transparent",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ height: contentHeight }}
        >
          {(isDragOver || isLoading) && (
            <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Upload className={cn("h-8 w-8 mx-auto mb-2 text-primary", isLoading && "animate-pulse")} />
                <p className="text-sm font-medium text-primary">
                  {isLoading ? "Processing file..." : "Drop JSON file here"}
                </p>
              </div>
            </div>
          )}

          {showLineNumbers && value.trim() ? (
            <div className="h-full w-full">{renderJsonWithLineNumbers()}</div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder || `Paste your ${target === 1 ? "first" : "second"} JSON here...`}
              className="zinc-textarea h-full border-0 bg-transparent zinc-scrollbar"
              style={{ lineHeight: "1.5", whiteSpace: "pre", wordWrap: "normal" }}
              aria-label={`JSON input ${target}`}
            />
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="m-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function syntaxHighlight(text: string): string {
  if (!text) return ""

  return text.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = ""
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-blue-600 dark:text-blue-400 font-medium"
        } else {
          cls = "text-green-600 dark:text-green-400"
        }
      } else if (/true|false/.test(match)) {
        cls = "text-orange-600 dark:text-orange-400 font-medium"
      } else if (/null/.test(match)) {
        cls = "text-gray-500 dark:text-gray-400 font-medium"
      } else {
        cls = "text-purple-600 dark:text-purple-400 font-medium"
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
}
