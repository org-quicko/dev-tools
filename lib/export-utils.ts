import type { JsonComparisonResult } from "@/types/comparison"

export function exportToJson(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  downloadFile(blob, "json-comparison-result.json")
}

export function exportToCsv(result: JsonComparisonResult, json1Name?: string, json2Name?: string) {
  const json1Label = json1Name ? json1Name.replace(/\.[^/.]+$/, "") : "JSON 1"
  const json2Label = json2Name ? json2Name.replace(/\.[^/.]+$/, "") : "JSON 2"

  const headers = [
    "Type",
    "Path",
    `${json1Label} Value`,
    `${json2Label} Value`,
    `${json1Label} Line`,
    `${json2Label} Line`,
  ]
  const rows = result.differences.map((diff) => [
    diff.type,
    diff.path,
    diff.oldValue ? JSON.stringify(diff.oldValue) : "",
    diff.newValue ? JSON.stringify(diff.newValue) : "",
    diff.leftLine?.toString() || "",
    diff.rightLine?.toString() || "",
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  downloadFile(blob, "json-comparison-result.csv")
}

export async function exportToPdf(data: any, json1Name?: string, json2Name?: string) {
  const json1Label = json1Name ? json1Name.replace(/\.[^/.]+$/, "") : "JSON 1"
  const json2Label = json2Name ? json2Name.replace(/\.[^/.]+$/, "") : "JSON 2"

  const content = `JSON Comparison Report
Generated: ${new Date().toLocaleString()}

Files Compared:
- ${json1Label}
- ${json2Label}

Summary:
- Additions: ${data.result.summary.additions}
- Deletions: ${data.result.summary.deletions}
- Modifications: ${data.result.summary.modifications}

Detailed Changes:
${data.result.differences
  .map((diff: any) => {
    const leftLabel = `${json1Label}${diff.leftLine ? ` (Line ${diff.leftLine})` : ""}`
    const rightLabel = `${json2Label}${diff.rightLine ? ` (Line ${diff.rightLine})` : ""}`
    return `${diff.type.toUpperCase()}: ${diff.path}
  ${leftLabel}: ${diff.oldValue || "N/A"}
  ${rightLabel}: ${diff.newValue || "N/A"}`
  })
  .join("\n\n")}
`

  const blob = new Blob([content], { type: "text/plain" })
  downloadFile(blob, "json-comparison-report.txt")
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
