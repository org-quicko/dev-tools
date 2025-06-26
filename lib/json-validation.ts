export interface ValidationResult {
  isValid: boolean
  error?: string
  lineNumber?: number
  columnNumber?: number
}

export function validateJson(jsonString: string): ValidationResult {
  if (!jsonString.trim()) {
    return { isValid: true } // Empty string is considered valid (no input)
  }

  try {
    JSON.parse(jsonString)
    return { isValid: true }
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Extract line and column information from error message
      const match = error.message.match(/at position (\d+)/)
      let lineNumber: number | undefined
      let columnNumber: number | undefined

      if (match) {
        const position = Number.parseInt(match[1])
        const lines = jsonString.substring(0, position).split("\n")
        lineNumber = lines.length
        columnNumber = lines[lines.length - 1].length + 1
      }

      return {
        isValid: false,
        error: error.message,
        lineNumber,
        columnNumber,
      }
    }

    return {
      isValid: false,
      error: "Unknown JSON parsing error",
    }
  }
}

export function getJsonExample(): string {
  return `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "isActive": true
}`
}

export function formatJsonError(error: string, lineNumber?: number, columnNumber?: number): string {
  let formattedError = error

  if (lineNumber && columnNumber) {
    formattedError += ` (Line ${lineNumber}, Column ${columnNumber})`
  } else if (lineNumber) {
    formattedError += ` (Line ${lineNumber})`
  }

  return formattedError
}
