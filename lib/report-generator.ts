import type { JsonComparisonResult } from "@/types/comparison"

export interface ReportRow {
  changeType: string
  jsonPath: string
  key: string
  json1Line?: number
  json1Value: string
  json2Line?: number
  json2Value: string
}

export interface ReportConfig {
  json1Name?: string
  json2Name?: string
  includeLineNumbers?: boolean
}

export function generateReportData(result: JsonComparisonResult, config: ReportConfig = {}): ReportRow[] {
  const { json1Name = "JSON 1", json2Name = "JSON 2", includeLineNumbers = true } = config

  const reportRows: ReportRow[] = []

  for (const diff of result.differences) {
    const row: ReportRow = {
      changeType: capitalizeChangeType(diff.type),
      jsonPath: diff.path,
      key: extractKeyFromPath(diff.path),
      json1Value: formatValue(diff.oldValue),
      json2Value: formatValue(diff.newValue),
    }

    // Add line numbers if available and requested
    if (includeLineNumbers) {
      if (diff.leftLine) row.json1Line = diff.leftLine
      if (diff.rightLine) row.json2Line = diff.rightLine
    }

    reportRows.push(row)
  }

  return reportRows
}

export function generateReportHeaders(config: ReportConfig = {}): string[] {
  const { json1Name = "JSON 1", json2Name = "JSON 2", includeLineNumbers = true } = config

  const headers = ["Change Type", "JSON Path", "Key"]

  if (includeLineNumbers) {
    headers.push("JSON 1 Line")
  }

  headers.push(`JSON 1 (${getDisplayName(json1Name)})`)

  if (includeLineNumbers) {
    headers.push("JSON 2 Line")
  }

  headers.push(`JSON 2 (${getDisplayName(json2Name)})`)

  return headers
}

export function generateSummaryData(result: JsonComparisonResult): {
  totalDifferences: number
  additions: number
  deletions: number
  modifications: number
  topLevelBreakdown: Record<string, { additions: number; deletions: number; modifications: number }>
} {
  const { additions, deletions, modifications } = result.summary
  const totalDifferences = result.differences.length

  // Group by top-level path
  const topLevelBreakdown: Record<string, { additions: number; deletions: number; modifications: number }> = {}

  for (const diff of result.differences) {
    const topLevel = getTopLevelPath(diff.path)

    if (!topLevelBreakdown[topLevel]) {
      topLevelBreakdown[topLevel] = { additions: 0, deletions: 0, modifications: 0 }
    }

    switch (diff.type) {
      case "addition":
        topLevelBreakdown[topLevel].additions++
        break
      case "deletion":
        topLevelBreakdown[topLevel].deletions++
        break
      case "modification":
        topLevelBreakdown[topLevel].modifications++
        break
    }
  }

  return {
    totalDifferences,
    additions,
    deletions,
    modifications,
    topLevelBreakdown,
  }
}

// Helper functions
function capitalizeChangeType(type: string): string {
  switch (type) {
    case "addition":
      return "Addition"
    case "deletion":
      return "Deletion"
    case "modification":
      return "Modification"
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

function extractKeyFromPath(path: string): string {
  // Handle array indices: items[2].name -> name
  // Handle object properties: user.address.street -> street
  const segments = path.split(".")
  const lastSegment = segments[segments.length - 1]

  // Remove array brackets if present
  return lastSegment.replace(/\[\d+\]$/, "")
}

function formatValue(value: any): string {
  if (value === null) return "null"
  if (value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function getDisplayName(fileName: string): string {
  if (!fileName) return "Unknown"

  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")

  // If it's still a generic name, return as is
  if (nameWithoutExt === "JSON 1" || nameWithoutExt === "JSON 2") {
    return nameWithoutExt
  }

  // Return the clean filename
  return nameWithoutExt
}

function getTopLevelPath(path: string): string {
  const firstDot = path.indexOf(".")
  const firstBracket = path.indexOf("[")

  if (firstDot === -1 && firstBracket === -1) {
    return path
  }

  if (firstDot === -1) {
    return path.substring(0, firstBracket)
  }

  if (firstBracket === -1) {
    return path.substring(0, firstDot)
  }

  return path.substring(0, Math.min(firstDot, firstBracket))
}
