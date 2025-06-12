import Papa from "papaparse"
import type { JsonComparisonResult } from "@/types/comparison"
import { generateReportData, generateReportHeaders, generateSummaryData, type ReportConfig } from "./report-generator"

export function exportToCsvUniversal(result: JsonComparisonResult, config: ReportConfig = {}): void {
  const reportData = generateReportData(result, config)
  const headers = generateReportHeaders(config)

  // Convert report data to CSV format
  const csvData = reportData.map((row) => {
    const csvRow: (string | number)[] = [row.changeType, row.jsonPath, row.key]

    if (config.includeLineNumbers !== false) {
      csvRow.push(row.json1Line || "")
    }

    csvRow.push(row.json1Value)

    if (config.includeLineNumbers !== false) {
      csvRow.push(row.json2Line || "")
    }

    csvRow.push(row.json2Value)

    return csvRow
  })

  // Add headers as first row
  const fullData = [headers, ...csvData]

  // Generate CSV with proper escaping
  const csv = Papa.unparse(fullData, {
    quotes: true, // Always quote fields to handle commas and special characters
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: false, // We're manually adding headers
    newline: "\r\n", // Windows-compatible line endings
  })

  // Create and download file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  downloadFile(blob, generateFileName("csv", config))
}

export function exportToCsvWithSummary(result: JsonComparisonResult, config: ReportConfig = {}): void {
  const summaryData = generateSummaryData(result)
  const reportData = generateReportData(result, config)
  const headers = generateReportHeaders(config)

  // Create summary section
  const summarySection = [
    ["JSON Comparison Report Summary"],
    ["Generated", new Date().toLocaleString()],
    [""],
    ["Overall Statistics"],
    ["Total Differences", summaryData.totalDifferences],
    ["Additions", summaryData.additions],
    ["Deletions", summaryData.deletions],
    ["Modifications", summaryData.modifications],
    [""],
    ["Breakdown by Top-Level Section"],
    ["Section", "Additions", "Deletions", "Modifications", "Total"],
  ]

  // Add top-level breakdown
  Object.entries(summaryData.topLevelBreakdown).forEach(([section, counts]) => {
    const total = counts.additions + counts.deletions + counts.modifications
    summarySection.push([section, counts.additions, counts.deletions, counts.modifications, total])
  })

  // Add separator and detailed differences
  summarySection.push([""], ["Detailed Differences"], headers)

  // Convert report data to CSV format
  const csvData = reportData.map((row) => {
    const csvRow: (string | number)[] = [row.changeType, row.jsonPath, row.key]

    if (config.includeLineNumbers !== false) {
      csvRow.push(row.json1Line || "")
    }

    csvRow.push(row.json1Value)

    if (config.includeLineNumbers !== false) {
      csvRow.push(row.json2Line || "")
    }

    csvRow.push(row.json2Value)

    return csvRow
  })

  // Combine all data
  const fullData = [...summarySection, ...csvData]

  // Generate CSV
  const csv = Papa.unparse(fullData, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: false,
    newline: "\r\n",
  })

  // Create and download file
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  downloadFile(blob, generateFileName("csv", config, "detailed"))
}

function generateFileName(extension: string, config: ReportConfig, suffix?: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
  const baseName = "json-comparison-report"
  const suffixPart = suffix ? `-${suffix}` : ""

  if (config.json1Name && config.json2Name) {
    const name1 = config.json1Name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-")
    const name2 = config.json2Name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-")
    return `${baseName}-${name1}-vs-${name2}${suffixPart}-${timestamp}.${extension}`
  }

  return `${baseName}${suffixPart}-${timestamp}.${extension}`
}

function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
