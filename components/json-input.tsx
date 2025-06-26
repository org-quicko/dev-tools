"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateJson, formatJsonError, type ValidationResult } from "@/lib/json-validation" // Assuming this is for inline validation display
import type { JsonComparisonResult } from "@/types/comparison" // For highlighting differences

interface JsonInputProps {
  value: string
  onValueChange: (newValue: string, fileName?: string) => void
  errorText?: string // External error to display
  isLoading?: boolean
  placeholder?: string
  highlightedPath?: string | null
  showLineNumbers?: boolean
  comparisonResult?: JsonComparisonResult | null // For diff highlighting
  side?: "left" | "right" // For diff highlighting
  responsiveHeight?: string
  className?: string
  textAreaClassName?: string // Added for more control over textarea style
  readOnly?: boolean
}

export function JsonInput({
  value,
  onValueChange,
  errorText,
  isLoading,
  placeholder,
  highlightedPath,
  showLineNumbers = false,
  comparisonResult,
  side,
  responsiveHeight = "400px", // Default height
  className,
  textAreaClassName,
  readOnly = false,
}: JsonInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Inline validation for immediate feedback (optional, parent can also handle)
  const [inlineValidation, setInlineValidation] = useState<ValidationResult>({ isValid: true })

  const handleLocalValidation = (jsonText: string) => {
    const result = validateJson(jsonText)
    setInlineValidation(result)
    // Parent component will manage primary error state via errorText prop
  }

  const handleChange = (newValue: string) => {
    onValueChange(newValue)
    handleLocalValidation(newValue)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (readOnly) return
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (readOnly) return
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (readOnly) return
    setIsDragOver(false)
    // isLoading state should be managed by parent, passed as prop

    try {
      const files = Array.from(e.dataTransfer.files)
      const jsonFile = files.find(
        (file) => file.type === "application/json" || file.name.toLowerCase().endsWith(".json"),
      )

      if (!jsonFile) {
        // Parent should handle this error display
        console.error("Please drop a valid JSON file.")
        return
      }

      if (jsonFile.size > 10 * 1024 * 1024) {
        // Parent should handle this error display
        console.error("File size too large. Please select a file smaller than 10MB.")
        return
      }

      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(jsonFile)
      })

      onValueChange(content, jsonFile.name) // Pass content and name to parent
      handleLocalValidation(content)
    } catch (err) {
      // Parent should handle this error display
      console.error("Failed to process dropped file. Please try again.")
    }
  }

  useEffect(() => {
    if (highlightedPath && comparisonResult && showLineNumbers && scrollAreaRef.current) {
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
          }, 100) // Timeout to ensure DOM is ready
        }
      }
    }
  }, [highlightedPath, comparisonResult, side, showLineNumbers, value]) // Add value to dependencies

  const renderJsonWithLineNumbers = () => {
    if (!value && value !== "") return null // Allow empty string to render empty editor

    const lines = value.split("\n")
    const differences = comparisonResult?.differences || []

    return (
      <div className="json-content-container zinc-scrollbar h-full" ref={scrollAreaRef}>
        <div className="json-synchronized-scroll">
          <div className="json-line-numbers-column">
            {lines.map((_, index) => (
              <div key={`line-num-${index}`} className="json-line-number-sync">
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
                    bgClass = "bg-green-50 dark:bg-green-900/30 border-l-2 border-green-500"
                    break
                  case "deletion":
                    bgClass = "bg-destructive/5 dark:bg-destructive/10 border-l-2 border-destructive"
                    break
                  case "modification":
                    bgClass = "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500"
                    break
                }
              }

              if (highlightedPath && lineDiff?.path === highlightedPath) {
                bgClass += " !bg-yellow-200 dark:!bg-yellow-700/50 ring-1 ring-yellow-500"
              }

              return (
                <div
                  key={`line-content-${index}`}
                  ref={(el) => {
                    lineRefs.current[lineNumber] = el
                  }}
                  className={cn("json-content-line-sync", bgClass)}
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

  const effectiveHeight = responsiveHeight === "auto" ? "auto" : responsiveHeight
  const minHeight = responsiveHeight === "auto" ? "200px" : responsiveHeight // Ensure a min height for auto

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div
        className={cn(
          "relative flex-grow border-2 border-dashed transition-colors rounded-md overflow-hidden",
          isDragOver && !readOnly ? "border-primary bg-primary/5" : "border-transparent",
          readOnly ? "bg-muted/30" : "bg-background",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ height: effectiveHeight, minHeight }}
      >
        {(isDragOver || isLoading) && !readOnly && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className={cn("h-8 w-8 mx-auto mb-2 text-primary", isLoading && "animate-pulse")} />
              <p className="text-sm font-medium text-primary">{isLoading ? "Processing..." : "Drop JSON file here"}</p>
            </div>
          </div>
        )}

        {showLineNumbers ? (
          <div className="h-full w-full">{renderJsonWithLineNumbers()}</div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder || "Paste JSON here..."}
            className={cn(
              "zinc-textarea h-full w-full border-0 bg-transparent zinc-scrollbar resize-none",
              textAreaClassName,
              readOnly ? "cursor-not-allowed" : "",
            )}
            style={{ lineHeight: "1.6", whiteSpace: "pre", wordWrap: "normal", tabSize: 2 }}
            aria-label={placeholder || "JSON input"}
            readOnly={readOnly}
            disabled={isLoading}
          />
        )}
      </div>
      {errorText && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-xs">{errorText}</AlertDescription>
        </Alert>
      )}
      {!errorText && !inlineValidation.isValid && inlineValidation.error && (
        <Alert variant="outline" className="mt-2 border-yellow-500/50 text-yellow-700 dark:text-yellow-400">
          <AlertDescription className="text-xs">
            {formatJsonError(inlineValidation.error, inlineValidation.lineNumber, inlineValidation.columnNumber)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Basic syntax highlighter (can be expanded or replaced with a library)
function syntaxHighlight(text: string): string {
  if (text === null || text === undefined || text === "") return "&nbsp;" // Ensure empty lines are rendered with correct height

  // Escape HTML special characters
  text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  return text.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-foreground" // Default
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"
      } else if (/\b(true|false)\b/.test(match)) {
        cls = "text-orange-500 dark:text-orange-400"
      } else if (/\bnull\b/.test(match)) {
        cls = "text-purple-600 dark:text-purple-400"
      } else if (/-?\d/.test(match)) {
        cls = "text-teal-600 dark:text-teal-400"
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
}
