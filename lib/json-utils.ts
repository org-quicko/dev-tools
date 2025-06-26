export function prettifyJson(jsonString: string, settings: { indentation: number; sortKeys: boolean }): string {
  try {
    // Parse the JSON string
    const parsed = JSON.parse(jsonString)

    // Create a replacer function for sorting keys if needed
    const replacer = settings.sortKeys
      ? (key: string, value: any) => {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            const sortedObj: any = {}
            Object.keys(value)
              .sort()
              .forEach((k) => {
                sortedObj[k] = value[k]
              })
            return sortedObj
          }
          return value
        }
      : null

    // Stringify with proper indentation
    return JSON.stringify(parsed, replacer, settings.indentation)
  } catch (error) {
    throw new Error("Invalid JSON format")
  }
}

export function minifyJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed)
  } catch (error) {
    throw new Error("Invalid JSON format")
  }
}

export function validateJson(jsonString: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    }
  }
}
