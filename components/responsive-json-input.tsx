"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { JsonInput } from "./json-input"
import { Upload, Copy, Download, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonInputActionsProps {
  onFormat?: () => void
  onCopy?: () => void
  onDownload?: () => void
  onUpload?: () => void
  disabled?: boolean
  className?: string
}

export function JsonInputActions({
  onFormat,
  onCopy,
  onDownload,
  onUpload,
  disabled,
  className,
}: JsonInputActionsProps) {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {onFormat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onFormat} disabled={disabled} className="h-7 w-7 shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Format JSON</TooltipContent>
          </Tooltip>
        )}
        {onCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onCopy} disabled={disabled} className="h-7 w-7 shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
        )}
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onDownload} disabled={disabled} className="h-7 w-7 shrink-0">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        )}
        {onUpload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUpload} className="h-7 w-7 shrink-0">
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

interface ResponsiveJsonInputProps {
  value: string
  onValueChange: (value: string, fileName?: string) => void
  placeholder?: string
  error?: string
  isLoading?: boolean
  fileName?: string
  comparisonResult?: any
  side?: "left" | "right"
  highlightedPath?: string | null
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  uploadId?: string
  className?: string
}

export function ResponsiveJsonInput({
  value,
  onValueChange,
  placeholder = "Paste JSON here...",
  error,
  isLoading,
  fileName,
  comparisonResult,
  side,
  highlightedPath,
  onFileUpload,
  uploadId,
  className,
}: ResponsiveJsonInputProps) {
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <JsonInput
        value={value}
        onValueChange={onValueChange}
        errorText={error}
        isLoading={isLoading}
        placeholder={placeholder}
        showLineNumbers={true}
        comparisonResult={comparisonResult}
        side={side}
        highlightedPath={highlightedPath}
        responsiveHeight="100%"
        className="w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]"
        textAreaClassName="p-3 text-sm font-mono resize-none"
      />
      {onFileUpload && uploadId && (
        <input id={uploadId} type="file" accept=".json,application/json" onChange={onFileUpload} className="hidden" />
      )}
    </div>
  )
}
