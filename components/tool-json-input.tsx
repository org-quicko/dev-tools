"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Copy, Download, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { JsonInput } from "./json-input"
import { ToolPanel } from "./tool-layout-shell"
import { cn } from "@/lib/utils"

interface ToolJsonInputProps {
  title: string
  icon: React.ReactNode
  value: string
  onValueChange: (value: string, fileName?: string) => void
  fileName?: string
  error?: string
  isLoading?: boolean
  placeholder?: string
  showLineNumbers?: boolean
  comparisonResult?: any
  side?: "left" | "right"
  highlightedPath?: string | null
  onFormat?: () => void
  onDownload?: () => void
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  uploadId: string
  className?: string
  readOnly?: boolean
}

export function ToolJsonInput({
  title,
  icon,
  value,
  onValueChange,
  fileName,
  error,
  isLoading,
  placeholder,
  showLineNumbers = false,
  comparisonResult,
  side,
  highlightedPath,
  onFormat,
  onDownload,
  onFileUpload,
  uploadId,
  className,
  readOnly = false,
}: ToolJsonInputProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!readOnly) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (!readOnly) setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (readOnly) return
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find((file) => file.type === "application/json" || file.name.toLowerCase().endsWith(".json"))

    if (jsonFile) {
      try {
        const content = await jsonFile.text()
        onValueChange(content, jsonFile.name)
      } catch (err) {
        console.error("Failed to read file:", err)
      }
    }
  }

  const actions = (
    <TooltipProvider>
      <>
        {onFormat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onFormat}
                disabled={!value || !!error || readOnly}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Format JSON</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => value && navigator.clipboard.writeText(value)}
              disabled={!value}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDownload} disabled={!value}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        )}
        {onFileUpload && !readOnly && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Label htmlFor={uploadId} className="cursor-pointer inline-flex items-center justify-center">
                  <Upload className="h-3.5 w-3.5" />
                </Label>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload</TooltipContent>
          </Tooltip>
        )}
        {onFileUpload && !readOnly && (
          <input type="file" id={uploadId} accept=".json" className="hidden" onChange={onFileUpload} />
        )}
      </>
    </TooltipProvider>
  )

  const titleWithBadge = (
    <div className="flex items-center gap-2">
      {icon}
      <span className="truncate">{fileName || title}</span>
      {fileName && fileName !== title && (
        <Badge variant="secondary" className="text-xs">
          {fileName}
        </Badge>
      )}
    </div>
  )

  return (
    <ToolPanel title="" className={cn("relative w-full", className)} actions={actions}>
      {/* Custom header with title and badge */}
      <div className="shrink-0 py-3 px-4 border-b bg-background w-full">
        <div className="text-base font-medium">{titleWithBadge}</div>
      </div>

      {/* Input area with drag and drop */}
      <div
        className={cn(
          "flex-1 min-h-0 relative w-full",
          isDragOver && "bg-primary/5 border-primary",
          readOnly && "bg-muted/30",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && !readOnly && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop JSON file here</p>
            </div>
          </div>
        )}

        <JsonInput
          value={value}
          onValueChange={onValueChange}
          errorText={error}
          isLoading={isLoading}
          placeholder={placeholder || `Paste ${title} here...`}
          showLineNumbers={showLineNumbers}
          comparisonResult={comparisonResult}
          side={side}
          highlightedPath={highlightedPath}
          responsiveHeight="100%"
          className="h-full w-full"
          textAreaClassName="p-4"
          readOnly={readOnly}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="shrink-0 p-2 w-full">
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </ToolPanel>
  )
}
