"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, Table, FileSpreadsheet, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { exportToCsvUniversal, exportToCsvWithSummary } from "@/lib/csv-exporter"
import { exportToExcelUniversal } from "@/lib/excel-exporter"
import { exportToJson, exportToPdf } from "@/lib/export-utils"
import type { JsonComparisonResult } from "@/types/comparison"

interface ExportPanelProps {
  result: JsonComparisonResult
  json1: string
  json2: string
  json1Name?: string
  json2Name?: string
}

export function ExportPanel({ result, json1, json2, json1Name, json2Name }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "json" | "pdf">("csv")
  const [includeLineNumbers, setIncludeLineNumbers] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus({ type: null, message: "" })

    try {
      const config = {
        json1Name,
        json2Name,
        includeLineNumbers,
      }

      switch (exportFormat) {
        case "csv":
          try {
            if (includeSummary) {
              exportToCsvWithSummary(result, config)
            } else {
              exportToCsvUniversal(result, config)
            }
            setExportStatus({ type: "success", message: "CSV file downloaded successfully!" })
          } catch (error) {
            console.error("CSV export error:", error)
            setExportStatus({ type: "error", message: "CSV export failed. Please try again." })
          }
          break

        case "excel":
          try {
            await exportToExcelUniversal(result, config)
            setExportStatus({ type: "success", message: "Excel file downloaded successfully!" })
          } catch (error) {
            console.error("Excel export error:", error)
            const errorMessage = error instanceof Error ? error.message : "Excel export failed"
            setExportStatus({
              type: "error",
              message: `${errorMessage}. Try using CSV format as an alternative.`,
            })
          }
          break

        case "json":
          try {
            const exportData = {
              result,
              json1,
              json2,
              json1Name,
              json2Name,
              timestamp: new Date().toISOString(),
            }
            exportToJson(exportData)
            setExportStatus({ type: "success", message: "JSON file downloaded successfully!" })
          } catch (error) {
            console.error("JSON export error:", error)
            setExportStatus({ type: "error", message: "JSON export failed. Please try again." })
          }
          break

        case "pdf":
          try {
            const pdfData = {
              result,
              json1,
              json2,
              json1Name,
              json2Name,
              timestamp: new Date().toISOString(),
            }
            await exportToPdf(pdfData, json1Name, json2Name)
            setExportStatus({ type: "success", message: "PDF file downloaded successfully!" })
          } catch (error) {
            console.error("PDF export error:", error)
            setExportStatus({ type: "error", message: "PDF export failed. Please try again." })
          }
          break
      }
    } catch (error) {
      console.error("Export failed:", error)
      setExportStatus({ type: "error", message: "Export failed due to an unexpected error." })
    } finally {
      setIsExporting(false)

      // Clear status message after 5 seconds
      setTimeout(() => {
        setExportStatus({ type: null, message: "" })
      }, 5000)
    }
  }

  const getFormatIcon = () => {
    switch (exportFormat) {
      case "csv":
        return <Table className="h-4 w-4" />
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      case "json":
        return <FileText className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
    }
  }

  const getFormatDescription = () => {
    switch (exportFormat) {
      case "csv":
        return "Lightweight format ideal for raw data analysis and automation. Compatible with all spreadsheet applications."
      case "excel":
        return "Presentation-ready report with formatting, color coding, and multiple sheets. Best for review and sharing."
      case "json":
        return "Raw JSON format containing all comparison data and metadata. Ideal for programmatic processing."
      case "pdf":
        return "Human-readable text report suitable for documentation and archival purposes."
    }
  }

  const getPreviewFeatures = () => {
    const baseFeatures = ["One row per difference", "Full JSON path notation", "Proper value escaping"]

    switch (exportFormat) {
      case "csv":
        return [
          ...baseFeatures,
          includeSummary ? "Summary statistics included" : "Differences only",
          includeLineNumbers ? "Line number references" : "No line numbers",
          "Universal CSV format",
        ]
      case "excel":
        return [
          ...baseFeatures,
          "Color-coded change types",
          "Auto-fitted columns",
          "Summary sheet included",
          "Frozen header row",
          includeLineNumbers ? "Line number references" : "No line numbers",
        ]
      case "json":
        return [
          "Complete comparison metadata",
          "Original JSON files included",
          "Structured difference data",
          "Timestamp information",
        ]
      case "pdf":
        return ["Human-readable format", "Summary statistics", "Detailed change list", "File comparison metadata"]
    }
  }

  return (
    <TooltipProvider>
      <div className="popup-container max-h-[80vh] overflow-y-auto p-4">
        <div className="popup-content space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Export Comparison Report
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Generate universal, structured reports compatible with any JSON comparison scenario.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Alert */}
              {exportStatus.type && (
                <Alert variant={exportStatus.type === "error" ? "destructive" : "default"}>
                  {exportStatus.type === "error" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{exportStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          CSV Report
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          Excel Report (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          JSON Data
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF Report
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getFormatDescription()}</p>
                </div>

                {(exportFormat === "csv" || exportFormat === "excel") && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-sm">Report Options</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="line-numbers" className="text-sm">
                          Include Line Numbers
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Add line number references for easier navigation
                        </p>
                      </div>
                      <Switch id="line-numbers" checked={includeLineNumbers} onCheckedChange={setIncludeLineNumbers} />
                    </div>

                    {exportFormat === "csv" && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="summary" className="text-sm">
                            Include Summary Section
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Add statistics and breakdown at the top of the file
                          </p>
                        </div>
                        <Switch id="summary" checked={includeSummary} onCheckedChange={setIncludeSummary} />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    {getFormatIcon()}
                    Export Preview
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {getPreviewFeatures().map((feature, index) => (
                      <p key={index}>• {feature}</p>
                    ))}
                  </div>
                </div>

                <Button onClick={handleExport} disabled={isExporting} className="w-full" size="lg">
                  {getFormatIcon()}
                  <span className="ml-2">
                    {isExporting
                      ? `Exporting ${exportFormat.toUpperCase()}...`
                      : `Export as ${exportFormat.toUpperCase()}`}
                  </span>
                  <Download className={`h-4 w-4 ml-2 ${isExporting ? "animate-pulse" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Universal Format</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• One row per difference at unique JSON paths</p>
                    <p>• Supports nested objects, arrays, and complex structures</p>
                    <p>• Works with any JSON schema or format</p>
                    <p>• Proper escaping for special characters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">Column Structure:</h5>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Change Type (Addition/Deletion/Modification)</li>
                      <li>• JSON Path (dot notation)</li>
                      <li>• Key (last path segment)</li>
                      <li>• Line numbers (optional)</li>
                      <li>• Values from both JSON files</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Use Cases:</h5>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• API response comparison</li>
                      <li>• Configuration file auditing</li>
                      <li>• Data migration validation</li>
                      <li>• Version control analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {exportFormat === "excel" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Export Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Excel export requires modern browser support</p>
                  <p>• Large datasets may take longer to process</p>
                  <p>• If Excel export fails, CSV format provides the same data</p>
                  <p>• Ensure popup blockers are disabled for file downloads</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
