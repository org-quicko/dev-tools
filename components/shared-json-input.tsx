"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { JsonInput } from "./json-input"
import { Upload, Copy, Download, Sparkles, FileJson } from "lucide-react"

interface SharedJsonInputProps {
  value: string
  onValueChange: (value: string, fileName?: string) => void
  placeholder: string
  error?: string
  isLoading?: boolean
  fileName?: string
  showLineNumbers?: boolean
  onFormat?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  uploadId: string
  className?: string
  comparisonResult?: any
  side?: "left" | "right"
  highlightedPath?: string | null
}

export function SharedJsonInput({
  value,
  onValueChange,
  placeholder,
  error,
  isLoading,
  fileName,
  showLineNumbers = true,
  onFormat,
  onCopy,
  onDownload,
  onFileUpload,
  uploadId,
  className,
  comparisonResult,
  side,
  highlightedPath,
}: SharedJsonInputProps) {
  return (
    <div className="h-full flex flex-col">
      {/* File name indicator */}
      {fileName && (
        <div className="mb-2 px-2 py-1 bg-muted/50 rounded-md border">
          <div className="flex items-center gap-2 text-xs">
            <FileJson className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-muted-foreground truncate">{fileName}</span>
          </div>
        </div>
      )}

      {/* JSON Input */}
      <div className="flex-1 min-h-0">
        <JsonInput
          value={value}
          onValueChange={onValueChange}
          errorText={error}
          isLoading={isLoading}
          placeholder={placeholder}
          showLineNumbers={showLineNumbers}
          comparisonResult={comparisonResult}
          side={side}
          highlightedPath={highlightedPath}
          responsiveHeight="100%"
          className={`h-full ${className}`}
          textAreaClassName="p-2 text-sm font-mono resize-none"
        />
      </div>

      {/* Hidden file input */}
      <input id={uploadId} type="file" accept=".json,application/json" onChange={onFileUpload} className="hidden" />
    </div>
  )
}

// Action buttons component for column headers
export function JsonInputActions({
  onFormat,
  onCopy,
  onDownload,
  onUpload,
  disabled = false,
}: {
  onFormat?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onUpload?: () => void
  disabled?: boolean
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {onFormat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onFormat} disabled={disabled} className="h-6 w-6">
                <Sparkles className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Format JSON</TooltipContent>
          </Tooltip>
        )}
        {onCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onCopy} disabled={disabled} className="h-6 w-6">
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
        )}
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onDownload} disabled={disabled} className="h-6 w-6">
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        )}
        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUpload} className="h-6 w-6">
                <Upload className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
