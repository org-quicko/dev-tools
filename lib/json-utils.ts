import type { ComparisonSettings } from "@/types/comparison"

export function prettifyJson(jsonText: string, settings: ComparisonSettings): string {
  try {
    const parsed = JSON.parse(jsonText)
    const processed = settings.sortKeys ? sortObjectKeys(parsed) : parsed
    return JSON.stringify(processed, null, settings.indentation)
  } catch (error) {
    throw new Error("Invalid JSON: " + (error as Error).message)
  }
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === "object") {
    const sorted: any = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObjectKeys(obj[key])
      })
    return sorted
  }
  return obj
}

export function validateJsonSchema(json: string, schema: any): { valid: boolean; errors: string[] } {
  // This would integrate with a JSON schema validation library like Ajv
  // For now, returning a placeholder
  return { valid: true, errors: [] }
}
