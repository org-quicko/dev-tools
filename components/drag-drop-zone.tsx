"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropZoneProps {
  onFileUpload: (content: string, filename: string) => void
  accept?: string
  className?: string
}

export function DragDropZone({ onFileUpload, accept = ".json", className }: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number }>>([])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type === "application/json" || file.name.toLowerCase().endsWith(".json")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          onFileUpload(content, file.name)
          setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size }])
        }
        reader.readAsText(file)
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const clearFiles = () => {
    setUploadedFiles([])
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="p-8 text-center">
          <div
            className={cn(
              "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragOver ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <Upload className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragOver ? "Drop your JSON files here" : "Upload JSON Files"}
          </h3>

          <p className="text-muted-foreground mb-4">Drag and drop your JSON files here, or click to browse</p>

          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Choose Files
          </Button>

          <input id="file-upload" type="file" accept={accept} multiple onChange={handleFileSelect} className="hidden" />
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Uploaded Files</h4>
            <Button variant="ghost" size="sm" onClick={clearFiles}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
