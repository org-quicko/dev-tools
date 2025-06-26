import Ajv, { type ErrorObject } from "ajv"
import addFormats from "ajv-formats"
import addKeywords from "ajv-keywords"

export interface ValidationError {
  instancePath: string
  schemaPath: string
  keyword: string
  params: any
  message: string
  lineNumber?: number
  columnNumber?: number
  severity: "error" | "warning"
  category: "required" | "type" | "format" | "pattern" | "enum" | "constraint" | "reference" | "custom"
  suggestion?: string
  affectedValue?: any
  expectedValue?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  summary: {
    totalErrors: number
    totalWarnings: number
    errorsByCategory: Record<string, number>
  }
}

export interface ValidatorOptions {
  strict?: boolean
  allErrors?: boolean
  verbose?: boolean
  removeAdditional?: boolean | "all" | "failing"
  useDefaults?: boolean
  coerceTypes?: boolean | "array"
  allowUnionTypes?: boolean
  allowMatchingProperties?: boolean
}

export class JsonSchemaValidator {
  private ajv: Ajv
  private jsonLines: string[] = []
  private schemaLines: string[] = []

  constructor(options: ValidatorOptions = {}) {
    this.ajv = new Ajv({
      allErrors: options.allErrors ?? true,
      verbose: options.verbose ?? true,
      strict: options.strict ?? false,
      removeAdditional: options.removeAdditional ?? false,
      useDefaults: options.useDefaults ?? false,
      coerceTypes: options.coerceTypes ?? false,
      allowUnionTypes: options.allowUnionTypes ?? true,
      allowMatchingProperties: options.allowMatchingProperties ?? true,
      loadSchema: this.loadExternalSchema.bind(this),
    })

    // Add format validators
    addFormats(this.ajv)

    // Add additional keywords
    addKeywords(this.ajv)

    // Add custom formats
    this.addCustomFormats()
  }

  private addCustomFormats() {
    // Custom date formats
    this.ajv.addFormat("date-time-iso", {
      type: "string",
      validate: (dateTimeString: string) => {
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
        return iso8601Regex.test(dateTimeString) && !isNaN(Date.parse(dateTimeString))
      },
    })

    this.ajv.addFormat("phone", {
      type: "string",
      validate: (phone: string) => {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
        return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
      },
    })

    this.ajv.addFormat("credit-card", {
      type: "string",
      validate: (cardNumber: string) => {
        const cleaned = cardNumber.replace(/\s/g, "")
        const cardRegex = /^\d{13,19}$/
        return cardRegex.test(cleaned)
      },
    })

    this.ajv.addFormat("postal-code", {
      type: "string",
      validate: (postalCode: string) => {
        // Support various postal code formats
        const patterns = [
          /^\d{5}(-\d{4})?$/, // US ZIP
          /^[A-Z]\d[A-Z] \d[A-Z]\d$/, // Canadian
          /^\d{4,5}$/, // European
          /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/, // UK
        ]
        return patterns.some((pattern) => pattern.test(postalCode))
      },
    })
  }

  private async loadExternalSchema(uri: string): Promise<any> {
    // For security and simplicity, we'll only support local references
    // In a production environment, you might want to implement proper URI resolution
    throw new Error(`External schema loading not supported: ${uri}`)
  }

  public async validate(jsonData: string, schemaData: string): Promise<ValidationResult> {
    try {
      // Store lines for error reporting
      this.jsonLines = jsonData.split("\n")
      this.schemaLines = schemaData.split("\n")

      // Parse JSON data
      let parsedJson: any
      try {
        parsedJson = JSON.parse(jsonData)
      } catch (error) {
        return this.createParseErrorResult("JSON data", error as Error)
      }

      // Parse schema
      let parsedSchema: any
      try {
        parsedSchema = JSON.parse(schemaData)
      } catch (error) {
        return this.createParseErrorResult("JSON schema", error as Error)
      }

      // Compile schema
      let validate: any
      try {
        validate = this.ajv.compile(parsedSchema)
      } catch (error) {
        return this.createSchemaCompilationErrorResult(error as Error)
      }

      // Validate data
      const isValid = validate(parsedJson)
      const errors: ValidationError[] = []
      const warnings: ValidationError[] = []

      if (!isValid && validate.errors) {
        for (const error of validate.errors) {
          const enhancedError = this.enhanceError(error, parsedJson, parsedSchema)
          if (enhancedError.severity === "error") {
            errors.push(enhancedError)
          } else {
            warnings.push(enhancedError)
          }
        }
      }

      // Create summary
      const errorsByCategory = this.categorizeErrors([...errors, ...warnings])

      return {
        isValid,
        errors,
        warnings,
        summary: {
          totalErrors: errors.length,
          totalWarnings: warnings.length,
          errorsByCategory,
        },
      }
    } catch (error) {
      return this.createUnexpectedErrorResult(error as Error)
    }
  }

  private createParseErrorResult(type: string, error: Error): ValidationResult {
    const parseError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "parse",
      params: {},
      message: `Failed to parse ${type}: ${error.message}`,
      severity: "error",
      category: "custom",
      suggestion: `Please check the ${type} syntax and ensure it's valid JSON`,
    }

    return {
      isValid: false,
      errors: [parseError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { custom: 1 },
      },
    }
  }

  private createSchemaCompilationErrorResult(error: Error): ValidationResult {
    const compilationError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "schema",
      params: {},
      message: `Schema compilation failed: ${error.message}`,
      severity: "error",
      category: "reference",
      suggestion: "Please check the schema syntax and ensure all references are valid",
    }

    return {
      isValid: false,
      errors: [compilationError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { reference: 1 },
      },
    }
  }

  private createUnexpectedErrorResult(error: Error): ValidationResult {
    const unexpectedError: ValidationError = {
      instancePath: "",
      schemaPath: "",
      keyword: "unexpected",
      params: {},
      message: `Unexpected validation error: ${error.message}`,
      severity: "error",
      category: "custom",
      suggestion: "Please check both JSON data and schema for any syntax issues",
    }

    return {
      isValid: false,
      errors: [unexpectedError],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        errorsByCategory: { custom: 1 },
      },
    }
  }

  private enhanceError(error: ErrorObject, jsonData: any, schema: any): ValidationError {
    const lineInfo = this.getLineAndColumn(error.instancePath)
    const category = this.categorizeError(error)
    const severity = this.determineSeverity(error)
    const suggestion = this.generateSuggestion(error, jsonData, schema)
    const { affectedValue, expectedValue } = this.getValueInfo(error, jsonData, schema)

    return {
      instancePath: error.instancePath || "root",
      schemaPath: error.schemaPath,
      keyword: error.keyword,
      params: error.params || {},
      message: this.enhanceErrorMessage(error, jsonData, schema),
      lineNumber: lineInfo.line,
      columnNumber: lineInfo.column,
      severity,
      category,
      suggestion,
      affectedValue,
      expectedValue,
    }
  }

  private getLineAndColumn(instancePath: string): { line?: number; column?: number } {
    if (!instancePath || instancePath === "") {
      return { line: 1, column: 1 }
    }

    try {
      // Convert JSON pointer to property path
      const pathParts = instancePath.split("/").filter((part) => part !== "")

      // Search for the path in JSON lines
      for (let i = 0; i < this.jsonLines.length; i++) {
        const line = this.jsonLines[i]

        // Look for the last part of the path (the property name)
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1]

          // Check if this line contains the property
          if (line.includes(`"${lastPart}"`)) {
            const column = line.indexOf(`"${lastPart}"`) + 1
            return { line: i + 1, column }
          }

          // For array indices
          if (/^\d+$/.test(lastPart)) {
            // Look for array context
            const arrayPattern = new RegExp(`\\[\\s*${lastPart}\\s*\\]|\\[.*?\\]`)
            if (arrayPattern.test(line)) {
              return { line: i + 1, column: 1 }
            }
          }
        }
      }

      // Fallback: search for any part of the path
      for (const part of pathParts.reverse()) {
        for (let i = 0; i < this.jsonLines.length; i++) {
          if (this.jsonLines[i].includes(`"${part}"`)) {
            return { line: i + 1, column: 1 }
          }
        }
      }
    } catch (error) {
      console.warn("Could not determine line number:", error)
    }

    return { line: 1, column: 1 }
  }

  private categorizeError(error: ErrorObject): ValidationError["category"] {
    switch (error.keyword) {
      case "required":
        return "required"
      case "type":
        return "type"
      case "format":
        return "format"
      case "pattern":
        return "pattern"
      case "enum":
        return "enum"
      case "$ref":
      case "additionalProperties":
        return "reference"
      case "minimum":
      case "maximum":
      case "minLength":
      case "maxLength":
      case "minItems":
      case "maxItems":
      case "minProperties":
      case "maxProperties":
        return "constraint"
      default:
        return "custom"
    }
  }

  private determineSeverity(error: ErrorObject): "error" | "warning" {
    // Most validation errors are actual errors
    // You could implement logic to determine warnings vs errors based on your needs
    const warningKeywords = ["additionalProperties"]
    return warningKeywords.includes(error.keyword) ? "warning" : "error"
  }

  private enhanceErrorMessage(error: ErrorObject, jsonData: any, schema: any): string {
    const path = error.instancePath || "root"
    const { keyword, params } = error

    switch (keyword) {
      case "required":
        return `Required field '${params.missingProperty}' is missing at ${path}`

      case "type":
        const actualType = Array.isArray(params.data) ? "array" : typeof params.data
        return `Field at '${path}' should be of type '${params.type}' but found '${actualType}'`

      case "format":
        return `Field at '${path}' does not match the required format '${params.format}'`

      case "pattern":
        return `Field at '${path}' does not match the required pattern`

      case "enum":
        const allowedValues = params.allowedValues?.join(", ") || "specified values"
        return `Field at '${path}' must be one of: ${allowedValues}`

      case "minimum":
        return `Field at '${path}' must be >= ${params.limit} but found ${params.data}`

      case "maximum":
        return `Field at '${path}' must be <= ${params.limit} but found ${params.data}`

      case "minLength":
        return `Field at '${path}' must be at least ${params.limit} characters long`

      case "maxLength":
        return `Field at '${path}' must be at most ${params.limit} characters long`

      case "minItems":
        return `Array at '${path}' must have at least ${params.limit} items`

      case "maxItems":
        return `Array at '${path}' must have at most ${params.limit} items`

      case "additionalProperties":
        return `Additional property '${params.additionalProperty}' is not allowed at '${path}'`

      case "$ref":
        return `Unable to resolve reference '${params.ref}'. Definition missing or incorrect`

      default:
        return error.message || `Validation error at '${path}'`
    }
  }

  private generateSuggestion(error: ErrorObject, jsonData: any, schema: any): string {
    const { keyword, params } = error

    switch (keyword) {
      case "required":
        return `Add the required field '${params.missingProperty}' to your JSON data`

      case "type":
        return `Change the value to type '${params.type}' or update the schema to allow '${typeof params.data}'`

      case "format":
        return this.getFormatSuggestion(params.format)

      case "pattern":
        return "Ensure the value matches the specified regular expression pattern"

      case "enum":
        const values = params.allowedValues?.join(", ") || "allowed values"
        return `Use one of these values: ${values}`

      case "minimum":
        return `Increase the value to be at least ${params.limit}`

      case "maximum":
        return `Decrease the value to be at most ${params.limit}`

      case "minLength":
        return `Add more characters to reach the minimum length of ${params.limit}`

      case "maxLength":
        return `Remove characters to stay within the maximum length of ${params.limit}`

      case "additionalProperties":
        return `Remove the '${params.additionalProperty}' property or update the schema to allow additional properties`

      case "$ref":
        return `Check that the reference '${params.ref}' points to a valid schema definition`

      default:
        return "Review the schema requirements and adjust your JSON data accordingly"
    }
  }

  private getFormatSuggestion(format: string): string {
    switch (format) {
      case "email":
        return "Use a valid email format like 'user@example.com'"
      case "date":
        return "Use ISO date format like '2024-01-15'"
      case "date-time":
        return "Use ISO date-time format like '2024-01-15T10:30:00Z'"
      case "time":
        return "Use time format like '10:30:00'"
      case "uri":
        return "Use a valid URI format like 'https://example.com'"
      case "uuid":
        return "Use a valid UUID format like '123e4567-e89b-12d3-a456-426614174000'"
      case "ipv4":
        return "Use a valid IPv4 address like '192.168.1.1'"
      case "ipv6":
        return "Use a valid IPv6 address"
      case "phone":
        return "Use a valid phone number format like '+1234567890'"
      case "credit-card":
        return "Use a valid credit card number format"
      case "postal-code":
        return "Use a valid postal code format for your region"
      default:
        return `Ensure the value matches the '${format}' format requirements`
    }
  }

  private getValueInfo(
    error: ErrorObject,
    jsonData: any,
    schema: any,
  ): {
    affectedValue?: any
    expectedValue?: any
  } {
    try {
      const path = error.instancePath
      let affectedValue: any

      if (path) {
        // Navigate to the affected value in JSON data
        const pathParts = path.split("/").filter((part) => part !== "")
        affectedValue = pathParts.reduce((obj, part) => {
          if (obj && typeof obj === "object") {
            return obj[part] || obj[Number.parseInt(part)]
          }
          return undefined
        }, jsonData)
      } else {
        affectedValue = jsonData
      }

      // Get expected value from schema if possible
      let expectedValue: any
      if (error.keyword === "enum" && error.params?.allowedValues) {
        expectedValue = error.params.allowedValues
      } else if (error.keyword === "type" && error.params?.type) {
        expectedValue = `type: ${error.params.type}`
      }

      return { affectedValue, expectedValue }
    } catch (err) {
      return {}
    }
  }

  private categorizeErrors(errors: ValidationError[]): Record<string, number> {
    const categories: Record<string, number> = {}

    for (const error of errors) {
      categories[error.category] = (categories[error.category] || 0) + 1
    }

    return categories
  }
}
