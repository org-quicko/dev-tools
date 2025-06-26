import type { JsonComparisonResult } from "@/types/comparison"
import { generateReportData, generateReportHeaders, generateSummaryData, type ReportConfig } from "./report-generator"

export async function exportToExcelUniversal(result: JsonComparisonResult, config: ReportConfig = {}): Promise<void> {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("Excel export not available in server environment")
    }

    // Try to import ExcelJS with better error handling
    let ExcelJS: any
    try {
      ExcelJS = await import("exceljs")

      // Check if the import was successful and has the expected structure
      if (!ExcelJS || !ExcelJS.Workbook) {
        // Try default export
        if (ExcelJS.default && ExcelJS.default.Workbook) {
          ExcelJS = ExcelJS.default
        } else {
          throw new Error("ExcelJS Workbook not found in import")
        }
      }
    } catch (importError) {
      console.error("ExcelJS import failed:", importError)
      throw new Error("Excel library could not be loaded. Please try CSV format instead.")
    }

    // Create workbook instance
    let workbook: any
    try {
      workbook = new ExcelJS.Workbook()

      // Verify workbook was created successfully
      if (!workbook || typeof workbook.addWorksheet !== "function") {
        throw new Error("Failed to create Excel workbook")
      }
    } catch (workbookError) {
      console.error("Workbook creation failed:", workbookError)
      throw new Error("Failed to initialize Excel workbook. Please try CSV format.")
    }

    // Set workbook properties
    try {
      workbook.creator = "JSON Compare Tool"
      workbook.created = new Date()
      workbook.modified = new Date()
      workbook.lastPrinted = new Date()

      // Add custom properties
      workbook.properties.company = "Dev Tools"
      workbook.properties.title = "JSON Comparison Report"
      workbook.properties.subject = "Comparison of JSON files"
      workbook.properties.keywords = "json, comparison, report"
    } catch (propsError) {
      console.warn("Could not set workbook properties:", propsError)
      // Continue without properties
    }

    // Create sheets - Summary first, then Comparison Report
    try {
      await createSummarySheet(workbook, result, config, ExcelJS) // Summary sheet first
      await createComparisonSheet(workbook, result, config, ExcelJS) // Comparison Report second
    } catch (sheetError) {
      console.error("Sheet creation failed:", sheetError)
      throw new Error("Failed to create Excel sheets. Please try CSV format.")
    }

    // Generate and download file
    try {
      const buffer = await workbook.xlsx.writeBuffer()

      if (!buffer || buffer.byteLength === 0) {
        throw new Error("Generated Excel file is empty")
      }

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const fileName = generateFileName("xlsx", config)
      await downloadExcelFile(blob, fileName)
    } catch (bufferError) {
      console.error("Buffer generation failed:", bufferError)
      throw new Error("Failed to generate Excel file. Please try CSV format.")
    }
  } catch (error) {
    console.error("Excel export failed:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("library") || error.message.includes("import") || error.message.includes("ExcelJS")) {
        throw new Error("Excel library not available. Please try CSV format.")
      } else if (error.message.includes("buffer") || error.message.includes("generate")) {
        throw new Error("Failed to generate Excel file. Please try with smaller data or CSV format.")
      } else if (error.message.includes("workbook") || error.message.includes("sheet")) {
        throw new Error("Excel processing failed. Please try CSV format.")
      } else {
        throw new Error(`Excel export failed: ${error.message}`)
      }
    } else {
      throw new Error("Excel export failed due to unknown error. Please try CSV format.")
    }
  }
}

async function createComparisonSheet(
  workbook: any,
  result: JsonComparisonResult,
  config: ReportConfig,
  ExcelJS: any,
): Promise<void> {
  try {
    // Validate inputs
    if (!workbook || typeof workbook.addWorksheet !== "function") {
      throw new Error("Invalid workbook provided")
    }

    if (!result || !result.differences) {
      throw new Error("Invalid comparison result")
    }

    const worksheet = workbook.addWorksheet("Comparison Report")
    // Pass includeLineNumbers: false to generateReportData to exclude line numbers
    const reportData = generateReportData(result, { ...config, includeLineNumbers: false })
    // Pass includeLineNumbers: false to generateReportHeaders to exclude line numbers
    const headers = generateReportHeaders({ ...config, includeLineNumbers: false })

    // Validate data
    if (!reportData || reportData.length === 0) {
      // Create a worksheet with just headers if no data
      worksheet.addRow(headers)
      return
    }

    // Add headers first
    const headerRow = worksheet.addRow(headers)

    // Style header row with error handling
    try {
      headerRow.eachCell((cell: any, colNumber: number) => {
        if (cell && typeof cell === "object") {
          cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 }
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "2C3E50" }, // Darker blue-gray color for a more professional look
          }
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          }
          cell.border = {
            top: { style: "thin", color: { argb: "FFFFFF" } },
            left: { style: "thin", color: { argb: "FFFFFF" } },
            bottom: { style: "thin", color: { argb: "FFFFFF" } },
            right: { style: "thin", color: { argb: "FFFFFF" } },
          }
        }
      })
      if (headerRow && typeof headerRow === "object") {
        headerRow.height = 30 // Fixed height for header row
      }
    } catch (styleError) {
      console.warn("Header styling failed, continuing with basic formatting:", styleError)
    }

    // Add data rows
    reportData.forEach((row, index) => {
      try {
        // Construct dataRow based on headers generated without line numbers
        const dataRow: (string | number)[] = [row.changeType, row.jsonPath, row.key, row.json1Value, row.json2Value]

        const excelRow = worksheet.addRow(dataRow)

        // Apply minimal styling with error handling
        try {
          if (excelRow && typeof excelRow === "object") {
            // Use very subtle background colors based on change type
            const changeType = row.changeType.toLowerCase()
            let fillColor = "FFFFFF" // Default white

            // Apply very subtle background colors
            switch (changeType) {
              case "addition":
                fillColor = "F9FCFA" // Very light green
                break
              case "deletion":
                fillColor = "FCFAFA" // Very light red
                break
              case "modification":
                fillColor = "FAFCFE" // Very light blue
                break
            }

            excelRow.eachCell((cell: any) => {
              if (cell && typeof cell === "object") {
                // Apply minimal styling
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: fillColor },
                }
                cell.alignment = {
                  vertical: "top",
                  wrapText: true, // Ensure text wrapping
                }
                cell.border = {
                  top: { style: "thin", color: { argb: "F0F0F0" } },
                  left: { style: "thin", color: { argb: "F0F0F0" } },
                  bottom: { style: "thin", color: { argb: "F0F0F0" } },
                  right: { style: "thin", color: { argb: "F0F0F0" } },
                }
                cell.font = { size: 10, name: "Calibri" }
              }
            })

            // Ensure row has a minimum height and auto-adjusts for wrapped text
            // ExcelJS handles auto-height when wrapText is true, so setting a minimum is sufficient.
            excelRow.height = Math.max(20, excelRow.height || 0) // Minimum height of 20
          }
        } catch (rowStyleError) {
          console.warn(`Row ${index} styling failed, continuing:`, rowStyleError)
        }
      } catch (rowError) {
        console.warn(`Failed to add row ${index}, skipping:`, rowError)
      }
    })

    // Add auto-filter with error handling
    try {
      if (worksheet.autoFilter !== undefined) {
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: reportData.length + 1, column: headers.length },
        }
      }
    } catch (filterError) {
      console.warn("Auto-filter setup failed:", filterError)
    }

    // Freeze header row with error handling
    try {
      if (worksheet.views !== undefined) {
        worksheet.views = [{ state: "frozen", ySplit: 1 }]
      }
    } catch (freezeError) {
      console.warn("Header freeze failed:", freezeError)
    }

    // Calculate column widths based on content with max 50px
    try {
      // First pass: get max content length for each column
      const columnWidths = new Array(headers.length).fill(0)

      // Start with headers
      headers.forEach((header, i) => {
        columnWidths[i] = Math.max(columnWidths[i], header.length)
      })

      // Then check data
      reportData.forEach((row) => {
        const rowData = [row.changeType, row.jsonPath, row.key, row.json1Value, row.json2Value]

        rowData.forEach((cell, i) => {
          if (i < columnWidths.length) {
            const cellStr = String(cell || "")
            // Limit the calculation to avoid excessive width
            const effectiveLength = Math.min(100, cellStr.length) // Use 100 for calculation, then cap at 50 for final width
            columnWidths[i] = Math.max(columnWidths[i], effectiveLength)
          }
        })
      })

      // Apply calculated widths with some padding and max 50px
      worksheet.columns.forEach((column: any, i: number) => {
        if (i < columnWidths.length) {
          // Convert character count to approximate column width
          // Add padding and ensure minimum width, then cap at 50
          column.width = Math.min(50, Math.max(10, columnWidths[i] * 1.2))
        }
      })
    } catch (widthError) {
      console.warn("Column width calculation failed:", widthError)
    }
  } catch (error) {
    console.error("Comparison sheet creation failed:", error)
    throw new Error("Failed to create comparison sheet")
  }
}

async function createSummarySheet(
  workbook: any,
  result: JsonComparisonResult,
  config: ReportConfig,
  ExcelJS: any,
): Promise<void> {
  try {
    const worksheet = workbook.addWorksheet("Summary")
    const summaryData = generateSummaryData(result)

    let currentRow = 1

    // Add content with error handling
    try {
      // Title
      const titleCell = worksheet.getCell(currentRow, 1)
      titleCell.value = "JSON Comparison Report Summary"
      titleCell.font = { bold: true, size: 16, color: { argb: "2C3E50" } }
      currentRow += 2

      // Metadata
      worksheet.getCell(currentRow, 1).value = "Generated:"
      worksheet.getCell(currentRow, 2).value = new Date().toLocaleString()
      currentRow++

      if (config.json1Name) {
        worksheet.getCell(currentRow, 1).value = "JSON 1:"
        worksheet.getCell(currentRow, 2).value = config.json1Name
        currentRow++
      }

      if (config.json2Name) {
        worksheet.getCell(currentRow, 1).value = "JSON 2:"
        worksheet.getCell(currentRow, 2).value = config.json2Name
        currentRow++
      }

      currentRow += 2

      // Overall statistics
      const statsHeaderCell = worksheet.getCell(currentRow, 1)
      statsHeaderCell.value = "Overall Statistics"
      statsHeaderCell.font = { bold: true, size: 14 }
      currentRow++

      const statsData = [
        ["Total Differences", summaryData.totalDifferences],
        ["Additions", summaryData.additions],
        ["Deletions", summaryData.deletions],
        ["Modifications", summaryData.modifications],
      ]

      statsData.forEach(([label, value]) => {
        worksheet.getCell(currentRow, 1).value = label
        worksheet.getCell(currentRow, 2).value = value
        worksheet.getCell(currentRow, 1).font = { bold: true }
        currentRow++
      })

      currentRow += 2

      // Top-level breakdown
      const breakdownHeaderCell = worksheet.getCell(currentRow, 1)
      breakdownHeaderCell.value = "Breakdown by Top-Level Section"
      breakdownHeaderCell.font = { bold: true, size: 14 }
      currentRow++

      // Breakdown table headers
      const breakdownHeaders = ["Section", "Additions", "Deletions", "Modifications", "Total"]
      breakdownHeaders.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1)
        cell.value = header
        cell.font = { bold: true }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F0F0F0" },
        }
      })
      currentRow++

      // Breakdown data
      Object.entries(summaryData.topLevelBreakdown).forEach(([section, counts]) => {
        const total = counts.additions + counts.deletions + counts.modifications
        const rowData = [section, counts.additions, counts.deletions, counts.modifications, total]

        rowData.forEach((value, index) => {
          worksheet.getCell(currentRow, index + 1).value = value
        })
        currentRow++
      })

      // Calculate column widths based on content
      const columnWidths = [0, 0, 0, 0, 0] // For the 5 columns in the breakdown table

      // Check headers
      breakdownHeaders.forEach((header, i) => {
        columnWidths[i] = Math.max(columnWidths[i], header.length)
      })

      // Check section names and values
      Object.entries(summaryData.topLevelBreakdown).forEach(([section, counts]) => {
        columnWidths[0] = Math.max(columnWidths[0], section.length)
        // Other columns are numbers, so they won't be very wide
      })

      // Apply calculated widths with some padding
      for (let i = 0; i < columnWidths.length; i++) {
        if (columnWidths[i] > 0) {
          worksheet.getColumn(i + 1).width = Math.max(10, Math.min(50, columnWidths[i] * 1.2))
        }
      }

      // Set minimum row height for all rows
      for (let i = 1; i <= currentRow; i++) {
        const row = worksheet.getRow(i)
        row.height = Math.max(20, row.height || 0)
      }
    } catch (contentError) {
      console.warn("Summary content creation failed:", contentError)
      // Add basic content as fallback
      worksheet.getCell(1, 1).value = "Summary data could not be formatted properly"
    }
  } catch (error) {
    console.error("Summary sheet creation failed:", error)
    // Don't throw here, summary sheet is optional
    console.warn("Continuing without summary sheet")
  }
}

async function downloadExcelFile(blob: Blob, fileName: string): Promise<void> {
  try {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("File download not available in server environment")
    }

    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error("Invalid or empty file generated")
    }

    // Try modern download approach first
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // IE/Edge fallback
      ;(window.navigator as any).msSaveOrOpenBlob(blob, fileName)
      return
    }

    // Modern browsers
    const url = URL.createObjectURL(blob)

    try {
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.style.display = "none"

      // Add to DOM, click, and remove
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Clean up URL object after a short delay
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url)
        } catch (cleanupError) {
          console.warn("URL cleanup failed:", cleanupError)
        }
      }, 100)
    } catch (downloadError) {
      URL.revokeObjectURL(url)
      throw downloadError
    }
  } catch (error) {
    console.error("File download failed:", error)
    throw new Error("Failed to download Excel file. Please check your browser settings and try again.")
  }
}

function generateFileName(extension: string, config: ReportConfig, suffix?: string): string {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
    const baseName = "json-comparison-report"
    const suffixPart = suffix ? `-${suffix}` : ""

    if (config.json1Name && config.json2Name) {
      const name1 = config.json1Name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-")
      const name2 = config.json2Name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-")
      // Output file name should be JSON Name 1 vs JSON Name 2
      return `${name1}-vs-${name2}${suffixPart}-${timestamp}.${extension}`
    }

    return `${baseName}${suffixPart}-${timestamp}.${extension}`
  } catch (error) {
    console.warn("Filename generation failed, using fallback:", error)
    return `json-comparison-report-${Date.now()}.${extension}`
  }
}
