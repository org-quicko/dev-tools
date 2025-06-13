import type { JsonComparisonResult } from "@/types/comparison"

export interface ReportConfig {
  json1Name?: string
  json2Name?: string
  includeLineNumbers?: boolean
}

export interface ReportRow {
  changeType: string
  jsonPath: string
  key: string
  json1Line?: number | string
  json1Value: string
  json2Line?: number | string
  json2Value: string
}

export function generateReportHeaders(config: ReportConfig): string[] {
  const json1Label = config.json1Name || "JSON 1"
  const json2Label = config.json2Name || "JSON 2"

  const headers = ["Change Type", "JSON Path", "Key"]

  if (config.includeLineNumbers !== false) {
    headers.push(`${json1Label} Line`)
  }

  headers.push(`${json1Label} Value`)

  if (config.includeLineNumbers !== false) {
    headers.push(`${json2Label} Line`)
  }

  headers.push(`${json2Label} Value`)

  return headers
}

export function generateReportData(result: JsonComparisonResult, config: ReportConfig): ReportRow[] {
  const reportData: ReportRow[] = []

  result.differences.forEach((diff) => {
    const pathSegments = diff.path.split(".")
    const key = pathSegments[pathSegments.length - 1] || "root"

    // Create a separate row for each difference, even if they share the same path/key
    const row: ReportRow = {
      changeType: diff.type.charAt(0).toUpperCase() + diff.type.slice(1),
      jsonPath: diff.path,
      key,
      json1Line: diff.leftLine || "",
      json1Value: diff.type === "addition" ? "" : JSON.stringify(diff.oldValue),
      json2Line: diff.rightLine || "",
      json2Value: diff.type === "deletion" ? "" : JSON.stringify(diff.newValue),
    }

    reportData.push(row)
  })

  return reportData
}

export function generateSummaryData(result: JsonComparisonResult) {
  const { additions, deletions, modifications } = result.summary
  const totalDifferences = additions + deletions + modifications

  // Generate breakdown by top-level section
  const topLevelBreakdown: Record<string, { additions: number; deletions: number; modifications: number }> = {}

  result.differences.forEach((diff) => {
    const topLevelKey = diff.path.split(".")[0] || "root"

    if (!topLevelBreakdown[topLevelKey]) {
      topLevelBreakdown[topLevelKey] = {
        additions: 0,
        deletions: 0,
        modifications: 0,
      }
    }

    switch (diff.type) {
      case "addition":
        topLevelBreakdown[topLevelKey].additions++
        break
      case "deletion":
        topLevelBreakdown[topLevelKey].deletions++
        break
      case "modification":
        topLevelBreakdown[topLevelKey].modifications++
        break
    }
  })

  return {
    totalDifferences,
    additions,
    deletions,
    modifications,
    topLevelBreakdown,
  }
}
