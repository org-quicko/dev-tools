"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface FileValidationProps {
  filename: string
  content: string
  isValid: boolean
  error?: string
  size: number
}

export function FileValidation({ filename, content, isValid, error, size }: FileValidationProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getValidationIcon = () => {
    if (isValid) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (error) return <XCircle className="h-4 w-4 text-red-500" />
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const getValidationVariant = () => {
    if (isValid) return "default"
    if (error) return "destructive"
    return "secondary"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getValidationIcon()}
          <span className="text-sm font-medium">{filename}</span>
          <Badge variant="outline" className="text-xs">
            {formatFileSize(size)}
          </Badge>
        </div>
        <Badge variant={getValidationVariant()}>{isValid ? "Valid JSON" : "Invalid"}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {isValid && (
        <div className="text-xs text-muted-foreground">
          Successfully loaded {Object.keys(JSON.parse(content)).length} root properties
        </div>
      )}
    </div>
  )
}
