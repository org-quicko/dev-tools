"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateJson, formatJsonError, type ValidationResult } from "@/lib/json-validation"
import type { JsonComparisonResult } from "@/types/comparison"

interface JsonInputProps {
  value: string
  onValueChange: (newValue: string, fileName?: string) => void
  errorText?: string
  isLoading?: boolean
  placeholder?: string
  highlightedPath?: string | null
  showLineNumbers?: boolean
  comparisonResult?: JsonComparisonResult | null
  side?: "left" | "right"
  responsiveHeight?: string
  className?: string
  textAreaClassName?: string
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
  responsiveHeight = "400px",
  className,
  textAreaClassName,
  readOnly = false,
}: JsonInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const [inlineValidation, setInlineValidation] = useState<ValidationResult>({ isValid: true })
  const [dropError, setDropError] = useState<string | undefined>(undefined) // New state for drag-and-drop errors

  const handleLocalValidation = (jsonText: string) => {
    const result = validateJson(jsonText)
    setInlineValidation(result)
  }

  const handleChange = (newValue: string) => {
    onValueChange(newValue)
    handleLocalValidation(newValue)
    setDropError(undefined) // Clear drop error on manual change
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
    setDropError(undefined) // Clear previous drop error

    try {
      const files = Array.from(e.dataTransfer.files)
      const jsonFile = files.find(
        (file) => file.type === "application/json" || file.name.toLowerCase().endsWith(".json"),
      )

      if (!jsonFile) {
        setDropError("Please drop a valid JSON file (.json).")
        return
      }

      if (jsonFile.size > 10 * 1024 * 1024) {
        setDropError("File size too large. Please select a file smaller than 10MB.")
        return
      }

      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(jsonFile)
      })

      onValueChange(content, jsonFile.name)
      handleLocalValidation(content)
    } catch (err) {
      setDropError("Failed to process dropped file. Please try again.")
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
          }, 100)
        }
      }
    }
  }, [highlightedPath, comparisonResult, side, showLineNumbers, value])

  const renderJsonWithLineNumbers = () => {
    if (!value && value !== "") return null

    const lines = value.split("\n")
    const differences = comparisonResult?.differences || []

    return (
      <div
        className="json-content-container zinc-scrollbar h-full max-h-[70vh] lg:max-h-full overflow-auto"
        ref={scrollAreaRef}
      >
        <div className="json-synchronized-scroll">
          <div className="json-line-numbers-column">
            {lines.map((_, index) => (
              <div key={`line-num-${index}`} className="json-line-number-sync text-xs">
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
                  className={cn("json-content-line-sync text-xs sm:text-sm", bgClass)}
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
  const minHeight = responsiveHeight === "auto" ? "200px" : responsiveHeight

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div
        className={cn(
          "relative flex-grow border-2 border-dashed transition-colors rounded-md overflow-hidden flex flex-col",
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
              <Upload className={cn("h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary", isLoading && "animate-pulse")} />
              <p className="text-xs sm:text-sm font-medium text-primary">
                {isLoading ? "Processing..." : "Drop JSON file here"}
              </p>
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
              "zinc-textarea h-full w-full border-0 bg-transparent zinc-scrollbar resize-none flex-1 text-xs sm:text-sm max-h-[70vh] lg:max-h-full overflow-auto p-2 sm:p-3",
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
        <Alert variant="destructive" className="mt-1 sm:mt-2">
          <AlertDescription className="text-xs">{errorText}</AlertDescription>
        </Alert>
      )}
      {!errorText && !inlineValidation.isValid && inlineValidation.error && (
        <Alert variant="outline" className="mt-1 sm:mt-2 border-yellow-500/50 text-yellow-700 dark:text-yellow-400">
          <AlertDescription className="text-xs">
            {formatJsonError(inlineValidation.error, inlineValidation.lineNumber, inlineValidation.columnNumber)}
          </AlertDescription>
        </Alert>
      )}
      {dropError && (
        <Alert variant="destructive" className="mt-1 sm:mt-2">
          <AlertDescription className="text-xs">{dropError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function syntaxHighlight(text: string): string {
  if (text === null || text === undefined || text === "") return "&nbsp;"

  text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  return text.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-foreground"
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
