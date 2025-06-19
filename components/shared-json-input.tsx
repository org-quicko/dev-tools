"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"

interface SharedJsonInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isValid?: boolean
  showValidation?: boolean
  actions?: React.ReactNode
}

const SharedJsonInput: React.FC<SharedJsonInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  isValid,
  showValidation,
  actions,
}) => {
  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${id}-input`} className="text-xs font-medium text-muted-foreground">
            {label}
          </Label>
          {showValidation && (
            <div className="flex items-center gap-1">
              {isValid ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${isValid ? "text-green-600" : "text-red-600"}`}>
                {isValid ? "Valid JSON" : "Invalid JSON"}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      <Textarea
        id={`${id}-input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-h-0 resize-none font-mono text-xs leading-relaxed"
        style={{ minHeight: "200px" }}
      />
    </div>
  )
}

export default SharedJsonInput
